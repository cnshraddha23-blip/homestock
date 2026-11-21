# HOMESTOCK: Comprehensive Test Suite & Academic Verification
**Intelligent Household Grocery, Inventory & Expense Management System**

---

## Verification of Mandatory Workflows (1 through 8)

| Workflow | Description | Test Steps | Expected SQL / System Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Workflow 1** | Register → Login → Dashboard | 1. Send `POST /api/auth/register`<br>2. Send `POST /api/auth/login`<br>3. Inspect JWT token & fetch `GET /api/dashboard/summary` | User record inserted in `users` with hashed password. Default recurring items seeded. Dashboard figures returned from SQL. | **PASSED** |
| **Workflow 2** | Upload bill → OCR → Review → Confirm → Save in SQL | 1. Upload sample receipt image via `POST /api/bills/upload`<br>2. Review side-by-side extracted table<br>3. Edit item prices/quantities<br>4. Submit `POST /api/bills/confirm` | Binary image stored in `bills.bill_image_blob`. OCR text in `bills.raw_ocr_text`. Purchase items in `purchase_items`. | **PASSED** |
| **Workflow 3** | Purchase saved → Inventory updated → Expense updated | 1. Check stock of "Basmati Rice"<br>2. Confirm bill with 2kg Basmati Rice<br>3. Inspect `products`, `inventory_batches`, `expenses` | `products.current_quantity` incremented by 2. New batch created. Expense row created in `expenses`. | **PASSED** |
| **Workflow 4** | Consume grocery → Stock reduced → Restock notification | 1. Send `POST /api/inventory/{id}/consume` with qty 2.0<br>2. Balance falls below `min_stock_level`<br>3. Inspect `notifications` | Audit logged in `stock_movements`. Low stock notification generated in `notifications`. | **PASSED** |
| **Workflow 5** | Expiry entered → Expiry alert generated | 1. Create product with expiry date set to tomorrow<br>2. Query `GET /api/expiry/batches`<br>3. Check dashboard expiry counter | Batch classified with status `EXPIRING_SOON` (orange badge). Dashboard `expiring_in_7_days` incremented. | **PASSED** |
| **Workflow 6** | Monthly list generated → User edits → Saves | 1. Send `POST /api/shopping-lists/generate-monthly`<br>2. Deficit evaluated: `preferred_monthly_qty - current_stock`<br>3. User marks item purchased or changes qty | List generated in `monthly_grocery_lists` and items in `grocery_list_items`. Saved in SQL. | **PASSED** |
| **Workflow 7** | Multiple bills uploaded → Monthly & annual totals calculated | 1. Upload multiple receipts for different months<br>2. Query `GET /api/expenses/monthly` and `GET /api/expenses/annual` | SQL `GROUP BY` and `SUM` aggregate accurate non-duplicated expenditures in ₹. | **PASSED** |
| **Workflow 8** | Logout → Login again → Verify persistent data | 1. Call `POST /api/auth/logout`<br>2. Clear client token<br>3. Login with credentials<br>4. Re-fetch all modules | All bills, stock, expenses, and lists intact from MySQL / relational tables. | **PASSED** |
