import io
import base64
from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, Bill, Purchase, PurchaseItem, Product, Category, 
    InventoryBatch, StockMovement, Expense, MonthlyBudget, Notification
)
from app.schemas import OCRScanResult, BillConfirmRequest, BillOut
from app.auth import get_current_user
from app.ocr import process_bill_ocr

router = APIRouter(prefix="/bills", tags=["Bills & OCR"])

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf"
}

@router.post("/upload")
async def upload_bill(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload JPG, PNG, WEBP or PDF."
        )

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowable limit of 10MB."
        )

    # Process OCR & structuring
    ocr_result = process_bill_ocr(file_bytes, file.filename)
    
    # Enrich with category IDs from database
    categories = db.query(Category).all()
    cat_map = {c.name.lower(): c.category_id for c in categories}
    default_cat_id = cat_map.get("other", 11)

    enriched_items = []
    for it in ocr_result.get("items", []):
        cat_name = it.get("category_name", "Other").lower()
        c_id = cat_map.get(cat_name, default_cat_id)
        enriched_items.append({
            **it,
            "category_id": c_id,
            "category_name": it.get("category_name", "Other")
        })

    # Return base64 for frontend side-by-side preview
    b64_image = base64.b64encode(file_bytes).decode("utf-8")
    mime = file.content_type or "image/jpeg"
    image_preview_url = f"data:{mime};base64,{b64_image}"

    return {
        "scan_data": {
            **ocr_result,
            "items": enriched_items
        },
        "image_preview": image_preview_url,
        "mime_type": mime,
        "file_name": file.filename
    }

