from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, MonthlyBudget
from app.schemas import BudgetCreate, BudgetOut
from app.auth import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetOut])
def get_budgets(
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(MonthlyBudget).filter(MonthlyBudget.user_id == current_user.user_id)
    if year:
        query = query.filter(MonthlyBudget.year == year)
    budgets = query.order_by(MonthlyBudget.year.desc(), MonthlyBudget.month.desc()).all()
    return [
        BudgetOut(
            budget_id=b.budget_id,
            month=b.month,
            year=b.year,
            budget_amount=float(b.budget_amount),
            notes=b.notes
        ) for b in budgets
    ]

@router.post("", response_model=BudgetOut)
def set_budget(
    b_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uid = current_user.user_id
    existing = db.query(MonthlyBudget).filter(
        MonthlyBudget.user_id == uid,
        MonthlyBudget.month == b_in.month,
        MonthlyBudget.year == b_in.year
    ).first()

    if existing:
        existing.budget_amount = b_in.budget_amount
        existing.notes = b_in.notes
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        target = MonthlyBudget(
            user_id=uid,
            month=b_in.month,
            year=b_in.year,
            budget_amount=b_in.budget_amount,
            notes=b_in.notes
        )
        db.add(target)
        db.commit()
        db.refresh(target)

    return BudgetOut(
        budget_id=target.budget_id,
        month=target.month,
        year=target.year,
        budget_amount=float(target.budget_amount),
        notes=target.notes
    )
