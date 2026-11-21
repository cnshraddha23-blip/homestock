# HOMESTOCK: Data Flow & Use Case Architecture
**Intelligent Household Grocery, Inventory & Expense Management System**
*DBMS Academic Project Documentation*

---

## 1. Level 0 Data Flow Diagram (Context Diagram)

```mermaid
flowchart TD
    User([Household User / Shopper])
    System[HomeStock System]
    MySQL[(MySQL 8+ Database)]
    OCR[OpenCV & Tesseract Engine]

    User -->|1. Upload Grocery Bill Photo| System
    System -->|2. Preprocess & Extract Text| OCR
    OCR -->|3. Structured OCR Line Items| System
    System -->|4. Side-by-Side Review & Edit| User
    User -->|5. Confirm Verified Bill| System
    System -->|6. Atomic SQL Commit: Bill, Purchase, Inventory, Batch, Expense| MySQL

    MySQL -->|7. Query Stock, Expiry, Annual Costs| System
    System -->|8. Real-time Dashboard & Restock Alerts| User
```

---

## 2. Level 1 Data Flow Diagram (Subsystem Decompositions)

```mermaid
flowchart LR
    subgraph Bill_Processing [1.0 Bill Ingestion & OCR]
        P1[Upload Image / PDF] --> P2[OpenCV Preprocessing]
        P2 --> P3[Tesseract OCR Extraction]
        P3 --> P4[Pattern Parser & Catalog Mapping]
        P4 --> P5[Verification Modal]
    end

    subgraph Inventory_Control [2.0 Inventory & Expiry Control]
        I1[Batch Stocking] --> I2[FIFO Consumption Engine]
        I2 --> I3[Restock Threshold Check]
        I3 --> I4[Notification Generation]
    end

    subgraph Financial_Analytics [3.0 Expense & Annual Analytics]
        E1[Purchase Ledger] --> E2[Monthly Category Grouping]
        E2 --> E3[Annual Rollup Aggregation]
        E3 --> E4[Budget vs Actual Comparison]
    end

    P5 -->|Atomic Commit| Inventory_Control
    P5 -->|Financial Record| Financial_Analytics
```

---

## 3. Academic Use Case Descriptions

### Use Case UC-1: Smart Grocery Bill Digitization & Storage
- **Actor**: Household User
- **Precondition**: User is authenticated with JWT token.
- **Trigger**: User drops a receipt image (JPG/PNG/PDF) into the scanner dropzone.
- **Main Flow**:
  1. FastAPI validates MIME type and file size (< 10MB).
  2. Image is converted to grayscale, contrast-boosted via Pillow/OpenCV.
  3. Tesseract OCR reads the image and returns raw bill text.
  4. Parser extracts Store Name, Date, Items, Quantities, Unit Prices, Taxes, and Grand Total.
  5. Extracted data is presented in a split-screen view: original image on the left, editable data grid on the right.
  6. User inspects, edits any OCR discrepancies, and clicks "Confirm & Save".
  7. Backend initiates an ACID transaction:
     - Stores original image as binary BLOB in `bills`.
     - Inserts record into `purchases`.
     - Creates batch in `inventory_batches`.
     - Updates existing stock or inserts new product in `products`.
     - Logs audit line in `stock_movements`.
     - Creates expense entry in `expenses`.
- **Postcondition**: Stock levels are automatically incremented and expense charts reflect the new bill.

### Use Case UC-2: Intelligent Monthly List Generation
- **Actor**: Household User
- **Precondition**: User has defined recurring essentials (e.g. Milk 15L, Rice 10kg).
- **Trigger**: User requests new monthly shopping plan.
- **Main Flow**:
  1. System executes SQL query joining `recurring_grocery_items` with current `products.current_quantity`.
  2. For each recurring item, calculates `quantity_to_buy = max(1.0, preferred_qty - current_stock)`.
  3. Scans `products` for any items where `current_quantity <= min_stock_level` not present in recurring list.
  4. Generates an editable checklist with estimated costs.
- **Postcondition**: User has a customized shopping list ready for the market.
