# HOMESTOCK: Entity-Relationship (ER) Architecture
**Intelligent Household Grocery, Inventory & Expense Management System**
*DBMS Academic Project Documentation*

---

## 1. Relational Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : "owns"
    USERS ||--o{ BILLS : "uploads"
    USERS ||--o{ PURCHASES : "records"
    USERS ||--o{ MONTHLY_GROCERY_LISTS : "creates"
    USERS ||--o{ RECURRING_GROCERY_ITEMS : "defines"
    USERS ||--o{ EXPENSES : "incurs"
    USERS ||--o{ MONTHLY_BUDGETS : "allocates"
    USERS ||--o{ NOTIFICATIONS : "receives"

    CATEGORIES ||--o{ PRODUCTS : "classifies"
    CATEGORIES ||--o{ PURCHASE_ITEMS : "tags"
    CATEGORIES ||--o{ GROCERY_LIST_ITEMS : "categorizes"
    CATEGORIES ||--o{ RECURRING_GROCERY_ITEMS : "categorizes"
    CATEGORIES ||--o{ EXPENSES : "categorizes"

    PRODUCTS ||--o{ INVENTORY_BATCHES : "contains"
    PRODUCTS ||--o{ STOCK_MOVEMENTS : "tracks"
    PRODUCTS ||--o{ PURCHASE_ITEMS : "maps_to"
    PRODUCTS ||--o{ GROCERY_LIST_ITEMS : "references"
    PRODUCTS ||--o{ RECURRING_GROCERY_ITEMS : "templates"

    BILLS ||--o| PURCHASES : "generates"

    PURCHASES ||--o{ PURCHASE_ITEMS : "includes"
    PURCHASES ||--o| EXPENSES : "creates"

    INVENTORY_BATCHES ||--o{ STOCK_MOVEMENTS : "audits"
    INVENTORY_BATCHES ||--o{ PURCHASE_ITEMS : "originates"

    MONTHLY_GROCERY_LISTS ||--o{ GROCERY_LIST_ITEMS : "lists"

    USERS {
        int user_id PK
        string full_name
        string email UK
        string password_hash
        string phone
        string currency
        timestamp created_at
    }

    CATEGORIES {
        int category_id PK
        string name UK
        string description
        int default_shelf_life_days
        string icon_name
    }

    PRODUCTS {
        int product_id PK
        int user_id FK
        int category_id FK
        string product_name
        string default_unit
        decimal min_stock_level
        decimal current_quantity
        string storage_location
        decimal purchase_price
        timestamp created_at
    }

    INVENTORY_BATCHES {
        int batch_id PK
        int product_id FK
        int user_id FK
        string batch_number
        decimal quantity
        decimal initial_quantity
        date purchase_date
        date expiry_date
        decimal unit_price
        string status
    }

    STOCK_MOVEMENTS {
        int movement_id PK
        int product_id FK
        int batch_id FK
        int user_id FK
        string movement_type
        decimal quantity_changed
        decimal balance_after
        string notes
        timestamp created_at
    }

    BILLS {
        int bill_id PK
        int user_id FK
        string store_name
        string bill_number
        date bill_date
        decimal total_amount
        decimal tax_amount
        decimal discount_amount
        text raw_ocr_text
        blob bill_image_blob
        string status
    }

    PURCHASES {
        int purchase_id PK
        int bill_id FK
        int user_id FK
        string store_name
        date purchase_date
        decimal total_amount
        string payment_method
    }

    PURCHASE_ITEMS {
        int purchase_item_id PK
        int purchase_id FK
        int product_id FK
        string item_name
        int category_id FK
        decimal quantity
        string unit
        decimal unit_price
        decimal line_total
    }

    MONTHLY_GROCERY_LISTS {
        int list_id PK
        int user_id FK
        int month
        int year
        string list_name
        string status
        decimal total_estimated_cost
    }

    GROCERY_LIST_ITEMS {
        int list_item_id PK
        int list_id FK
        int product_id FK
        string item_name
        decimal target_quantity
        string unit
        decimal estimated_price
        boolean is_purchased
        boolean is_skipped
    }

    RECURRING_GROCERY_ITEMS {
        int recurring_id PK
        int user_id FK
        string item_name
        decimal preferred_monthly_quantity
        string unit
        string priority
        boolean is_active
    }

    EXPENSES {
        int expense_id PK
        int user_id FK
        int purchase_id FK
        int category_id FK
        decimal amount
        date expense_date
        string description
        string payment_mode
    }

    MONTHLY_BUDGETS {
        int budget_id PK
        int user_id FK
        int month
        int year
        decimal budget_amount
    }

    NOTIFICATIONS {
        int notification_id PK
        int user_id FK
        string type
        string title
        text message
        boolean is_read
    }
```

---

## 2. Relational Cardinality & Normalization

1. **Third Normal Form (3NF) Compliance**:
   - Every non-key column is fully functionally dependent on the Primary Key.
   - Transitive dependencies are removed (e.g. Category details reside in `categories`, not duplicated in `products` or `purchase_items`).
   - Line total calculations are strictly validated via SQL integrity checks.
2. **Referential Integrity**:
   - `ON DELETE CASCADE`: Deleting a user safely cascades to their inventory, bills, lists, and expenses.
   - `ON DELETE SET NULL`: Deleting a bill does not destroy historical financial accounting in purchases or stock audit trails.
3. **BLOB Storage**:
   - Original physical receipt photos are preserved directly inside the MySQL database in the `bill_image_blob` column (`LONGBLOB`).
