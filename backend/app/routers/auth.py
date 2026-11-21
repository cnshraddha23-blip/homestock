from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Category, Product, RecurringGroceryItem
from app.schemas import UserRegister, UserLogin, Token, UserOut
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Create new user
    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        phone=user_in.phone,
        currency=user_in.currency
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Seed initial recurring essentials for new user
    essentials = [
        ("Basmati Rice", 4, 10.0, "kg", "HIGH"),
        ("Chakki Fresh Atta", 4, 10.0, "kg", "HIGH"),
        ("Fresh Milk", 3, 15.0, "litre", "HIGH"),
        ("Toor Dal", 5, 2.0, "kg", "MEDIUM"),
        ("Red Onions", 1, 5.0, "kg", "MEDIUM"),
    ]
    for item_name, cat_id, qty, unit, priority in essentials:
        rec = RecurringGroceryItem(
            user_id=user.user_id,
            item_name=item_name,
            category_id=cat_id,
            preferred_monthly_quantity=qty,
            unit=unit,
            priority=priority,
            is_active=True
        )
        db.add(rec)
    db.commit()

    token = create_access_token({"sub": user.email, "user_id": user.user_id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": user.email, "user_id": user.user_id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
