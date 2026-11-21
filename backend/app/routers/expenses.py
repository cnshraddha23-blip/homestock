from datetime import date, datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from app.database import get_db
from app.models import User, Expense, Category, MonthlyBudget, Purchase
from app.schemas import ExpenseOut, ExpenseCreate
from app.auth import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expense Analytics"])

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

@router.get("/monthly")
def get_monthly_expense_report(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.user_id
    today = date.today()
    sel_month = month or today.month
    sel_year = year or today.year

    # 1. Monthly Total & Count
    total_spent = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == sel_year,
        extract('month', Expense.expense_date) == sel_month
    ).scalar() or 0.0

    purchase_count = db.query(func.count(Expense.expense_id)).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == sel_year,
        extract('month', Expense.expense_date) == sel_month
    ).scalar() or 0

    avg_bill = round(float(total_spent) / max(1, purchase_count), 2) if purchase_count > 0 else 0.0

    # 2. Category-wise Breakdown
    cat_query = db.query(
        Category.name,
        func.coalesce(func.sum(Expense.amount), 0.0).label("cat_total"),
        func.count(Expense.expense_id).label("cat_count")
    ).outerjoin(
        Category, Expense.category_id == Category.category_id
    ).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == sel_year,
        extract('month', Expense.expense_date) == sel_month
    ).group_by(Category.name).order_by(func.sum(Expense.amount).desc()).all()

    category_breakdown = []
    most_expensive_category = "None"
    highest_cat_val = 0.0

    for cat_name, c_tot, c_cnt in cat_query:
        name = cat_name or "General / Other"
        val = float(c_tot)
        if val > highest_cat_val:
            highest_cat_val = val
            most_expensive_category = name

        category_breakdown.append({
            "category": name,
            "amount": val,
            "percentage": round((val / max(1.0, float(total_spent))) * 100, 1),
            "transactions": c_cnt
        })

    # 3. Budget vs Actual
    budget_row = db.query(MonthlyBudget).filter(
        MonthlyBudget.user_id == uid,
        MonthlyBudget.year == sel_year,
        MonthlyBudget.month == sel_month
    ).first()

    budget_amt = float(budget_row.budget_amount) if budget_row else 5000.0
    remaining_budget = round(budget_amt - float(total_spent), 2)
    budget_utilization_pct = min(100.0, round((float(total_spent) / max(1.0, budget_amt)) * 100, 1))

    # 4. Weekly distribution
    # Group by week within the month
    expenses_list = db.query(Expense).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == sel_year,
        extract('month', Expense.expense_date) == sel_month
    ).order_by(Expense.expense_date.asc()).all()

    weekly_data = [
        {"week": "Week 1 (1-7)", "amount": 0.0},
        {"week": "Week 2 (8-14)", "amount": 0.0},
        {"week": "Week 3 (15-21)", "amount": 0.0},
        {"week": "Week 4 (22-28)", "amount": 0.0},
        {"week": "Week 5 (29+)", "amount": 0.0},
    ]
    for e in expenses_list:
        day = e.expense_date.day
        if day <= 7:
            weekly_data[0]["amount"] += float(e.amount)
        elif day <= 14:
            weekly_data[1]["amount"] += float(e.amount)
        elif day <= 21:
            weekly_data[2]["amount"] += float(e.amount)
        elif day <= 28:
            weekly_data[3]["amount"] += float(e.amount)
        else:
            weekly_data[4]["amount"] += float(e.amount)

    return {
        "month": sel_month,
        "year": sel_year,
        "month_label": f"{MONTH_NAMES[sel_month - 1]} {sel_year}",
        "total_monthly_expense": float(total_spent),
        "number_of_purchases": purchase_count,
        "average_bill_amount": avg_bill,
        "most_expensive_category": most_expensive_category,
        "monthly_budget": budget_amt,
        "remaining_budget": remaining_budget,
        "budget_utilization_percentage": budget_utilization_pct,
        "category_breakdown": category_breakdown,
        "weekly_trend": weekly_data
    }