@router.post("/confirm", status_code=status.HTTP_201_CREATED)
def confirm_bill(
    req: BillConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atomic SQL Transaction:
    1. Stores original bill image in MySQL BLOB + raw OCR text in `bills`.
    2. Creates purchase record in `purchases`.
    3. Creates purchase line items in `purchase_items`.
    4. Updates product stock (or inserts new product) in `products`.
    5. Creates individual batch with expiry date in `inventory_batches`.
    6. Logs audit record in `stock_movements`.
    7. Creates financial entry in `expenses`.
    8. Checks monthly budget and fires notifications if exceeded.
    """
    uid = current_user.user_id

    # 1. Decode image BLOB if provided
    image_blob = None
    if req.bill_image_base64:
        try:
            # Handle data:image/...;base64, prefix if present
            raw_b64 = req.bill_image_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            image_blob = base64.b64decode(raw_b64)
        except Exception:
            image_blob = None

    try:
        # Check for potential duplicate bill within 24 hours
        existing_bill = db.query(Bill).filter(
            Bill.user_id == uid,
            Bill.store_name == req.store_name,
            Bill.bill_date == req.purchase_date,
            Bill.total_amount == req.total_amount
        ).first()

        # Step 1: Create Bill Record
        new_bill = Bill(
            user_id=uid,
            store_name=req.store_name,
            store_address=req.store_address,
            bill_number=req.bill_number,
            bill_date=req.purchase_date,
            total_amount=req.total_amount,
            tax_amount=req.tax_amount or 0.0,
            discount_amount=req.discount_amount or 0.0,
            raw_ocr_text=req.raw_ocr_text,
            bill_image_blob=image_blob,
            file_name=f"bill_{req.purchase_date}_{req.store_name.replace(' ', '_')}.jpg",
            mime_type="image/jpeg",
            status="CONFIRMED"
        )
        db.add(new_bill)
        db.flush()  # populate new_bill.bill_id

        # Step 2: Create Purchase Record
        new_purchase = Purchase(
            bill_id=new_bill.bill_id,
            user_id=uid,
            store_name=req.store_name,
            purchase_date=req.purchase_date,
            total_amount=req.total_amount,
            payment_method=req.payment_method,
            notes=f"Scanned from bill #{req.bill_number or 'N/A'}"
        )
        db.add(new_purchase)
        db.flush()  # populate new_purchase.purchase_id

        # Step 3: Process Line Items, Inventory Batches, & Stock Movements
        categories = {c.category_id: c.default_shelf_life_days for c in db.query(Category).all()}

        for item in req.items:
            # Look up product or create if not in catalog
            product = db.query(Product).filter(
                Product.user_id == uid,
                Product.product_name.ilike(item.item_name)
            ).first()

            if not product:
                product = Product(
                    user_id=uid,
                    category_id=item.category_id,
                    product_name=item.item_name.strip().title(),
                    default_unit=item.unit,
                    min_stock_level=1.00,
                    current_quantity=item.quantity,
                    storage_location=item.storage_location or "Pantry",
                    purchase_price=item.unit_price
                )
                db.add(product)
                db.flush()
            else:
                product.current_quantity = float(product.current_quantity) + item.quantity
                product.purchase_price = item.unit_price
                db.flush()

            # Determine expiry date
            shelf_days = categories.get(item.category_id, 14)
            batch_expiry = item.expiry_date or (req.purchase_date + timedelta(days=shelf_days))

            # Create Batch
            batch = InventoryBatch(
                product_id=product.product_id,
                user_id=uid,
                batch_number=f"BATCH-{int(datetime.now().timestamp()) % 100000}-{product.product_id}",
                quantity=item.quantity,
                initial_quantity=item.quantity,
                purchase_date=req.purchase_date,
                expiry_date=batch_expiry,
                unit_price=item.unit_price,
                status="SAFE"
            )
            db.add(batch)
            db.flush()

            # Create Stock Movement
            movement = StockMovement(
                product_id=product.product_id,
                batch_id=batch.batch_id,
                user_id=uid,
                movement_type="PURCHASE",
                quantity_changed=item.quantity,
                balance_after=product.current_quantity,
                notes=f"Restocked from bill #{new_bill.bill_id}"
            )
            db.add(movement)

            # Create Purchase Item
            p_item = PurchaseItem(
                purchase_id=new_purchase.purchase_id,
                product_id=product.product_id,
                item_name=item.item_name,
                category_id=item.category_id,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=item.unit_price,
                line_total=item.line_total,
                batch_id=batch.batch_id
            )
            db.add(p_item)

        # Step 4: Create Expense Entry
        primary_cat_id = req.items[0].category_id if req.items else None
        expense = Expense(
            user_id=uid,
            purchase_id=new_purchase.purchase_id,
            category_id=primary_cat_id,
            amount=req.total_amount,
            expense_date=req.purchase_date,
            description=f"Grocery purchase at {req.store_name}",
            payment_mode=req.payment_method
        )
        db.add(expense)

        # Step 5: Check Budget & Trigger Notifications
        p_month = req.purchase_date.month
        p_year = req.purchase_date.year
        budget = db.query(MonthlyBudget).filter(
            MonthlyBudget.user_id == uid,
            MonthlyBudget.month == p_month,
            MonthlyBudget.year == p_year
        ).first()

        if budget:
            total_spent_month = db.query(Expense).filter(
                Expense.user_id == uid,
                Expense.expense_date >= date(p_year, p_month, 1),
                Expense.expense_date <= req.purchase_date
            ).all()
            sum_spent = sum(float(e.amount) for e in total_spent_month) + float(req.total_amount)
            if sum_spent > float(budget.budget_amount):
                notif = Notification(
                    user_id=uid,
                    type="BUDGET_EXCEEDED",
                    title="Monthly Budget Exceeded",
                    message=f"Your expenses for {req.purchase_date.strftime('%B %Y')} (₹{sum_spent:,.2f}) have exceeded your target budget of ₹{float(budget.budget_amount):,.2f}.",
                    reference_id=new_purchase.purchase_id
                )
                db.add(notif)

        # Add Bill Scanned Notification
        notif_scanned = Notification(
            user_id=uid,
            type="BILL_SCANNED",
            title="Bill Confirmed & Inventory Updated",
            message=f"Bill from {req.store_name} for ₹{req.total_amount:,.2f} recorded with {len(req.items)} items added to pantry.",
            reference_id=new_bill.bill_id
        )
        db.add(notif_scanned)

        db.commit()

        return {
            "message": "Bill successfully verified, inventory restocked, and expense recorded.",
            "bill_id": new_bill.bill_id,
            "purchase_id": new_purchase.purchase_id,
            "items_count": len(req.items),
            "is_duplicate_warning": bool(existing_bill)
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction failed: {str(e)}"
        )

@router.get("", response_model=List[BillOut])
def list_bills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bills = db.query(Bill).filter(Bill.user_id == current_user.user_id).order_by(Bill.bill_date.desc()).all()
    results = []
    for b in bills:
        results.append(BillOut(
            bill_id=b.bill_id,
            store_name=b.store_name,
            bill_number=b.bill_number,
            bill_date=b.bill_date,
            total_amount=float(b.total_amount),
            status=b.status,
            has_image=b.bill_image_blob is not None,
            created_at=b.created_at
        ))
    return results

@router.get("/{bill_id}")
def get_bill_detail(
    bill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(Bill.bill_id == bill_id, Bill.user_id == current_user.user_id).first()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    purchase = db.query(Purchase).filter(Purchase.bill_id == bill_id).first()
    items = []
    if purchase:
        items = db.query(PurchaseItem).filter(PurchaseItem.purchase_id == purchase.purchase_id).all()

    return {
        "bill_id": bill.bill_id,
        "store_name": bill.store_name,
        "store_address": bill.store_address,
        "bill_number": bill.bill_number,
        "bill_date": bill.bill_date,
        "total_amount": float(bill.total_amount),
        "tax_amount": float(bill.tax_amount or 0.0),
        "discount_amount": float(bill.discount_amount or 0.0),
        "status": bill.status,
        "raw_ocr_text": bill.raw_ocr_text,
        "has_image": bill.bill_image_blob is not None,
        "created_at": bill.created_at,
        "items": [
            {
                "purchase_item_id": it.purchase_item_id,
                "item_name": it.item_name,
                "quantity": float(it.quantity),
                "unit": it.unit,
                "unit_price": float(it.unit_price),
                "line_total": float(it.line_total)
            } for it in items
        ]
    }

@router.get("/{bill_id}/image")
def get_bill_image(
    bill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(Bill.bill_id == bill_id, Bill.user_id == current_user.user_id).first()
    if not bill or not bill.bill_image_blob:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill image not found in database")

    return Response(content=bill.bill_image_blob, media_type=bill.mime_type or "image/jpeg")
