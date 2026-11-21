from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH SCHEMAS -----------------
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    currency: str = "INR"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    currency: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- CATEGORY SCHEMAS -----------------
class CategoryOut(BaseModel):
    category_id: int
    name: str
    description: Optional[str]
    default_shelf_life_days: int
    icon_name: str

    class Config:
        from_attributes = True

# ----------------- INVENTORY & BATCH SCHEMAS -----------------
class BatchCreate(BaseModel):
    batch_number: Optional[str] = None
    quantity: float = Field(..., gt=0)
    purchase_date: Optional[date] = None
    expiry_date: date
    unit_price: Optional[float] = 0.0

class BatchOut(BaseModel):
    batch_id: int
    product_id: int
    batch_number: str
    quantity: float
    initial_quantity: float
    purchase_date: date
    expiry_date: date
    unit_price: float
    status: str
    days_left: Optional[int] = None

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    product_name: str
    category_id: int
    default_unit: str = "kg"
    min_stock_level: float = 1.0
    current_quantity: float = 0.0
    storage_location: str = "Pantry"
    purchase_price: float = 0.0
    expiry_date: Optional[date] = None  # Optional initial batch expiry

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    category_id: Optional[int] = None
    default_unit: Optional[str] = None
    min_stock_level: Optional[float] = None
    current_quantity: Optional[float] = None
    storage_location: Optional[str] = None
    purchase_price: Optional[float] = None

class ProductOut(BaseModel):
    product_id: int
    user_id: int
    category_id: int
    category_name: Optional[str] = None
    product_name: str
    default_unit: str
    min_stock_level: float
    current_quantity: float
    storage_location: str
    purchase_price: float
    image_url: Optional[str] = None
    stock_status: Optional[str] = None  # SAFE, LOW_STOCK, OUT_OF_STOCK
    earliest_expiry: Optional[date] = None
    batches: List[BatchOut] = []

    class Config:
        from_attributes = True

class StockMovementCreate(BaseModel):
    movement_type: str = "CONSUMPTION"  # CONSUMPTION, DISCARD, ADJUSTMENT
    quantity: float = Field(..., gt=0)
    batch_id: Optional[int] = None
    notes: Optional[str] = None

class StockMovementOut(BaseModel):
    movement_id: int
    product_id: int
    product_name: Optional[str] = None
    movement_type: str
    quantity_changed: float
    balance_after: float
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- BILL & OCR SCHEMAS -----------------
class ExtractedItem(BaseModel):
    item_name: str
    category_id: Optional[int] = None
    category_name: Optional[str] = "Grains"
    quantity: float = 1.0
    unit: str = "kg"
    unit_price: float = 0.0
    line_total: float = 0.0
    confidence: float = 0.95

class OCRScanResult(BaseModel):
    store_name: str
    store_address: Optional[str] = None
    bill_number: Optional[str] = None
    purchase_date: date
    subtotal: float
    tax: float
    discount: float
    total_amount: float
    raw_ocr_text: str
    items: List[ExtractedItem] = []
    confidence_score: float = 0.92

class BillConfirmItem(BaseModel):
    item_name: str
    category_id: int
    quantity: float
    unit: str
    unit_price: float
    line_total: float
    expiry_date: Optional[date] = None
    storage_location: Optional[str] = "Pantry"

class BillConfirmRequest(BaseModel):
    store_name: str
    store_address: Optional[str] = None
    bill_number: Optional[str] = None
    purchase_date: date
    total_amount: float
    tax_amount: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0
    payment_method: str = "UPI / Card"
    raw_ocr_text: Optional[str] = None
    bill_image_base64: Optional[str] = None
    items: List[BillConfirmItem]

class BillOut(BaseModel):
    bill_id: int
    store_name: str
    bill_number: Optional[str]
    bill_date: date
    total_amount: float
    status: str
    has_image: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- GROCERY LIST & RECURRING SCHEMAS -----------------
class GroceryListItemCreate(BaseModel):
    item_name: str
    category_id: Optional[int] = None
    target_quantity: float
    unit: str = "kg"
    estimated_price: float = 0.0
    notes: Optional[str] = None

class GroceryListItemUpdate(BaseModel):
    item_name: Optional[str] = None
    target_quantity: Optional[float] = None
    unit: Optional[str] = None
    estimated_price: Optional[float] = None
    is_purchased: Optional[bool] = None
    is_skipped: Optional[bool] = None
    notes: Optional[str] = None

class GroceryListItemOut(BaseModel):
    list_item_id: int
    list_id: int
    product_id: Optional[int] = None
    item_name: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    target_quantity: float
    unit: str
    estimated_price: float
    is_purchased: bool
    is_skipped: bool
    notes: Optional[str]

    class Config:
        from_attributes = True

class MonthlyGroceryListOut(BaseModel):
    list_id: int
    user_id: int
    month: int
    year: int
    list_name: str
    status: str
    total_estimated_cost: float
    items: List[GroceryListItemOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

class RecurringItemCreate(BaseModel):
    item_name: str
    category_id: Optional[int] = None
    preferred_monthly_quantity: float
    unit: str = "kg"
    priority: str = "HIGH"

class RecurringItemOut(BaseModel):
    recurring_id: int
    user_id: int
    item_name: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    preferred_monthly_quantity: float
    unit: str
    priority: str
    is_active: bool

    class Config:
        from_attributes = True

# ----------------- EXPENSES & BUDGET SCHEMAS -----------------
class ExpenseCreate(BaseModel):
    category_id: Optional[int] = None
    amount: float
    expense_date: date
    description: str
    payment_mode: str = "UPI"

class ExpenseOut(BaseModel):
    expense_id: int
    category_id: Optional[int]
    category_name: Optional[str]
    amount: float
    expense_date: date
    description: str
    payment_mode: str

    class Config:
        from_attributes = True

class BudgetCreate(BaseModel):
    month: int
    year: int
    budget_amount: float
    notes: Optional[str] = None

class BudgetOut(BaseModel):
    budget_id: int
    month: int
    year: int
    budget_amount: float
    notes: Optional[str]

    class Config:
        from_attributes = True

# ----------------- NOTIFICATION SCHEMAS -----------------
class NotificationOut(BaseModel):
    notification_id: int
    type: str
    title: str
    message: str
    reference_id: Optional[int]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- DASHBOARD SUMMARY SCHEMAS -----------------
class InventorySummary(BaseModel):
    total_products: int
    available_products: int
    low_stock_products: int
    out_of_stock_products: int

class ExpenseSummary(BaseModel):
    current_month_expense: float
    previous_month_expense: float
    annual_expense: float
    average_monthly_expense: float
    current_month_budget: Optional[float] = None
    remaining_budget: Optional[float] = None

class ExpirySummary(BaseModel):
    expiring_in_7_days: int
    expiring_in_30_days: int
    expired_products: int

class RecentPurchase(BaseModel):
    purchase_id: int
    store_name: str
    purchase_date: date
    total_amount: float
    has_bill_image: bool

class DashboardSummaryOut(BaseModel):
    inventory: InventorySummary
    expenses: ExpenseSummary
    expiry: ExpirySummary
    recent_purchases: List[RecentPurchase]
    unread_notifications_count: int
