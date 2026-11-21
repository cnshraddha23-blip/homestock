from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func, extract, and_
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, Product, InventoryBatch, Purchase, Expense, MonthlyBudget, Notification, Bill
)
from app.schemas import (
    DashboardSummaryOut, InventorySummary, ExpenseSummary, ExpirySummary, RecentPurchase
)
from app.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    uid = current_user.user_id
    today = date.today()
    current_month = today.month
    current_year = today.year
    prev_month = 12 if current_month == 1 else current_month - 1
    prev_year = current_year - 1 if current_month == 1 else current_year

    # 1. INVENTORY SUMMARY
    total_products = db.query(func.count(Product.product_id)).filter(Product.user_id == uid).scalar() or 0
    available_products = db.query(func.count(Product.product_id)).filter(
        Product.user_id == uid, Product.current_quantity > Product.min_stock_level
    ).scalar() or 0
    low_stock_products = db.query(func.count(Product.product_id)).filter(
        Product.user_id == uid, Product.current_quantity > 0, Product.current_quantity <= Product.min_stock_level
    ).scalar() or 0
    out_of_stock_products = db.query(func.count(Product.product_id)).filter(
        Product.user_id == uid, Product.current_quantity == 0
    ).scalar() or 0

    inv_summary = InventorySummary(
        total_products=total_products,
        available_products=available_products,
        low_stock_products=low_stock_products,
        out_of_stock_products=out_of_stock_products
    )

    # 2. EXPENSE SUMMARY
    cur_month_exp = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == current_year,
        extract('month', Expense.expense_date) == current_month
    ).scalar()

    prev_month_exp = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == prev_year,
        extract('month', Expense.expense_date) == prev_month
    ).scalar()

    annual_exp = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == current_year
    ).scalar()

    # Average monthly expense over months with expenses in current year
    distinct_months = db.query(func.count(func.distinct(extract('month', Expense.expense_date)))).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == current_year
    ).scalar() or 1
    avg_monthly_exp = round(float(annual_exp) / max(1, distinct_months), 2)

    # Budget for current month
    budget_row = db.query(MonthlyBudget).filter(
        MonthlyBudget.user_id == uid,
        MonthlyBudget.year == current_year,
        MonthlyBudget.month == current_month
    ).first()
    cur_budget = float(budget_row.budget_amount) if budget_row else None
    remaining_budget = round(cur_budget - float(cur_month_exp), 2) if cur_budget else None

    exp_summary = ExpenseSummary(
        current_month_expense=float(cur_month_exp),
        previous_month_expense=float(prev_month_exp),
        annual_expense=float(annual_exp),
        average_monthly_expense=avg_monthly_exp,
        current_month_budget=cur_budget,
        remaining_budget=remaining_budget
    )

    # 3. EXPIRY SUMMARY
    in_7_days = today + timedelta(days=7)
    in_30_days = today + timedelta(days=30)

    exp_7 = db.query(func.count(InventoryBatch.batch_id)).filter(
        InventoryBatch.user_id == uid,
        InventoryBatch.quantity > 0,
        InventoryBatch.expiry_date >= today,
        InventoryBatch.expiry_date <= in_7_days,
        InventoryBatch.status != 'CONSUMED'
    ).scalar() or 0

    exp_30 = db.query(func.count(InventoryBatch.batch_id)).filter(
        InventoryBatch.user_id == uid,
        InventoryBatch.quantity > 0,
        InventoryBatch.expiry_date >= today,
        InventoryBatch.expiry_date <= in_30_days,
        InventoryBatch.status != 'CONSUMED'
    ).scalar() or 0

    expired = db.query(func.count(InventoryBatch.batch_id)).filter(
        InventoryBatch.user_id == uid,
        InventoryBatch.quantity > 0,
        InventoryBatch.expiry_date < today,
        InventoryBatch.status != 'CONSUMED'
    ).scalar() or 0

    expiry_summary = ExpirySummary(
        expiring_in_7_days=exp_7,
        expiring_in_30_days=exp_30,
        expired_products=expired
    )

    # 4. RECENT PURCHASES
    recent_purchases_db = db.query(Purchase).filter(
        Purchase.user_id == uid
    ).order_by(Purchase.purchase_date.desc(), Purchase.purchase_id.desc()).limit(5).all()

    recent_purchases = []
    for p in recent_purchases_db:
        has_img = False
        if p.bill_id:
            bill = db.query(Bill).filter(Bill.bill_id == p.bill_id).first()
            if bill and bill.bill_image_blob is not None:
                has_img = True
        recent_purchases.append(RecentPurchase(
            purchase_id=p.purchase_id,
            store_name=p.store_name,
            purchase_date=p.purchase_date,
            total_amount=float(p.total_amount),
            has_bill_image=has_img
        ))

    # 5. UNREAD NOTIFICATIONS
    unread_count = db.query(func.count(Notification.notification_id)).filter(
        Notification.user_id == uid,
        Notification.is_read == False
    ).scalar() or 0

    return DashboardSummaryOut(
        inventory=inv_summary,
        expenses=exp_summary,
        expiry=expiry_summary,
        recent_purchases=recent_purchases,
        unread_notifications_count=unread_count
    )