@router.get("/annual")
def get_annual_expense_report(
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.user_id
    sel_year = year or date.today().year

    # 1. Total Annual Spending
    annual_total = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == sel_year
    ).scalar() or 0.0

    # 2. Month-by-month spending (1 to 12)
    month_query = db.query(
        extract('month', Expense.expense_date).label("m"),
        func.coalesce(func.sum(Expense.amount), 0.0).label("m_total"),
        func.count(Expense.expense_id).label("m_count")
    ).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == sel_year
    ).group_by(extract('month', Expense.expense_date)).all()

    month_map = {int(m): (float(tot), cnt) for m, tot, cnt in month_query}

    monthly_series = []
    active_months_count = 0
    highest_spend = -1.0
    highest_month = "N/A"
    lowest_spend = float('inf')
    lowest_month = "N/A"

    for m_num in range(1, 13):
        m_tot, m_cnt = month_map.get(m_num, (0.0, 0))
        m_name = MONTH_NAMES[m_num - 1]
        monthly_series.append({
            "month": m_name,
            "month_number": m_num,
            "amount": m_tot,
            "transactions": m_cnt
        })

        if m_tot > 0:
            active_months_count += 1
            if m_tot > highest_spend:
                highest_spend = m_tot
                highest_month = f"{m_name} (₹{m_tot:,.2f})"
            if m_tot < lowest_spend:
                lowest_spend = m_tot
                lowest_month = f"{m_name} (₹{m_tot:,.2f})"

    if lowest_spend == float('inf'):
        lowest_spend = 0.0
        lowest_month = "N/A"
    if highest_spend == -1.0:
        highest_spend = 0.0

    avg_monthly = round(float(annual_total) / max(1, active_months_count), 2)

    # 3. Category-wise annual expenditure
    cat_annual = db.query(
        Category.name,
        func.coalesce(func.sum(Expense.amount), 0.0).label("cat_total"),
        func.count(Expense.expense_id).label("cat_count")
    ).outerjoin(
        Category, Expense.category_id == Category.category_id
    ).filter(
        Expense.user_id == uid,
        extract('year', Expense.expense_date) == sel_year
    ).group_by(Category.name).order_by(func.sum(Expense.amount).desc()).all()

    category_annual_breakdown = [
        {
            "category": c_name or "General / Other",
            "amount": float(c_tot),
            "percentage": round((float(c_tot) / max(1.0, float(annual_total))) * 100, 1),
            "transactions": c_cnt
        } for c_name, c_tot, c_cnt in cat_annual
    ]

    # Available years for dropdown
    years_db = db.query(func.distinct(extract('year', Expense.expense_date))).filter(
        Expense.user_id == uid
    ).all()
    available_years = sorted(list(set([int(y[0]) for y in years_db if y[0] is not None] + [sel_year])))

    return {
        "year": sel_year,
        "total_annual_expense": float(annual_total),
        "highest_spending_month": highest_month,
        "lowest_spending_month": lowest_month,
        "average_monthly_expense": avg_monthly,
        "active_months_recorded": active_months_count,
        "monthly_trend": monthly_series,
        "category_annual_breakdown": category_annual_breakdown,
        "available_years": available_years
    }

@router.post("", response_model=ExpenseOut)
def record_manual_expense(
    exp_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = Expense(
        user_id=current_user.user_id,
        category_id=exp_in.category_id,
        amount=exp_in.amount,
        expense_date=exp_in.expense_date,
        description=exp_in.description.strip(),
        payment_mode=exp_in.payment_mode
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)

    cat = db.query(Category).filter(Category.category_id == exp.category_id).first()
    return ExpenseOut(
        expense_id=exp.expense_id,
        category_id=exp.category_id,
        category_name=cat.name if cat else "Other",
        amount=float(exp.amount),
        expense_date=exp.expense_date,
        description=exp.description,
        payment_mode=exp.payment_mode
    )
