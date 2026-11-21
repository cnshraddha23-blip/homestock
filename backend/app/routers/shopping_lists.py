from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import (
    User, MonthlyGroceryList, GroceryListItem, RecurringGroceryItem, 
    Product, Category, StockMovement, InventoryBatch
)
from app.schemas import (
    MonthlyGroceryListOut, GroceryListItemOut, GroceryListItemCreate, 
    GroceryListItemUpdate, RecurringItemOut, RecurringItemCreate
)
from app.auth import get_current_user

router = APIRouter(prefix="/shopping-lists", tags=["Personalized Grocery Planning"])

class GenerateMonthlyListRequest(BaseModel):
    month: Optional[int] = None
    year: Optional[int] = None
    custom_name: Optional[str] = None

# ----------------- RECURRING ESSENTIALS -----------------
@router.get("/recurring", response_model=List[RecurringItemOut])
def get_recurring_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(RecurringGroceryItem, Category).outerjoin(
        Category, RecurringGroceryItem.category_id == Category.category_id
    ).filter(
        RecurringGroceryItem.user_id == current_user.user_id
    ).order_by(RecurringGroceryItem.priority.desc(), RecurringGroceryItem.item_name).all()

    results = []
    for r, c in items:
        results.append(RecurringItemOut(
            recurring_id=r.recurring_id,
            user_id=r.user_id,
            item_name=r.item_name,
            category_id=r.category_id,
            category_name=c.name if c else "Pantry",
            preferred_monthly_quantity=float(r.preferred_monthly_quantity),
            unit=r.unit,
            priority=r.priority,
            is_active=r.is_active
        ))
    return results

