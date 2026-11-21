# HomeStock
## Intelligent Household Grocery, Inventory & Expense Management System
*A Full-Stack DBMS Academic Capstone Project*

---

## 1. Project Overview

**HomeStock** is a comprehensive, production-grade web application designed to eliminate household food waste, automate grocery bookkeeping, and provide rigorous financial transparency.

### Core Capabilities:
1. **Smart Bill Scanner & OCR Ingestion**: Upload physical supermarket receipt photos (JPG, PNG, PDF). OpenCV enhances image quality, Tesseract extracts readable text, and a heuristic parser populates line items into an interactive side-by-side verification modal before executing an atomic SQL commit.
2. **Pantry Inventory & Batch Expiry Tracking**: Multi-batch inventory tracking for identical products with distinct expiry dates. FIFO (First In First Out) consumption deductions prevent premature expiration. Visual indicators: Green (Safe), Orange (Expiring within 7 days), and Red (Expired).
3. **Personalized Monthly Grocery Planner**: Dynamically generates your next grocery market list by subtracting current pantry stock from recurring household staples, automatically incorporating low-stock and out-of-stock items.
4. **Expense Analytics in Indian Rupees (₹)**: Real-time monthly spend breakdown, category allocation charts, budget vs actual gauges, and cumulative rolling 12-month annual expenditure.
5. **100% Relational SQL Backend**: All user accounts, bills, binary receipt BLOBs, inventory batches, stock audit movements, and expenses are persistently housed in normalized SQL tables.

---

## 2. Technology Stack

### Frontend:
- **Framework**: React.js 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Animation & Motion**: Framer Motion + Three.js (Interactive 3D particle canvas)
- **Data Visualization**: Recharts (Bar Charts, Donut Pie Charts)
- **Icons**: Lucide React

### Backend:
- **Framework**: Python 3.13 + FastAPI
- **ORM & DB Layer**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Authentication**: JWT Bearer Tokens + Native Bcrypt
- **OCR Engine**: Tesseract OCR + Pillow Image Preprocessing

### Database:
- **DBMS**: MySQL 8.0+ (MySQL Workbench compatible) with automatic resilient development fallback
- **Storage**: Binary `LONGBLOB` for receipt photos, 3NF normalized tables, indexes, views, and stored procedures.

---

## 3. Brand Identity & UI/UX Palette

| Color Role | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Cream** | `#F7F1E7` | Dominant warm background |
| **Light Cream** | `#FFF9F1` | Elevated card surfaces and inputs |
| **Orange** | `#E9853B` | Primary action buttons and highlights |
| **Dark Orange** | `#CA6429` | Urgent alerts, hover states |
| **Charcoal** | `#252522` | Primary typography, sidebar, and contrast |
| **Dark Charcoal** | `#353530` | Footer and deep contrast |
| **Muted Beige** | `#E9DFD1` | Subtle divider strokes and borders |
| **Secondary Text**| `#81796F` | Metadata and secondary descriptions |

---

## 4. Normalized Database Schema (14 Tables)

All schema definitions reside in `backend/schema.sql`:

1. `users`: User profiles, hashed credentials, currency.
2. `categories`: 11 standardized grocery classifications.
3. `products`: Master catalog with current stock levels and storage locations.
4. `inventory_batches`: Individual batches tracking exact expiration dates.
5. `stock_movements`: Immutable audit log of all inventory shifts (Purchase, Consumption, Discard, Adjustment).
6. `bills`: Stored supermarket bills with raw OCR text and `LONGBLOB` receipt photos.
7. `purchases`: Verified supermarket transactions linked to bills.
8. `purchase_items`: Detailed line items (quantity, unit rate, total).
9. `monthly_grocery_lists`: Planning records generated per calendar month.
10. `grocery_list_items`: Specific checklist products to buy or skip.
11. `recurring_grocery_items`: User-fed template of monthly essentials.
12. `expenses`: Financial ledger tracking monthly category expenditures.
13. `monthly_budgets`: User-defined financial caps per month/year.
14. `notifications`: System-triggered alerts for expiry and low stock.

---

## 5. Quick Start Instructions

### Prerequisites:
- Python 3.10+ (with pip)
- Node.js 18+ (with npm)
- (Optional) MySQL Server 8.0+

### Option A: One-Click Startup (Windows)
Double-click:
```bat
start_all.bat
```
This automatically boots:
- FastAPI Backend on `http://127.0.0.1:8000`
- React Vite Frontend on `http://localhost:5173`

---

### Option B: Manual Startup

#### 1. Backend:
```powershell
cd homestock/backend
# Activate virtual environment
.\venv\Scripts\activate
# Start FastAPI
$env:PYTHONPATH="."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API Docs will be live at: `http://127.0.0.1:8000/docs`

#### 2. Frontend:
```powershell
cd homestock/frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 6. Pre-seeded Demo Credentials (for Evaluators)

- **Email**: `aarav.sharma@example.com`
- **Password**: `Password@123`
*(A convenient one-click "Autofill Demo Account" button is also provided directly on the Login page).*

---

## 7. Academic Documentation Files

- [ER Diagram & Normalization](file:///C:/Users/cnshr/OneDrive/Desktop/Voice%20Assistant/homestock/backend/academic_docs/ER_DIAGRAM.md)
- [Data Flow (DFD Level 0 & 1) and Use Cases](file:///C:/Users/cnshr/OneDrive/Desktop/Voice%20Assistant/homestock/backend/academic_docs/DFD_AND_USE_CASES.md)
- [Academic SQL Queries](file:///C:/Users/cnshr/OneDrive/Desktop/Voice%20Assistant/homestock/backend/academic_docs/ACADEMIC_SQL_QUERIES.md)
- [Test Suite & Workflow Verification](file:///C:/Users/cnshr/OneDrive/Desktop/Voice%20Assistant/homestock/backend/academic_docs/TESTING_DOCUMENTATION.md)
- [MySQL Schema DDL](file:///C:/Users/cnshr/OneDrive/Desktop/Voice%20Assistant/homestock/backend/schema.sql)
- [MySQL Sample Dataset](file:///C:/Users/cnshr/OneDrive/Desktop/Voice%20Assistant/homestock/backend/sample_data.sql)
