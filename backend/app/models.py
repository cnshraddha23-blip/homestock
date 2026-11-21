import enum
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Numeric, Date, DateTime, Boolean, 
    ForeignKey, Text, LargeBinary, Enum, CheckConstraint, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base

class StorageLocationEnum(str, enum.Enum):
    REFRIGERATOR = "Refrigerator"
    FREEZER = "Freezer"
    PANTRY = "Pantry"
    SPICE_RACK = "Spice Rack"
    KITCHEN_SHELF = "Kitchen Shelf"

class BatchStatusEnum(str, enum.Enum):
    SAFE = "SAFE"
    EXPIRING_SOON = "EXPIRING_SOON"
    EXPIRED = "EXPIRED"
    CONSUMED = "CONSUMED"
    DISCARDED = "DISCARDED"

class MovementTypeEnum(str, enum.Enum):
    PURCHASE = "PURCHASE"
    CONSUMPTION = "CONSUMPTION"
    DISCARD = "DISCARD"
    ADJUSTMENT = "ADJUSTMENT"

class BillStatusEnum(str, enum.Enum):
    CONFIRMED = "CONFIRMED"
    PENDING = "PENDING"
    CANCELLED = "CANCELLED"

class PriorityEnum(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class ListStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"

class NotificationTypeEnum(str, enum.Enum):
    EXPIRY_ALERT = "EXPIRY_ALERT"
    LOW_STOCK = "LOW_STOCK"
    BUDGET_EXCEEDED = "BUDGET_EXCEEDED"
    BILL_SCANNED = "BILL_SCANNED"
    GENERAL = "GENERAL"


# 1. USERS
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    currency = Column(String(10), default="INR")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = relationship("Product", back_populates="user", cascade="all, delete-orphan")
    bills = relationship("Bill", back_populates="user", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="user", cascade="all, delete-orphan")
    grocery_lists = relationship("MonthlyGroceryList", back_populates="user", cascade="all, delete-orphan")
    recurring_items = relationship("RecurringGroceryItem", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("MonthlyBudget", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


# 2. CATEGORIES
class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(60), nullable=False, unique=True)
    description = Column(String(255), nullable=True)
    default_shelf_life_days = Column(Integer, default=7)
    icon_name = Column(String(50), default="Package")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    products = relationship("Product", back_populates="category")


# 3. PRODUCTS
class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="RESTRICT"), nullable=False, index=True)
    product_name = Column(String(120), nullable=False)
    default_unit = Column(String(20), nullable=False, default="kg")
    min_stock_level = Column(Numeric(10, 2), nullable=False, default=1.00)
    current_quantity = Column(Numeric(10, 2), nullable=False, default=0.00)
    storage_location = Column(String(50), default="Pantry")
    purchase_price = Column(Numeric(10, 2), default=0.00)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "product_name", name="uq_user_product"),
    )

    # Relationships
    user = relationship("User", back_populates="products")
    category = relationship("Category", back_populates="products")
    batches = relationship("InventoryBatch", back_populates="product", cascade="all, delete-orphan")
    stock_movements = relationship("StockMovement", back_populates="product", cascade="all, delete-orphan")


