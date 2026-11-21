from datetime import date, timedelta
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, InventoryBatch, Product, Category, StockMovement, Notification
from app.auth import get_current_user

router = APIRouter(prefix="/expiry", tags=["Expiry Tracker"])

class ExpiryActionRequest(BaseModel):
    action: str  # CONSUME, DISCARD, EXTEND
    new_expiry_date: Optional[date] = None
    notes: Optional[str] = None

class BatchExpiryDetail(BaseModel):
    batch_id: int
    product_id: int
    product_name: str
    category_name: str
    batch_number: str
    quantity: float
    unit: str
    purchase_date: date
    expiry_date: date
    days_left: int
    status: str  # SAFE, EXPIRING_SOON, EXPIRED
    storage_location: str

@router.get("/summary")
def get_expiry_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.user_id
    today = date.today()
    in_7_days = today + timedelta(days=7)
    in_30_days = today + timedelta(days=30)

    batches = db.query(InventoryBatch).join(Product).filter(
        InventoryBatch.user_id == uid,
        InventoryBatch.quantity > 0,
        InventoryBatch.status.notin_(["CONSUMED", "DISCARDED"])
    ).all()

    today_count = 0
    in_7_count = 0
    in_30_count = 0
    expired_count = 0

    for b in batches:
        days = (b.expiry_date - today).days
        if days < 0:
            expired_count += 1
        elif days == 0:
            today_count += 1
        elif 0 < days <= 7:
            in_7_count += 1
        elif 7 < days <= 30:
            in_30_count += 1

    return {
        "expiring_today": today_count,
        "expiring_in_7_days": in_7_count,
        "expiring_in_30_days": in_30_count,
        "already_expired": expired_count,
        "total_active_batches": len(batches)
    }

@router.get("/batches", response_model=List[BatchExpiryDetail])
def list_expiry_batches(
    filter_by: Optional[str] = "ALL",  # ALL, TODAY, 7_DAYS, 30_DAYS, EXPIRED
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.user_id
    today = date.today()

    batches = db.query(InventoryBatch, Product, Category).join(
        Product, InventoryBatch.product_id == Product.product_id
    ).join(
        Category, Product.category_id == Category.category_id
    ).filter(
        InventoryBatch.user_id == uid,
        InventoryBatch.quantity > 0,
        InventoryBatch.status.notin_(["CONSUMED", "DISCARDED"])
    ).order_by(InventoryBatch.expiry_date.asc()).all()

    results = []
    for b, p, c in batches:
        days = (b.expiry_date - today).days
        
        # Computed status
        if days < 0:
            comp_status = "EXPIRED"
        elif days <= 7:
            comp_status = "EXPIRING_SOON"
        else:
            comp_status = "SAFE"

        # Apply filter
        if filter_by == "TODAY" and days != 0:
            continue
        elif filter_by == "7_DAYS" and not (0 <= days <= 7):
            continue
        elif filter_by == "30_DAYS" and not (0 <= days <= 30):
            continue
        elif filter_by == "EXPIRED" and days >= 0:
            continue

        results.append(BatchExpiryDetail(
            batch_id=b.batch_id,
            product_id=p.product_id,
            product_name=p.product_name,
            category_name=c.name,
            batch_number=b.batch_number,
            quantity=float(b.quantity),
            unit=p.default_unit,
            purchase_date=b.purchase_date,
            expiry_date=b.expiry_date,
            days_left=days,
            status=comp_status,
            storage_location=p.storage_location or "Pantry"
        ))

    return results

@router.post("/{batch_id}/action")
def perform_expiry_action(
    batch_id: int,
    req: ExpiryActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.user_id
    batch = db.query(InventoryBatch).filter(
        InventoryBatch.batch_id == batch_id,
        InventoryBatch.user_id == uid
    ).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    product = db.query(Product).filter(Product.product_id == batch.product_id).first()

    if req.action in ("CONSUME", "DISCARD"):
        b_qty = float(batch.quantity)
        cur_prod_qty = float(product.current_quantity) if product else 0.0
        new_prod_qty = max(0.0, round(cur_prod_qty - b_qty, 2))

        batch.quantity = 0.0
        batch.status = "CONSUMED" if req.action == "CONSUME" else "DISCARDED"

        if product:
            product.current_quantity = new_prod_qty

        # Log movement
        movement = StockMovement(
            product_id=batch.product_id,
            batch_id=batch.batch_id,
            user_id=uid,
            movement_type="CONSUMPTION" if req.action == "CONSUME" else "DISCARD",
            quantity_changed=-b_qty,
            balance_after=new_prod_qty,
            notes=req.notes or f"Batch {batch.batch_number} marked as {req.action}"
        )
        db.add(movement)

        # Trigger restock alert if now low
        if product and new_prod_qty <= float(product.min_stock_level):
            notif = Notification(
                user_id=uid,
                type="LOW_STOCK",
                title=f"Low Stock: {product.product_name}",
                message=f"After {req.action.lower()}ing batch {batch.batch_number}, {product.product_name} is down to {new_prod_qty} {product.default_unit}.",
                reference_id=product.product_id
            )
            db.add(notif)

        db.commit()
        return {"message": f"Batch marked as {req.action.lower()}", "batch_id": batch_id, "new_stock": new_prod_qty}

    elif req.action == "EXTEND":
        if not req.new_expiry_date:
            raise HTTPException(status_code=400, detail="New expiry date is required to extend shelf life")
        batch.expiry_date = req.new_expiry_date
        batch.status = "SAFE" if (req.new_expiry_date - date.today()).days > 7 else "EXPIRING_SOON"
        db.commit()
        return {"message": "Expiry date extended", "new_expiry": req.new_expiry_date}

    else:
        raise HTTPException(status_code=400, detail=f"Unknown action '{req.action}'")
