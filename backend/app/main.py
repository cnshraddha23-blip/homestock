import logging
from datetime import date, datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import (
    Category, User, Product, InventoryBatch, StockMovement, 
    RecurringGroceryItem, Expense, MonthlyBudget, Notification
)
from app.auth import get_password_hash
from app.routers import (
    auth, dashboard, bills, inventory, expiry, shopping_lists, expenses, budgets, notifications
)

logger = logging.getLogger("homestock")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="HomeStock API",
    description="Intelligent Household Grocery, Inventory & Expense Management System (DBMS Academic Project)",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(bills.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(expiry.router, prefix=settings.API_V1_STR)
app.include_router(shopping_lists.router, prefix=settings.API_V1_STR)
app.include_router(expenses.router, prefix=settings.API_V1_STR)
app.include_router(budgets.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "database": engine.dialect.name,
        "version": "1.0.0"
    }

@app.on_event("startup")
def on_startup():
    # 1. Create tables if not exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")

    # 2. Seed Default Categories if empty
    db: Session = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            logger.info("Seeding default categories...")
            default_categories = [
                Category(name="Vegetables", description="Fresh seasonal greens and produce", default_shelf_life_days=5, icon_name="Carrot"),
                Category(name="Fruits", description="Fresh whole fruits and berries", default_shelf_life_days=7, icon_name="Apple"),
                Category(name="Dairy", description="Milk, curd, butter, ghee, and paneer", default_shelf_life_days=6, icon_name="Milk"),
                Category(name="Grains", description="Rice, wheat atta, oats, and flours", default_shelf_life_days=180, icon_name="Wheat"),
                Category(name="Pulses", description="Dals, lentils, chickpeas, and legumes", default_shelf_life_days=180, icon_name="CircleDot"),
                Category(name="Snacks", description="Biscuits, dry snacks, and chips", default_shelf_life_days=90, icon_name="Cookie"),
                Category(name="Beverages", description="Tea, coffee, health drinks", default_shelf_life_days=120, icon_name="Coffee"),
                Category(name="Spices", description="Whole spices and ground masalas", default_shelf_life_days=240, icon_name="Flame"),
                Category(name="Personal Care", description="Soap, shampoo, oral care", default_shelf_life_days=365, icon_name="Sparkles"),
                Category(name="Cleaning Products", description="Detergents and dish cleaners", default_shelf_life_days=365, icon_name="ShieldCheck"),
                Category(name="Other", description="General household pantry items", default_shelf_life_days=60, icon_name="Package"),
            ]
            db.add_all(default_categories)
            db.commit()

        # 3. Seed Demo User if not present
        demo_user = db.query(User).filter(User.email == "aarav.sharma@example.com").first()
        if not demo_user:
            logger.info("Seeding academic demonstration user (Aarav Sharma)...")
            demo_user = User(
                full_name="Aarav Sharma",
                email="aarav.sharma@example.com",
                password_hash=get_password_hash("Password@123"),
                phone="+91 9876543210",
                currency="INR"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            uid = demo_user.user_id

            # Seed Demo Products & Batches
            p_data = [
                ("Basmati Rice", 4, "kg", 5.0, 2.5, "Pantry", 120.0, 150),
                ("Chakki Fresh Atta", 4, "kg", 5.0, 8.0, "Pantry", 55.0, 90),
                ("Amul Taza Milk", 3, "litre", 2.0, 1.0, "Refrigerator", 64.0, 3), # Expiring in 3 days!
                ("Fresh Malai Paneer", 3, "g", 400.0, 200.0, "Refrigerator", 110.0, 5), # Expiring in 5 days!
                ("Organic Tomatoes", 1, "kg", 2.0, 0.5, "Refrigerator", 35.0, -2), # Expired!
                ("Toor Dal Premium", 5, "kg", 2.0, 0.8, "Pantry", 165.0, 120), # Low stock!
                ("Kashmiri Apples", 2, "kg", 1.0, 0.0, "Refrigerator", 160.0, 7), # Out of stock!
                ("Red Onions", 1, "kg", 3.0, 1.5, "Kitchen Shelf", 42.0, 10), # Low stock!
                ("Tata Tea Gold", 7, "g", 500.0, 750.0, "Pantry", 320.0, 200),
                ("Vim Dishwash Gel", 10, "ml", 500.0, 750.0, "Kitchen Shelf", 135.0, 300),
            ]

            today = date.today()
            for name, cat_id, unit, min_s, cur_q, loc, price, days_off in p_data:
                prod = Product(
                    user_id=uid,
                    category_id=cat_id,
                    product_name=name,
                    default_unit=unit,
                    min_stock_level=min_s,
                    current_quantity=cur_q,
                    storage_location=loc,
                    purchase_price=price
                )
                db.add(prod)
                db.flush()

                if cur_q > 0:
                    exp_d = today + timedelta(days=days_off)
                    status_str = "EXPIRED" if days_off < 0 else ("EXPIRING_SOON" if days_off <= 7 else "SAFE")
                    batch = InventoryBatch(
                        product_id=prod.product_id,
                        user_id=uid,
                        batch_number=f"DEMO-{prod.product_id}",
                        quantity=cur_q,
                        initial_quantity=cur_q * 1.5,
                        purchase_date=today - timedelta(days=5),
                        expiry_date=exp_d,
                        unit_price=price,
                        status=status_str
                    )
                    db.add(batch)

            # Seed Recurring Essentials
            recurring_seed = [
                ("Basmati Rice", 4, 10.0, "kg", "HIGH"),
                ("Chakki Fresh Atta", 4, 10.0, "kg", "HIGH"),
                ("Amul Taza Milk", 3, 15.0, "litre", "HIGH"),
                ("Toor Dal Premium", 5, 2.0, "kg", "MEDIUM"),
                ("Red Onions", 1, 5.0, "kg", "MEDIUM"),
                ("Kashmiri Apples", 2, 3.0, "kg", "LOW"),
            ]
            for rname, rcat, rqty, runit, rprio in recurring_seed:
                db.add(RecurringGroceryItem(
                    user_id=uid,
                    item_name=rname,
                    category_id=rcat,
                    preferred_monthly_quantity=rqty,
                    unit=runit,
                    priority=rprio,
                    is_active=True
                ))

            # Seed Monthly Budget
            db.add(MonthlyBudget(
                user_id=uid,
                month=today.month,
                year=today.year,
                budget_amount=7000.0,
                notes="Household groceries & monthly pantry allocation"
            ))

            # Seed Historical Expenses (12 months of trends)
            for m in range(1, 12):
                db.add(Expense(
                    user_id=uid,
                    category_id=4,
                    amount=1800.0 + (m * 90.0),
                    expense_date=date(today.year, m, 8),
                    description=f"Monthly Supermarket Bulk Essentials (Month {m})",
                    payment_mode="UPI"
                ))
                db.add(Expense(
                    user_id=uid,
                    category_id=3,
                    amount=650.0 + (m * 40.0),
                    expense_date=date(today.year, m, 18),
                    description="Weekly Dairy, Butter & Milk Deliveries",
                    payment_mode="Card"
                ))

            # Seed Initial Notifications
            db.add(Notification(
                user_id=uid,
                type="LOW_STOCK",
                title="Low Stock: Basmati Rice",
                message="Basmati Rice is down to 2.50 kg (Threshold: 5.00 kg). Added to your auto-restock suggestions.",
                reference_id=1,
                is_read=False
            ))
            db.add(Notification(
                user_id=uid,
                type="EXPIRY_ALERT",
                title="Expiring Soon: Amul Taza Milk",
                message="Batch DEMO-3 of Amul Taza Milk expires in 3 days. Consume soon to avoid waste.",
                reference_id=3,
                is_read=False
            ))
            db.add(Notification(
                user_id=uid,
                type="EXPIRY_ALERT",
                title="Expired Product: Organic Tomatoes",
                message="Batch DEMO-5 of Organic Tomatoes expired 2 days ago. Please review and discard if spoiled.",
                reference_id=5,
                is_read=False
            ))

            db.commit()
            logger.info("Demo user dataset seeded successfully.")

    except Exception as e:
        logger.error("Error during startup seeding: %s", e)
        db.rollback()
    finally:
        db.close()
