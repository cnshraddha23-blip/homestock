-- ==========================================================
-- HOMESTOCK: Intelligent Household Grocery, Inventory & Expense Management System
-- DBMS: MySQL 8.0+ Schema (Workbench Compatible)
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==========================================================

DROP DATABASE IF EXISTS homestock;
CREATE DATABASE homestock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE homestock;

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ----------------------------------------------------------
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    default_shelf_life_days INT DEFAULT 7 CHECK (default_shelf_life_days > 0),
    icon_name VARCHAR(50) DEFAULT 'Package',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. PRODUCTS TABLE (Item Catalog & Current Stock)
-- ----------------------------------------------------------
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    product_name VARCHAR(120) NOT NULL,
    default_unit VARCHAR(20) NOT NULL DEFAULT 'kg', -- kg, g, litre, ml, pcs, pack
    min_stock_level DECIMAL(10, 2) NOT NULL DEFAULT 1.00 CHECK (min_stock_level >= 0),
    current_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (current_quantity >= 0),
    storage_location ENUM('Refrigerator', 'Freezer', 'Pantry', 'Spice Rack', 'Kitchen Shelf') DEFAULT 'Pantry',
    purchase_price DECIMAL(10, 2) DEFAULT 0.00 CHECK (purchase_price >= 0),
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    UNIQUE KEY uq_user_product (user_id, product_name),
    INDEX idx_product_user (user_id),
    INDEX idx_product_category (category_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. INVENTORY BATCHES (Multiple batches with individual expiry dates)
-- ----------------------------------------------------------
CREATE TABLE inventory_batches (
    batch_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity >= 0),
    initial_quantity DECIMAL(10, 2) NOT NULL CHECK (initial_quantity >= 0),
    purchase_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    unit_price DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('SAFE', 'EXPIRING_SOON', 'EXPIRED', 'CONSUMED', 'DISCARDED') DEFAULT 'SAFE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_batch_expiry (expiry_date),
    INDEX idx_batch_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. STOCK MOVEMENTS (Audit Trail of all inventory shifts)
-- ----------------------------------------------------------
CREATE TABLE stock_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    batch_id INT NULL,
    user_id INT NOT NULL,
    movement_type ENUM('PURCHASE', 'CONSUMPTION', 'DISCARD', 'ADJUSTMENT') NOT NULL,
    quantity_changed DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES inventory_batches(batch_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_movement_product (product_id),
    INDEX idx_movement_created (created_at)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. BILLS TABLE (Scanned Bills & Receipts with BLOB & OCR)
-- ----------------------------------------------------------
CREATE TABLE bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_name VARCHAR(120) NOT NULL,
    store_address VARCHAR(255) NULL,
    bill_number VARCHAR(80) NULL,
    bill_date DATE NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    raw_ocr_text MEDIUMTEXT NULL,
    bill_image_blob LONGBLOB NULL,
    file_name VARCHAR(200) NULL,
    mime_type VARCHAR(50) DEFAULT 'image/jpeg',
    status ENUM('CONFIRMED', 'PENDING', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_bill_user (user_id),
    INDEX idx_bill_date (bill_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. PURCHASES TABLE
-- ----------------------------------------------------------
CREATE TABLE purchases (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NULL UNIQUE,
    user_id INT NOT NULL,
    store_name VARCHAR(120) NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(50) DEFAULT 'UPI / Card',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_purchase_user_date (user_id, purchase_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. PURCHASE ITEMS TABLE (Individual line items from confirmed bills)
-- ----------------------------------------------------------
CREATE TABLE purchase_items (
    purchase_item_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    product_id INT NULL,
    item_name VARCHAR(120) NOT NULL,
    category_id INT NULL,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    line_total DECIMAL(10, 2) NOT NULL CHECK (line_total >= 0),
    batch_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (batch_id) REFERENCES inventory_batches(batch_id) ON DELETE SET NULL,
    INDEX idx_purchase_items_purchase (purchase_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. MONTHLY GROCERY LISTS TABLE
-- ----------------------------------------------------------
CREATE TABLE monthly_grocery_lists (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2024),
    list_name VARCHAR(100) NOT NULL,
    status ENUM('DRAFT', 'ACTIVE', 'COMPLETED') DEFAULT 'ACTIVE',
    total_estimated_cost DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_grocery_list_user_period (user_id, year, month)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 10. GROCERY LIST ITEMS TABLE
-- ----------------------------------------------------------
CREATE TABLE grocery_list_items (
    list_item_id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL,
    product_id INT NULL,
    item_name VARCHAR(120) NOT NULL,
    category_id INT NULL,
    target_quantity DECIMAL(10, 2) NOT NULL CHECK (target_quantity > 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    estimated_price DECIMAL(10, 2) DEFAULT 0.00,
    is_purchased BOOLEAN DEFAULT FALSE,
    is_skipped BOOLEAN DEFAULT FALSE,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES monthly_grocery_lists(list_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 11. RECURRING GROCERY ITEMS (Master Template of Essentials)
-- ----------------------------------------------------------
CREATE TABLE recurring_grocery_items (
    recurring_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NULL,
    item_name VARCHAR(120) NOT NULL,
    category_id INT NULL,
    preferred_monthly_quantity DECIMAL(10, 2) NOT NULL CHECK (preferred_monthly_quantity > 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    priority ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'HIGH',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    UNIQUE KEY uq_user_recurring_item (user_id, item_name)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 12. EXPENSES TABLE (Detailed Financial Ledger)
-- ----------------------------------------------------------
CREATE TABLE expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    purchase_id INT NULL,
    category_id INT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'UPI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    INDEX idx_expense_user_date (user_id, expense_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 13. MONTHLY BUDGETS TABLE
-- ----------------------------------------------------------
CREATE TABLE monthly_budgets (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2024),
    budget_amount DECIMAL(12, 2) NOT NULL CHECK (budget_amount > 0),
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_monthly_budget (user_id, year, month)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 14. NOTIFICATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('EXPIRY_ALERT', 'LOW_STOCK', 'BUDGET_EXCEEDED', 'BILL_SCANNED', 'GENERAL') NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    reference_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notification_user_unread (user_id, is_read)
) ENGINE=InnoDB;

-- ==========================================================
-- DATABASE VIEWS FOR REPORTING & ANALYTICS
-- ==========================================================

-- View 1: Inventory Health & Restock Assessment
CREATE OR REPLACE VIEW view_inventory_status AS
SELECT 
    p.user_id,
    p.product_id,
    p.product_name,
    c.name AS category_name,
    p.current_quantity,
    p.min_stock_level,
    p.default_unit,
    p.storage_location,
    CASE 
        WHEN p.current_quantity = 0 THEN 'OUT_OF_STOCK'
        WHEN p.current_quantity <= p.min_stock_level THEN 'LOW_STOCK'
        ELSE 'AVAILABLE'
    END AS stock_status,
    COUNT(b.batch_id) AS active_batches_count
FROM products p
JOIN categories c ON p.category_id = c.category_id
LEFT JOIN inventory_batches b ON p.product_id = b.product_id AND b.quantity > 0 AND b.status IN ('SAFE', 'EXPIRING_SOON')
GROUP BY p.user_id, p.product_id, p.product_name, c.name, p.current_quantity, p.min_stock_level, p.default_unit, p.storage_location;

-- View 2: Expiry Monitoring Status
CREATE OR REPLACE VIEW view_expiry_alerts AS
SELECT 
    b.batch_id,
    b.user_id,
    p.product_id,
    p.product_name,
    c.name AS category_name,
    b.batch_number,
    b.quantity,
    p.default_unit,
    b.expiry_date,
    DATEDIFF(b.expiry_date, CURDATE()) AS days_until_expiry,
    CASE 
        WHEN b.expiry_date < CURDATE() THEN 'EXPIRED'
        WHEN b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'EXPIRING_SOON'
        ELSE 'SAFE'
    END AS computed_expiry_status,
    b.status AS recorded_status
FROM inventory_batches b
JOIN products p ON b.product_id = p.product_id
JOIN categories c ON p.category_id = c.category_id
WHERE b.quantity > 0 AND b.status NOT IN ('CONSUMED', 'DISCARDED');

-- View 3: Monthly Expense Rollup by Category
CREATE OR REPLACE VIEW view_monthly_expense_summary AS
SELECT 
    e.user_id,
    YEAR(e.expense_date) AS expense_year,
    MONTH(e.expense_date) AS expense_month,
    COALESCE(c.name, 'Other') AS category_name,
    COUNT(e.expense_id) AS total_transactions,
    SUM(e.amount) AS total_expense_amount
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.category_id
GROUP BY e.user_id, YEAR(e.expense_date), MONTH(e.expense_date), c.name;

-- View 4: Annual Expense Grand Rollup
CREATE OR REPLACE VIEW view_annual_expense_summary AS
SELECT 
    e.user_id,
    YEAR(e.expense_date) AS expense_year,
    COUNT(e.expense_id) AS total_transactions,
    SUM(e.amount) AS annual_total_expense,
    AVG(e.amount) AS average_bill_amount,
    MAX(e.amount) AS highest_single_expense
FROM expenses e
GROUP BY e.user_id, YEAR(e.expense_date);

-- ==========================================================
-- STORED PROCEDURES
-- ==========================================================

DELIMITER $$

-- Procedure to generate an intelligent monthly grocery list
CREATE PROCEDURE sp_generate_monthly_grocery_list(
    IN p_user_id INT,
    IN p_month INT,
    IN p_year INT,
    OUT p_list_id INT
)
BEGIN
    DECLARE v_list_name VARCHAR(100);
    SET v_list_name = CONCAT('Auto-Plan: ', DATE_FORMAT(CONCAT(p_year, '-', LPAD(p_month, 2, '00'), '-01'), '%M %Y'));

    -- 1. Create list master entry
    INSERT INTO monthly_grocery_lists (user_id, month, year, list_name, status)
    VALUES (p_user_id, p_month, p_year, v_list_name, 'ACTIVE');

    SET p_list_id = LAST_INSERT_ID();

    -- 2. Populate items from Recurring Essentials considering current stock deficits
    INSERT INTO grocery_list_items (list_id, product_id, item_name, category_id, target_quantity, unit, estimated_price)
    SELECT 
        p_list_id,
        r.product_id,
        r.item_name,
        r.category_id,
        GREATEST(1.00, r.preferred_monthly_quantity - COALESCE(p.current_quantity, 0)),
        r.unit,
        COALESCE(p.purchase_price, 50.00)
    FROM recurring_grocery_items r
    LEFT JOIN products p ON r.product_id = p.product_id
    WHERE r.user_id = p_user_id 
      AND r.is_active = TRUE
      AND (p.current_quantity IS NULL OR p.current_quantity < r.preferred_monthly_quantity);

    -- 3. Also include any other low-stock or out-of-stock items not already in recurring list
    INSERT INTO grocery_list_items (list_id, product_id, item_name, category_id, target_quantity, unit, estimated_price)
    SELECT 
        p_list_id,
        p.product_id,
        p.product_name,
        p.category_id,
        GREATEST(1.00, p.min_stock_level * 2 - p.current_quantity),
        p.default_unit,
        p.purchase_price
    FROM products p
    WHERE p.user_id = p_user_id
      AND p.current_quantity <= p.min_stock_level
      AND p.product_id NOT IN (
          SELECT product_id FROM grocery_list_items WHERE list_id = p_list_id AND product_id IS NOT NULL
      );

    -- 4. Calculate total estimated cost
    UPDATE monthly_grocery_lists
    SET total_estimated_cost = (
        SELECT COALESCE(SUM(target_quantity * estimated_price), 0.00) 
        FROM grocery_list_items 
        WHERE list_id = p_list_id
    )
    WHERE list_id = p_list_id;

END$$

DELIMITER ;
