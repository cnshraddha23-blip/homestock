export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  currency: string;
  created_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  description?: string;
  default_shelf_life_days: number;
  icon_name: string;
}

export interface InventoryBatch {
  batch_id: number;
  product_id: number;
  batch_number: string;
  quantity: number;
  initial_quantity: number;
  purchase_date: string;
  expiry_date: string;
  unit_price: number;
  status: 'SAFE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CONSUMED' | 'DISCARDED';
  days_left?: number;
}

export interface Product {
  product_id: number;
  user_id: number;
  category_id: number;
  category_name?: string;
  product_name: string;
  default_unit: string;
  min_stock_level: number;
  current_quantity: number;
  storage_location: string;
  purchase_price: number;
  image_url?: string;
  stock_status?: 'SAFE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  earliest_expiry?: string;
  batches?: InventoryBatch[];
}

export interface StockMovement {
  movement_id: number;
  product_id: number;
  product_name?: string;
  movement_type: 'PURCHASE' | 'CONSUMPTION' | 'DISCARD' | 'ADJUSTMENT';
  quantity_changed: number;
  balance_after: number;
  notes?: string;
  created_at: string;
}

export interface ExtractedItem {
  item_name: string;
  category_id: number;
  category_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  confidence?: number;
  expiry_date?: string;
  storage_location?: string;
}

export interface OCRScanResponse {
  scan_data: {
    store_name: string;
    store_address?: string;
    bill_number?: string;
    purchase_date: string;
    subtotal: number;
    tax: number;
    discount: number;
    total_amount: number;
    raw_ocr_text: string;
    items: ExtractedItem[];
    confidence_score: number;
  };
  image_preview: string;
  mime_type: string;
  file_name: string;
}

export interface GroceryListItem {
  list_item_id: number;
  list_id: number;
  product_id?: number;
  item_name: string;
  category_id?: number;
  category_name?: string;
  target_quantity: number;
  unit: string;
  estimated_price: number;
  is_purchased: boolean;
  is_skipped: boolean;
  notes?: string;
}

export interface MonthlyGroceryList {
  list_id: number;
  user_id: number;
  month: number;
  year: number;
  list_name: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  total_estimated_cost: number;
  items: GroceryListItem[];
  created_at: string;
}

export interface RecurringItem {
  recurring_id: number;
  user_id: number;
  item_name: string;
  category_id?: number;
  category_name?: string;
  preferred_monthly_quantity: number;
  unit: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  is_active: boolean;
}

export interface ExpenseItem {
  expense_id: number;
  category_id?: number;
  category_name?: string;
  amount: number;
  expense_date: string;
  description: string;
  payment_mode: string;
}

export interface MonthlyExpenseReport {
  month: number;
  year: number;
  month_label: string;
  total_monthly_expense: number;
  number_of_purchases: number;
  average_bill_amount: number;
  most_expensive_category: string;
  monthly_budget: number;
  remaining_budget: number;
  budget_utilization_percentage: number;
  category_breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactions: number;
  }>;
  weekly_trend: Array<{
    week: string;
    amount: number;
  }>;
}

export interface AnnualExpenseReport {
  year: number;
  total_annual_expense: number;
  highest_spending_month: string;
  lowest_spending_month: string;
  average_monthly_expense: number;
  active_months_recorded: number;
  monthly_trend: Array<{
    month: string;
    month_number: number;
    amount: number;
    transactions: number;
  }>;
  category_annual_breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactions: number;
  }>;
  available_years: number[];
}

export interface DashboardSummary {
  inventory: {
    total_products: number;
    available_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
  };
  expenses: {
    current_month_expense: number;
    previous_month_expense: number;
    annual_expense: number;
    average_monthly_expense: number;
    current_month_budget?: number;
    remaining_budget?: number;
  };
  expiry: {
    expiring_in_7_days: number;
    expiring_in_30_days: number;
    expired_products: number;
  };
  recent_purchases: Array<{
    purchase_id: number;
    store_name: string;
    purchase_date: string;
    total_amount: number;
    has_bill_image: boolean;
  }>;
  unread_notifications_count: number;
}

export interface NotificationItem {
  notification_id: number;
  type: 'EXPIRY_ALERT' | 'LOW_STOCK' | 'BUDGET_EXCEEDED' | 'BILL_SCANNED' | 'GENERAL';
  title: string;
  message: string;
  reference_id?: number;
  is_read: boolean;
  created_at: string;
}
