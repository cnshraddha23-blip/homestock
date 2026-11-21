-- ==========================================================
-- HOMESTOCK SAMPLE DATA (Academic Demonstration Dataset)
-- Character Set: utf8mb4
-- ==========================================================

USE homestock;

-- 1. SEED DEFAULT CATEGORIES
INSERT INTO categories (category_id, name, description, default_shelf_life_days, icon_name) VALUES
(1, 'Vegetables', 'Fresh seasonal veggies and greens', 5, 'Carrot'),
(2, 'Fruits', 'Fresh whole fruits and berries', 7, 'Apple'),
(3, 'Dairy', 'Milk, yogurt, curd, paneer, and butter', 6, 'Milk'),
(4, 'Grains', 'Rice, wheat flour (atta), oats, and semolina', 180, 'Wheat'),
(5, 'Pulses', 'Dals, lentils, chickpeas, and legumes', 180, 'CircleDot'),
(6, 'Snacks', 'Biscuits, namkeen, roasted nuts, and chips', 90, 'Cookie'),
(7, 'Beverages', 'Tea, coffee, fruit juices, and health drinks', 120, 'Coffee'),
(8, 'Spices', 'Whole spices, turmeric, red chilli, garam masala', 240, 'Flame'),
(9, 'Personal Care', 'Soap, toothpaste, shampoo, and sanitizers', 365, 'Sparkles'),
(10, 'Cleaning Products', 'Dishwash gel, detergent, disinfectant floor cleaner', 365, 'ShieldCheck'),
(11, 'Other', 'Miscellaneous pantry essentials', 60, 'Package');

-- 2. SEED DEMO USERS
-- Password for all demo accounts: "Password@123" (bcrypt hashed)
INSERT INTO users (user_id, full_name, email, password_hash, phone, currency) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@example.com', '$2b$12$e80yqZ6j30/2y13m.g0wjeLqV6pGvjRvhwS45pW0kL5pQkKkG4u4C', '+91 9876543210', 'INR'),
(2, 'Priya Patel', 'priya.patel@example.com', '$2b$12$e80yqZ6j30/2y13m.g0wjeLqV6pGvjRvhwS45pW0kL5pQkKkG4u4C', '+91 9876543211', 'INR');

-- 3. SEED PRODUCTS FOR AARAV SHARMA (user_id = 1)
INSERT INTO products (product_id, user_id, category_id, product_name, default_unit, min_stock_level, current_quantity, storage_location, purchase_price) VALUES
(1, 1, 4, 'Basmati Rice', 'kg', 5.00, 2.50, 'Pantry', 120.00),
(2, 1, 4, 'Chakki Fresh Atta', 'kg', 5.00, 8.00, 'Pantry', 55.00),
(3, 1, 3, 'Amul Taza Milk', 'litre', 2.00, 1.00, 'Refrigerator', 64.00),
(4, 1, 3, 'Amul Salted Butter', 'pack', 1.00, 2.00, 'Refrigerator', 56.00),
(5, 1, 3, 'Fresh Malai Paneer', 'g', 400.00, 200.00, 'Refrigerator', 110.00),
(6, 1, 5, 'Toor Dal Premium', 'kg', 2.00, 0.80, 'Pantry', 165.00),
(7, 1, 5, 'Moong Dal Washed', 'kg', 1.50, 2.00, 'Pantry', 140.00),
(8, 1, 1, 'Organic Tomatoes', 'kg', 2.00, 0.50, 'Refrigerator', 35.00),
(9, 1, 1, 'Potatoes (Aloo)', 'kg', 3.00, 4.00, 'Kitchen Shelf', 28.00),
(10, 1, 1, 'Red Onions', 'kg', 3.00, 1.20, 'Kitchen Shelf', 42.00),
(11, 1, 2, 'Kashmiri Apples', 'kg', 1.00, 0.00, 'Refrigerator', 160.00),
(12, 1, 7, 'Tata Tea Gold', 'g', 500.00, 750.00, 'Pantry', 320.00),
(13, 1, 8, 'Turmeric Powder (Haldi)', 'g', 200.00, 450.00, 'Spice Rack', 65.00),
(14, 1, 8, 'Everest Garam Masala', 'pack', 1.00, 1.00, 'Spice Rack', 78.00),
(15, 1, 10, 'Vim Dishwash Gel', 'ml', 500.00, 750.00, 'Kitchen Shelf', 135.00);

-- 4. SEED INVENTORY BATCHES (With Varying Expiries for testing)
INSERT INTO inventory_batches (batch_id, product_id, user_id, batch_number, quantity, initial_quantity, purchase_date, expiry_date, unit_price, status) VALUES
-- Expiring soon (Within 3 days)
(1, 3, 1, 'BATCH-MLK-01', 1.00, 2.00, '2026-11-19', '2026-11-23', 64.00, 'EXPIRING_SOON'),
-- Expiring in 5 days
(2, 5, 1, 'BATCH-PNR-01', 200.00, 400.00, '2026-11-18', '2026-11-25', 110.00, 'EXPIRING_SOON'),
-- Expired 2 days ago (for red badge testing)
(3, 8, 1, 'BATCH-TOM-01', 0.50, 2.00, '2026-11-10', '2026-11-17', 35.00, 'EXPIRED'),
-- Safe batches (months away)
(4, 1, 1, 'BATCH-RCE-99', 2.50, 10.00, '2026-10-15', '2027-04-15', 120.00, 'SAFE'),
(5, 2, 1, 'BATCH-ATT-45', 8.00, 10.00, '2026-11-05', '2027-02-05', 55.00, 'SAFE'),
(6, 6, 1, 'BATCH-TRD-12', 0.80, 2.00, '2026-09-20', '2027-03-20', 165.00, 'SAFE'),
(7, 12, 1, 'BATCH-TEA-08', 750.00, 1000.00, '2026-10-01', '2027-09-01', 320.00, 'SAFE');