# 4. INVENTORY BATCHES
class InventoryBatch(Base):
    __tablename__ = "inventory_batches"

    batch_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number = Column(String(50), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    initial_quantity = Column(Numeric(10, 2), nullable=False)
    purchase_date = Column(Date, nullable=False, default=date.today)
    expiry_date = Column(Date, nullable=False, index=True)
    unit_price = Column(Numeric(10, 2), default=0.00)
    status = Column(String(20), default="SAFE", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="batches")


# 5. STOCK MOVEMENTS
class StockMovement(Base):
    __tablename__ = "stock_movements"

    movement_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False, index=True)
    batch_id = Column(Integer, ForeignKey("inventory_batches.batch_id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    movement_type = Column(String(20), nullable=False)  # PURCHASE, CONSUMPTION, DISCARD, ADJUSTMENT
    quantity_changed = Column(Numeric(10, 2), nullable=False)
    balance_after = Column(Numeric(10, 2), nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="stock_movements")


# 6. BILLS
class Bill(Base):
    __tablename__ = "bills"

    bill_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    store_name = Column(String(120), nullable=False)
    store_address = Column(String(255), nullable=True)
    bill_number = Column(String(80), nullable=True)
    bill_date = Column(Date, nullable=False, default=date.today, index=True)
    total_amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    tax_amount = Column(Numeric(10, 2), default=0.00)
    discount_amount = Column(Numeric(10, 2), default=0.00)
    raw_ocr_text = Column(Text, nullable=True)
    bill_image_blob = Column(LargeBinary, nullable=True)
    file_name = Column(String(200), nullable=True)
    mime_type = Column(String(50), default="image/jpeg")
    status = Column(String(20), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bills")
    purchase = relationship("Purchase", back_populates="bill", uselist=False)


# 7. PURCHASES
class Purchase(Base):
    __tablename__ = "purchases"

    purchase_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bill_id = Column(Integer, ForeignKey("bills.bill_id", ondelete="SET NULL"), nullable=True, unique=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    store_name = Column(String(120), nullable=False)
    purchase_date = Column(Date, nullable=False, default=date.today)
    total_amount = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String(50), default="UPI / Card")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="purchases")
    bill = relationship("Bill", back_populates="purchase")
    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")
    expense = relationship("Expense", back_populates="purchase", uselist=False)


# 8. PURCHASE ITEMS
class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    purchase_item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    purchase_id = Column(Integer, ForeignKey("purchases.purchase_id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String(120), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), default="kg")
    unit_price = Column(Numeric(10, 2), nullable=False)
    line_total = Column(Numeric(10, 2), nullable=False)
    batch_id = Column(Integer, ForeignKey("inventory_batches.batch_id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    purchase = relationship("Purchase", back_populates="items")


# 9. MONTHLY GROCERY LISTS
class MonthlyGroceryList(Base):
    __tablename__ = "monthly_grocery_lists"

    list_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    list_name = Column(String(100), nullable=False)
    status = Column(String(20), default="ACTIVE")
    total_estimated_cost = Column(Numeric(12, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="grocery_lists")
    items = relationship("GroceryListItem", back_populates="grocery_list", cascade="all, delete-orphan")


# 10. GROCERY LIST ITEMS
class GroceryListItem(Base):
    __tablename__ = "grocery_list_items"

    list_item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    list_id = Column(Integer, ForeignKey("monthly_grocery_lists.list_id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String(120), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="SET NULL"), nullable=True)
    target_quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), default="kg")
    estimated_price = Column(Numeric(10, 2), default=0.00)
    is_purchased = Column(Boolean, default=False)
    is_skipped = Column(Boolean, default=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    grocery_list = relationship("MonthlyGroceryList", back_populates="items")


# 11. RECURRING GROCERY ITEMS
class RecurringGroceryItem(Base):
    __tablename__ = "recurring_grocery_items"

    recurring_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String(120), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="SET NULL"), nullable=True)
    preferred_monthly_quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), default="kg")
    priority = Column(String(10), default="HIGH")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "item_name", name="uq_user_recurring_item"),
    )

    # Relationships
    user = relationship("User", back_populates="recurring_items")


# 12. EXPENSES
class Expense(Base):
    __tablename__ = "expenses"

    expense_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.purchase_id", ondelete="SET NULL"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="SET NULL"), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    expense_date = Column(Date, nullable=False, default=date.today, index=True)
    description = Column(String(255), nullable=False)
    payment_mode = Column(String(50), default="UPI")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="expenses")
    purchase = relationship("Purchase", back_populates="expense")


# 13. MONTHLY BUDGETS
class MonthlyBudget(Base):
    __tablename__ = "monthly_budgets"

    budget_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    budget_amount = Column(Numeric(12, 2), nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "year", "month", name="uq_user_monthly_budget"),
    )

    # Relationships
    user = relationship("User", back_populates="budgets")


# 14. NOTIFICATIONS
class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(30), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    reference_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
