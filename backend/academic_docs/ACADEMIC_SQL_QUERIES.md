-- ==========================================================
-- HOMESTOCK: Academic SQL Demonstration Queries
-- Suitable for Viva, DBMS Lab Evaluations & Query Presentations
-- DBMS: MySQL 8.0+
-- ==========================================================

USE homestock;

-- ----------------------------------------------------------
-- 1. INNER JOIN & AGGREGATION: Total Stock Value by Category
-- Demonstrates: Multi-table JOIN, SUM, GROUP BY, ORDER BY
-- ----------------------------------------------------------
SELECT 
    c.category_id,
    c.name AS category_name,
    COUNT(p.product_id) AS total_products,
    SUM(p.current_quantity) AS total_quantity_in_stock,
    ROUND(SUM(p.current_quantity * p.purchase_price), 2) AS estimated_category_valuation
FROM categories c
INNER JOIN products p ON c.category_id = p.category_id
WHERE p.user_id = 1
GROUP BY c.category_id, c.name
ORDER BY estimated_category_valuation DESC;

-- ----------------------------------------------------------
-- 2. DATEDIFF & CONDITIONAL CASE: Active Expiry Classification
-- Demonstrates: Date arithmetic, CASE WHEN, Filtering active batches
-- ----------------------------------------------------------
SELECT 
    p.product_name,
    c.name AS category,
    b.batch_number,
    b.quantity,
    p.default_unit,
    b.expiry_date,
    DATEDIFF(b.expiry_date, CURDATE()) AS days_remaining,
    CASE 
        WHEN b.expiry_date < CURDATE() THEN 'EXPIRED'
        WHEN DATEDIFF(b.expiry_date, CURDATE()) <= 3 THEN 'CRITICAL (<= 3 Days)'
        WHEN DATEDIFF(b.expiry_date, CURDATE()) <= 7 THEN 'WARNING (<= 7 Days)'
        ELSE 'SAFE'
    END AS urgency_level
FROM inventory_batches b
JOIN products p ON b.product_id = p.product_id
JOIN categories c ON p.category_id = c.category_id
WHERE b.user_id = 1 
  AND b.quantity > 0 
  AND b.status NOT IN ('CONSUMED', 'DISCARDED')
ORDER BY b.expiry_date ASC;

-- ----------------------------------------------------------
-- 3. SUBQUERY & DEFICIT CALCULATION: Smart Reordering Needs
-- Demonstrates: Correlated Subquery, GREATEST function, Left Join
-- ----------------------------------------------------------
SELECT 
    r.item_name,
    c.name AS category,
    r.preferred_monthly_quantity AS desired_qty,
    COALESCE(p.current_quantity, 0.00) AS current_stock,
    GREATEST(0.00, r.preferred_monthly_quantity - COALESCE(p.current_quantity, 0.00)) AS quantity_to_purchase,
    r.unit,
    r.priority
FROM recurring_grocery_items r
LEFT JOIN products p ON r.user_id = p.user_id AND LOWER(r.item_name) = LOWER(p.product_name)
LEFT JOIN categories c ON r.category_id = c.category_id
WHERE r.user_id = 1 AND r.is_active = TRUE
HAVING quantity_to_purchase > 0
ORDER BY CASE r.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END;

-- ----------------------------------------------------------
-- 4. WINDOW FUNCTION: Monthly Expenditure & Cumulative Annual Run
-- Demonstrates: Window SUM() OVER (ORDER BY), Partitioning
-- ----------------------------------------------------------
SELECT 
    YEAR(expense_date) AS fiscal_year,
    MONTH(expense_date) AS fiscal_month,
    MONTHNAME(expense_date) AS month_name,
    COUNT(expense_id) AS total_bills,
    SUM(amount) AS monthly_spend,
    SUM(SUM(amount)) OVER (
        PARTITION BY YEAR(expense_date) 
        ORDER BY MONTH(expense_date)
    ) AS running_cumulative_annual_total,
    ROUND(AVG(amount), 2) AS average_bill_size
FROM expenses
WHERE user_id = 1
GROUP BY YEAR(expense_date), MONTH(expense_date), MONTHNAME(expense_date)
ORDER BY fiscal_year DESC, fiscal_month ASC;

-- ----------------------------------------------------------
-- 5. COMPLEX JOIN: Bill to Pantry Audit Trail
-- Demonstrates: 4-table join tracing receipt line items into inventory
-- ----------------------------------------------------------
SELECT 
    b.bill_id,
    b.store_name,
    b.bill_date,
    pi.item_name,
    pi.quantity,
    pi.unit,
    pi.unit_price,
    pi.line_total,
    ib.batch_number,
    ib.expiry_date
FROM bills b
JOIN purchases p ON b.bill_id = p.bill_id
JOIN purchase_items pi ON p.purchase_id = pi.purchase_id
LEFT JOIN inventory_batches ib ON pi.batch_id = ib.batch_id
WHERE b.user_id = 1
ORDER BY b.bill_date DESC, pi.purchase_item_id ASC;