-- 5. SEED STOCK MOVEMENTS (Audit Trail)
INSERT INTO stock_movements (movement_id, product_id, batch_id, user_id, movement_type, quantity_changed, balance_after, notes) VALUES
(1, 1, 4, 1, 'PURCHASE', 10.00, 10.00, 'Initial bulk grocery purchase'),
(2, 1, 4, 1, 'CONSUMPTION', -7.50, 2.50, 'Bi-weekly meal prep'),
(3, 3, 1, 1, 'PURCHASE', 2.00, 2.00, 'Morning milk delivery'),
(4, 3, 1, 1, 'CONSUMPTION', -1.00, 1.00, 'Family breakfast usage');

-- 6. SEED RECURRING GROCERY ITEMS
INSERT INTO recurring_grocery_items (recurring_id, user_id, product_id, item_name, category_id, preferred_monthly_quantity, unit, priority) VALUES
(1, 1, 1, 'Basmati Rice', 4, 10.00, 'kg', 'HIGH'),
(2, 1, 2, 'Chakki Fresh Atta', 4, 10.00, 'kg', 'HIGH'),
(3, 1, 3, 'Amul Taza Milk', 3, 15.00, 'litre', 'HIGH'),
(4, 1, 6, 'Toor Dal Premium', 5, 2.00, 'kg', 'MEDIUM'),
(5, 1, 10, 'Red Onions', 1, 5.00, 'kg', 'MEDIUM'),
(6, 1, 11, 'Kashmiri Apples', 2, 3.00, 'kg', 'LOW');

-- 7. SEED HISTORICAL EXPENSES (For Full Monthly & Annual Trend Analysis)
INSERT INTO expenses (expense_id, user_id, category_id, amount, expense_date, description, payment_mode) VALUES
(1, 1, 4, 1850.00, '2026-01-12', 'Nature Basket Superstore - Grains & Flour', 'UPI'),
(2, 1, 3, 980.00, '2026-01-20', 'Local Dairy Shop - Milk, Ghee, Butter', 'Cash'),
(3, 1, 1, 620.00, '2026-02-08', 'Fresh Greens Mart - Vegetables', 'UPI'),
(4, 1, 4, 2100.00, '2026-02-15', 'DMart Wholesale - Monthly Pulses & Rice', 'Card'),
(5, 1, 7, 750.00, '2026-03-05', 'Tea and Coffee Restock', 'UPI'),
(6, 1, 10, 890.00, '2026-03-18', 'Cleaning & Kitchen Hygiene Essentials', 'Card'),
(7, 1, 4, 1950.00, '2026-04-10', 'BigBasket Grocery Delivery', 'UPI'),
(8, 1, 2, 1120.00, '2026-05-14', 'Seasonal Mangoes & Fruit Basket', 'UPI'),
(9, 1, 6, 840.00, '2026-06-02', 'Healthy Roasted Snacks & Nuts', 'Card'),
(10, 1, 4, 2300.00, '2026-07-09', 'Supermarket Bulk Purchase', 'UPI'),
(11, 1, 5, 1450.00, '2026-08-15', 'Organic Pulses & Lentils', 'UPI'),
(12, 1, 8, 920.00, '2026-09-11', 'Spices & Condiments Refill', 'Card'),
(13, 1, 3, 1340.00, '2026-10-06', 'Festival Sweets & Dairy Goods', 'UPI'),
(14, 1, 4, 2450.00, '2026-11-04', 'DMart Supercenter - November Monthly Stock', 'Card'),
(15, 1, 1, 540.00, '2026-11-15', 'Weekly Fresh Market Vegetables', 'UPI');

-- 8. SEED MONTHLY BUDGETS
INSERT INTO monthly_budgets (budget_id, user_id, month, year, budget_amount, notes) VALUES
(1, 1, 11, 2026, 6500.00, 'Standard festive season monthly allocation'),
(2, 1, 10, 2026, 6000.00, 'October budget'),
(3, 1, 9, 2026, 5500.00, 'September budget');

-- 9. SEED NOTIFICATIONS
INSERT INTO notifications (notification_id, user_id, type, title, message, reference_id, is_read) VALUES
(1, 1, 'LOW_STOCK', 'Low Stock Alert: Basmati Rice', 'Basmati Rice is down to 2.50 kg (Min threshold: 5.00 kg). Consider adding it to your monthly list.', 1, FALSE),
(2, 1, 'EXPIRY_ALERT', 'Expiring Soon: Amul Taza Milk', 'Batch BATCH-MLK-01 is expiring in 2 days (23 Nov 2026). Consume soon to prevent waste.', 1, FALSE),
(3, 1, 'EXPIRY_ALERT', 'Expired Item: Organic Tomatoes', 'Batch BATCH-TOM-01 expired on 17 Nov 2026. Please inspect and discard if spoiled.', 3, FALSE),
(4, 1, 'LOW_STOCK', 'Out of Stock: Kashmiri Apples', 'Kashmiri Apples is at 0.00 kg. Time to restock!', 11, TRUE);