@router.post("/recurring", response_model=RecurringItemOut)
def add_recurring_item(
    item_in: RecurringItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.user_id
    existing = db.query(RecurringGroceryItem).filter(
        RecurringGroceryItem.user_id == uid,
        RecurringGroceryItem.item_name.ilike(item_in.item_name)
    ).first()

    if existing:
        existing.preferred_monthly_quantity = item_in.preferred_monthly_quantity
        existing.unit = item_in.unit
        existing.priority = item_in.priority
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        target = RecurringGroceryItem(
            user_id=uid,
            item_name=item_in.item_name.strip(),
            category_id=item_in.category_id,
            preferred_monthly_quantity=item_in.preferred_monthly_quantity,
            unit=item_in.unit,
            priority=item_in.priority,
            is_active=True
        )
        db.add(target)
        db.commit()
        db.refresh(target)

    cat = db.query(Category).filter(Category.category_id == target.category_id).first()
    return RecurringItemOut(
        recurring_id=target.recurring_id,
        user_id=target.user_id,
        item_name=target.item_name,
        category_id=target.category_id,
        category_name=cat.name if cat else "Other",
        preferred_monthly_quantity=float(target.preferred_monthly_quantity),
        unit=target.unit,
        priority=target.priority,
        is_active=target.is_active
    )

@router.delete("/recurring/{recurring_id}")
def delete_recurring_item(
    recurring_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(RecurringGroceryItem).filter(
        RecurringGroceryItem.recurring_id == recurring_id,
        RecurringGroceryItem.user_id == current_user.user_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Recurring item not found")
    db.delete(item)
    db.commit()
    return {"message": "Recurring item deleted"}

# ----------------- MONTHLY LISTS -----------------
@router.post("/generate-monthly", response_model=MonthlyGroceryListOut)
def generate_monthly_grocery_list(
    req: GenerateMonthlyListRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Intelligent Monthly List Generation:
    1. Reads user's recurring essentials.
    2. Inspects current pantry inventory levels.
    3. Calculates deficit: preferred_monthly_quantity - current_stock.
    4. Gathers any out-of-stock or low-stock items.
    5. Computes total estimated budget and stores list items in SQL.
    """
    uid = current_user.user_id
    today = date.today()
    target_month = req.month or (today.month % 12 + 1 if today.day > 25 else today.month)
    target_year = req.year or (today.year if target_month >= today.month else today.year + 1)
    
    month_name = datetime(target_year, target_month, 1).strftime("%B %Y")
    list_title = req.custom_name or f"Grocery Plan: {month_name}"

    # Create List Master
    new_list = MonthlyGroceryList(
        user_id=uid,
        month=target_month,
        year=target_year,
        list_name=list_title,
        status="ACTIVE",
        total_estimated_cost=0.0
    )
    db.add(new_list)
    db.flush()

    # 1. Evaluate recurring items against stock
    recurring = db.query(RecurringGroceryItem).filter(
        RecurringGroceryItem.user_id == uid,
        RecurringGroceryItem.is_active == True
    ).all()

    added_product_ids = set()
    total_est = 0.0

    for r in recurring:
        # Match with product in inventory
        prod = db.query(Product).filter(
            Product.user_id == uid,
            Product.product_name.ilike(r.item_name)
        ).first()

        cur_qty = float(prod.current_quantity) if prod else 0.0
        pref_qty = float(r.preferred_monthly_quantity)
        
        # Calculate needed quantity
        qty_needed = max(0.0, round(pref_qty - cur_qty, 2))
        if qty_needed <= 0 and cur_qty > (float(prod.min_stock_level) if prod else 1.0):
            # Already sufficiently stocked for the month!
            continue

        if qty_needed <= 0:
            qty_needed = 1.0  # minimal safety buffer if at boundary

        est_unit_price = float(prod.purchase_price) if prod and prod.purchase_price > 0 else 60.0
        line_est = round(qty_needed * est_unit_price, 2)
        total_est += line_est

        item_entry = GroceryListItem(
            list_id=new_list.list_id,
            product_id=prod.product_id if prod else None,
            item_name=r.item_name,
            category_id=r.category_id or (prod.category_id if prod else None),
            target_quantity=qty_needed,
            unit=r.unit,
            estimated_price=est_unit_price,
            notes=f"Auto-planned: Stock is {cur_qty} {r.unit} (Target: {pref_qty} {r.unit})"
        )
        db.add(item_entry)
        if prod:
            added_product_ids.add(prod.product_id)

    # 2. Add other low stock items not already in recurring list
    low_stock_prods = db.query(Product).filter(
        Product.user_id == uid,
        Product.current_quantity <= Product.min_stock_level
    ).all()

    for p in low_stock_prods:
        if p.product_id not in added_product_ids:
            reorder_qty = max(1.0, round(float(p.min_stock_level) * 2 - float(p.current_quantity), 2))
            est_p = float(p.purchase_price) if p.purchase_price > 0 else 50.0
            total_est += (reorder_qty * est_p)

            db.add(GroceryListItem(
                list_id=new_list.list_id,
                product_id=p.product_id,
                item_name=p.product_name,
                category_id=p.category_id,
                target_quantity=reorder_qty,
                unit=p.default_unit,
                estimated_price=est_p,
                notes=f"Low Stock Restock (Current: {float(p.current_quantity)} {p.default_unit})"
            ))

    new_list.total_estimated_cost = round(total_est, 2)
    db.commit()
    db.refresh(new_list)

    return get_shopping_list_detail(new_list.list_id, current_user, db)

@router.get("", response_model=List[MonthlyGroceryListOut])
def list_shopping_lists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lists = db.query(MonthlyGroceryList).filter(
        MonthlyGroceryList.user_id == current_user.user_id
    ).order_by(MonthlyGroceryList.year.desc(), MonthlyGroceryList.month.desc(), MonthlyGroceryList.list_id.desc()).all()

    out = []
    for l in lists:
        items = db.query(GroceryListItem, Category).outerjoin(
            Category, GroceryListItem.category_id == Category.category_id
        ).filter(GroceryListItem.list_id == l.list_id).all()

        item_outs = []
        for it, c in items:
            item_outs.append(GroceryListItemOut(
                list_item_id=it.list_item_id,
                list_id=it.list_id,
                product_id=it.product_id,
                item_name=it.item_name,
                category_id=it.category_id,
                category_name=c.name if c else "Pantry",
                target_quantity=float(it.target_quantity),
                unit=it.unit,
                estimated_price=float(it.estimated_price or 0.0),
                is_purchased=it.is_purchased,
                is_skipped=it.is_skipped,
                notes=it.notes
            ))

        out.append(MonthlyGroceryListOut(
            list_id=l.list_id,
            user_id=l.user_id,
            month=l.month,
            year=l.year,
            list_name=l.list_name,
            status=l.status,
            total_estimated_cost=float(l.total_estimated_cost or 0.0),
            items=item_outs,
            created_at=l.created_at
        ))
    return out

@router.get("/{list_id}", response_model=MonthlyGroceryListOut)
def get_shopping_list_detail(
    list_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    l = db.query(MonthlyGroceryList).filter(
        MonthlyGroceryList.list_id == list_id,
        MonthlyGroceryList.user_id == current_user.user_id
    ).first()
    if not l:
        raise HTTPException(status_code=404, detail="Shopping list not found")

    items = db.query(GroceryListItem, Category).outerjoin(
        Category, GroceryListItem.category_id == Category.category_id
    ).filter(GroceryListItem.list_id == l.list_id).all()

    item_outs = []
    for it, c in items:
        item_outs.append(GroceryListItemOut(
            list_item_id=it.list_item_id,
            list_id=it.list_id,
            product_id=it.product_id,
            item_name=it.item_name,
            category_id=it.category_id,
            category_name=c.name if c else "Pantry",
            target_quantity=float(it.target_quantity),
            unit=it.unit,
            estimated_price=float(it.estimated_price or 0.0),
            is_purchased=it.is_purchased,
            is_skipped=it.is_skipped,
            notes=it.notes
        ))

    return MonthlyGroceryListOut(
        list_id=l.list_id,
        user_id=l.user_id,
        month=l.month,
        year=l.year,
        list_name=l.list_name,
        status=l.status,
        total_estimated_cost=float(l.total_estimated_cost or 0.0),
        items=item_outs,
        created_at=l.created_at
    )

@router.post("/{list_id}/items", response_model=GroceryListItemOut)
def add_item_to_list(
    list_id: int,
    item_in: GroceryListItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    l = db.query(MonthlyGroceryList).filter(
        MonthlyGroceryList.list_id == list_id,
        MonthlyGroceryList.user_id == current_user.user_id
    ).first()
    if not l:
        raise HTTPException(status_code=404, detail="Shopping list not found")

    item = GroceryListItem(
        list_id=list_id,
        item_name=item_in.item_name.strip(),
        category_id=item_in.category_id,
        target_quantity=item_in.target_quantity,
        unit=item_in.unit,
        estimated_price=item_in.estimated_price,
        notes=item_in.notes
    )
    db.add(item)

    # Recalculate total cost
    l.total_estimated_cost = float(l.total_estimated_cost or 0.0) + (item_in.target_quantity * item_in.estimated_price)
    db.commit()
    db.refresh(item)

    cat = db.query(Category).filter(Category.category_id == item.category_id).first()
    return GroceryListItemOut(
        list_item_id=item.list_item_id,
        list_id=item.list_id,
        product_id=item.product_id,
        item_name=item.item_name,
        category_id=item.category_id,
        category_name=cat.name if cat else "Other",
        target_quantity=float(item.target_quantity),
        unit=item.unit,
        estimated_price=float(item.estimated_price),
        is_purchased=item.is_purchased,
        is_skipped=item.is_skipped,
        notes=item.notes
    )

@router.put("/items/{item_id}", response_model=GroceryListItemOut)
def update_list_item(
    item_id: int,
    item_in: GroceryListItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(GroceryListItem).join(MonthlyGroceryList).filter(
        GroceryListItem.list_item_id == item_id,
        MonthlyGroceryList.user_id == current_user.user_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="List item not found")

    if item_in.item_name is not None:
        item.item_name = item_in.item_name.strip()
    if item_in.target_quantity is not None:
        item.target_quantity = item_in.target_quantity
    if item_in.unit is not None:
        item.unit = item_in.unit
    if item_in.estimated_price is not None:
        item.estimated_price = item_in.estimated_price
    if item_in.is_purchased is not None:
        item.is_purchased = item_in.is_purchased
    if item_in.is_skipped is not None:
        item.is_skipped = item_in.is_skipped
    if item_in.notes is not None:
        item.notes = item_in.notes

    db.commit()
    db.refresh(item)

    cat = db.query(Category).filter(Category.category_id == item.category_id).first()
    return GroceryListItemOut(
        list_item_id=item.list_item_id,
        list_id=item.list_id,
        product_id=item.product_id,
        item_name=item.item_name,
        category_id=item.category_id,
        category_name=cat.name if cat else "Other",
        target_quantity=float(item.target_quantity),
        unit=item.unit,
        estimated_price=float(item.estimated_price or 0.0),
        is_purchased=item.is_purchased,
        is_skipped=item.is_skipped,
        notes=item.notes
    )

@router.delete("/items/{item_id}")
def delete_list_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(GroceryListItem).join(MonthlyGroceryList).filter(
        GroceryListItem.list_item_id == item_id,
        MonthlyGroceryList.user_id == current_user.user_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="List item not found")

    db.delete(item)
    db.commit()
    return {"message": "List item removed"}
