from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import (
    User, Product, Category, InventoryBatch, StockMovement, Notification
)
from app.schemas import (
    ProductCreate, ProductUpdate, ProductOut, CategoryOut, 
    StockMovementCreate, StockMovementOut, BatchOut
)
from app.auth import get_current_user

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.category_id).all()

@router.get("", response_model=List[ProductOut])
def list_inventory(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    stock_status: Optional[str] = None,  # ALL, SAFE, LOW_STOCK, OUT_OF_STOCK
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.user_id
    query = db.query(Product).filter(Product.user_id == uid)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        query = query.filter(Product.product_name.ilike(f"%{search}%"))

    products = query.order_by(Product.product_name).all()

    results = []
    today = date.today()

    for p in products:
        qty = float(p.current_quantity)
        min_lvl = float(p.min_stock_level)
        if qty == 0:
            status_val = "OUT_OF_STOCK"
        elif qty <= min_lvl:
            status_val = "LOW_STOCK"
        else:
            status_val = "SAFE"

        if stock_status and stock_status != "ALL" and status_val != stock_status:
            continue

        # Get active batches and earliest expiry
        active_batches = db.query(InventoryBatch).filter(
            InventoryBatch.product_id == p.product_id,
            InventoryBatch.quantity > 0,
            InventoryBatch.status.in_(["SAFE", "EXPIRING_SOON", "EXPIRED"])
        ).order_by(InventoryBatch.expiry_date.asc()).all()

        earliest_exp = active_batches[0].expiry_date if active_batches else None
        cat = db.query(Category).filter(Category.category_id == p.category_id).first()

        batch_outs = []
        for b in active_batches:
            days_left = (b.expiry_date - today).days
            batch_outs.append(BatchOut(
                batch_id=b.batch_id,
                product_id=b.product_id,
                batch_number=b.batch_number,
                quantity=float(b.quantity),
                initial_quantity=float(b.initial_quantity),
                purchase_date=b.purchase_date,
                expiry_date=b.expiry_date,
                unit_price=float(b.unit_price or 0.0),
                status=b.status,
                days_left=days_left
            ))

        results.append(ProductOut(
            product_id=p.product_id,
            user_id=p.user_id,
            category_id=p.category_id,
            category_name=cat.name if cat else "Other",
            product_name=p.product_name,
            default_unit=p.default_unit,
            min_stock_level=min_lvl,
            current_quantity=qty,
            storage_location=p.storage_location or "Pantry",
            purchase_price=float(p.purchase_price or 0.0),
            image_url=p.image_url,
            stock_status=status_val,
            earliest_expiry=earliest_exp,
            batches=batch_outs
        ))

    return results

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    prod_in: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.user_id
    
    # Check if exists
    existing = db.query(Product).filter(
        Product.user_id == uid,
        Product.product_name.ilike(prod_in.product_name)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product '{prod_in.product_name}' already exists in your inventory."
        )

    product = Product(
        user_id=uid,
        category_id=prod_in.category_id,
        product_name=prod_in.product_name.strip(),
        default_unit=prod_in.default_unit,
        min_stock_level=prod_in.min_stock_level,
        current_quantity=prod_in.current_quantity,
        storage_location=prod_in.storage_location,
        purchase_price=prod_in.purchase_price
    )
    db.add(product)
    db.flush()

    batch_outs = []
    # If starting with stock, create initial batch & movement
    if prod_in.current_quantity > 0:
        cat = db.query(Category).filter(Category.category_id == prod_in.category_id).first()
        shelf_days = cat.default_shelf_life_days if cat else 14
        exp_date = prod_in.expiry_date or (date.today() + timedelta(days=shelf_days))

        batch = InventoryBatch(
            product_id=product.product_id,
            user_id=uid,
            batch_number=f"INIT-{product.product_id}",
            quantity=prod_in.current_quantity,
            initial_quantity=prod_in.current_quantity,
            purchase_date=date.today(),
            expiry_date=exp_date,
            unit_price=prod_in.purchase_price,
            status="SAFE"
        )
        db.add(batch)
        db.flush()

        movement = StockMovement(
            product_id=product.product_id,
            batch_id=batch.batch_id,
            user_id=uid,
            movement_type="PURCHASE",
            quantity_changed=prod_in.current_quantity,
            balance_after=prod_in.current_quantity,
            notes="Initial stock setup"
        )
        db.add(movement)

        batch_outs.append(BatchOut(
            batch_id=batch.batch_id,
            product_id=batch.product_id,
            batch_number=batch.batch_number,
            quantity=float(batch.quantity),
            initial_quantity=float(batch.initial_quantity),
            purchase_date=batch.purchase_date,
            expiry_date=batch.expiry_date,
            unit_price=float(batch.unit_price or 0.0),
            status=batch.status,
            days_left=(batch.expiry_date - date.today()).days
        ))

    db.commit()

    cat = db.query(Category).filter(Category.category_id == product.category_id).first()
    return ProductOut(
        product_id=product.product_id,
        user_id=product.user_id,
        category_id=product.category_id,
        category_name=cat.name if cat else "Other",
        product_name=product.product_name,
        default_unit=product.default_unit,
        min_stock_level=float(product.min_stock_level),
        current_quantity=float(product.current_quantity),
        storage_location=product.storage_location or "Pantry",
        purchase_price=float(product.purchase_price or 0.0),
        image_url=product.image_url,
        stock_status="SAFE" if product.current_quantity > product.min_stock_level else "LOW_STOCK",
        earliest_expiry=batch_outs[0].expiry_date if batch_outs else None,
        batches=batch_outs
    )

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    prod_in: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.product_id == product_id,
        Product.user_id == current_user.user_id
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if prod_in.product_name is not None:
        product.product_name = prod_in.product_name.strip()
    if prod_in.category_id is not None:
        product.category_id = prod_in.category_id
    if prod_in.default_unit is not None:
        product.default_unit = prod_in.default_unit
    if prod_in.min_stock_level is not None:
        product.min_stock_level = prod_in.min_stock_level
    if prod_in.storage_location is not None:
        product.storage_location = prod_in.storage_location
    if prod_in.purchase_price is not None:
        product.purchase_price = prod_in.purchase_price

    # If quantity manually adjusted
    if prod_in.current_quantity is not None and prod_in.current_quantity != float(product.current_quantity):
        diff = prod_in.current_quantity - float(product.current_quantity)
        product.current_quantity = prod_in.current_quantity
        m = StockMovement(
            product_id=product.product_id,
            user_id=current_user.user_id,
            movement_type="ADJUSTMENT",
            quantity_changed=diff,
            balance_after=prod_in.current_quantity,
            notes="Manual stock count adjustment"
        )
        db.add(m)

    db.commit()
    db.refresh(product)

    cat = db.query(Category).filter(Category.category_id == product.category_id).first()
    return ProductOut(
        product_id=product.product_id,
        user_id=product.user_id,
        category_id=product.category_id,
        category_name=cat.name if cat else "Other",
        product_name=product.product_name,
        default_unit=product.default_unit,
        min_stock_level=float(product.min_stock_level),
        current_quantity=float(product.current_quantity),
        storage_location=product.storage_location or "Pantry",
        purchase_price=float(product.purchase_price or 0.0),
        image_url=product.image_url,
        stock_status="SAFE" if product.current_quantity > product.min_stock_level else "LOW_STOCK"
    )

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.product_id == product_id,
        Product.user_id == current_user.user_id
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product and associated batches removed from inventory"}

@router.post("/{product_id}/consume")
def record_consumption(
    product_id: int,
    movement_in: StockMovementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Consumes inventory using FIFO (First In First Out) from earliest expiring batches.
    Updates product stock level and creates stock movement audit.
    If stock falls below min_stock_level, creates a LOW_STOCK notification.
    """
    uid = current_user.user_id
    product = db.query(Product).filter(
        Product.product_id == product_id,
        Product.user_id == uid
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    cur_qty = float(product.current_quantity)
    consume_qty = movement_in.quantity

    if consume_qty > cur_qty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot consume {consume_qty} {product.default_unit}. Only {cur_qty} {product.default_unit} available in pantry."
        )

    # Deduct from batches FIFO
    batches = db.query(InventoryBatch).filter(
        InventoryBatch.product_id == product_id,
        InventoryBatch.quantity > 0,
        InventoryBatch.status.in_(["SAFE", "EXPIRING_SOON", "EXPIRED"])
    ).order_by(InventoryBatch.expiry_date.asc()).all()

    remaining_to_deduct = consume_qty
    for b in batches:
        b_qty = float(b.quantity)
        if b_qty <= remaining_to_deduct:
            remaining_to_deduct -= b_qty
            b.quantity = 0.0
            b.status = "CONSUMED" if movement_in.movement_type == "CONSUMPTION" else "DISCARDED"
        else:
            b.quantity = b_qty - remaining_to_deduct
            remaining_to_deduct = 0.0
            break

    # Update product stock
    new_balance = round(cur_qty - consume_qty, 2)
    product.current_quantity = new_balance

    # Record Movement
    movement = StockMovement(
        product_id=product.product_id,
        user_id=uid,
        movement_type=movement_in.movement_type,
        quantity_changed=-consume_qty,
        balance_after=new_balance,
        notes=movement_in.notes or f"Consumed {consume_qty} {product.default_unit}"
    )
    db.add(movement)

    # Check for Low-Stock trigger
    if new_balance <= float(product.min_stock_level):
        notif = Notification(
            user_id=uid,
            type="LOW_STOCK",
            title=f"Low Stock Alert: {product.product_name}",
            message=f"{product.product_name} is down to {new_balance} {product.default_unit} (Threshold: {float(product.min_stock_level)} {product.default_unit}). Ready to restock!",
            reference_id=product.product_id
        )
        db.add(notif)

    db.commit()

    return {
        "message": f"Successfully consumed {consume_qty} {product.default_unit}.",
        "product_id": product_id,
        "remaining_quantity": new_balance,
        "is_low_stock": new_balance <= float(product.min_stock_level)
    }

@router.get("/{product_id}/history", response_model=List[StockMovementOut])
def get_product_movement_history(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    movements = db.query(StockMovement).filter(
        StockMovement.product_id == product_id,
        StockMovement.user_id == current_user.user_id
    ).order_by(StockMovement.created_at.desc()).all()

    prod = db.query(Product).filter(Product.product_id == product_id).first()
    p_name = prod.product_name if prod else ""

    return [
        StockMovementOut(
            movement_id=m.movement_id,
            product_id=m.product_id,
            product_name=p_name,
            movement_type=m.movement_type,
            quantity_changed=float(m.quantity_changed),
            balance_after=float(m.balance_after),
            notes=m.notes,
            created_at=m.created_at
        ) for m in movements
    ]
