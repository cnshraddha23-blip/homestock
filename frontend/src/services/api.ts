const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('homestock_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('homestock_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('homestock_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Dashboard
  getDashboardSummary: () => request<any>('/dashboard/summary'),

  // Bills & OCR
  uploadBill: (formData: FormData) => request<any>('/bills/upload', { method: 'POST', body: formData }),
  confirmBill: (data: any) => request<any>('/bills/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getBills: () => request<any[]>('/bills'),
  getBillDetail: (id: number) => request<any>(`/bills/${id}`),

  // Inventory
  getCategories: () => request<any[]>('/inventory/categories'),
  getInventory: (params?: { category_id?: number; search?: string; stock_status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category_id) qs.set('category_id', params.category_id.toString());
    if (params?.search) qs.set('search', params.search);
    if (params?.stock_status) qs.set('stock_status', params.stock_status);
    return request<any[]>(`/inventory?${qs.toString()}`);
  },
  createProduct: (data: any) => request<any>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => request<any>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => request<any>(`/inventory/${id}`, { method: 'DELETE' }),
  consumeProduct: (id: number, data: any) => request<any>(`/inventory/${id}/consume`, { method: 'POST', body: JSON.stringify(data) }),
  getProductHistory: (id: number) => request<any[]>(`/inventory/${id}/history`),

  // Expiry
  getExpirySummary: () => request<any>('/expiry/summary'),
  getExpiryBatches: (filter_by: string = 'ALL') => request<any[]>(`/expiry/batches?filter_by=${filter_by}`),
  handleExpiryAction: (batchId: number, data: any) => request<any>(`/expiry/${batchId}/action`, { method: 'POST', body: JSON.stringify(data) }),

  // Shopping Lists
  getShoppingLists: () => request<any[]>('/shopping-lists'),
  getShoppingListDetail: (id: number) => request<any>(`/shopping-lists/${id}`),
  generateMonthlyList: (data: any) => request<any>('/shopping-lists/generate-monthly', { method: 'POST', body: JSON.stringify(data) }),
  addListItem: (listId: number, data: any) => request<any>(`/shopping-lists/${listId}/items`, { method: 'POST', body: JSON.stringify(data) }),
  updateListItem: (itemId: number, data: any) => request<any>(`/shopping-lists/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteListItem: (itemId: number) => request<any>(`/shopping-lists/items/${itemId}`, { method: 'DELETE' }),

  // Recurring Essentials
  getRecurringItems: () => request<any[]>('/shopping-lists/recurring'),
  addRecurringItem: (data: any) => request<any>('/shopping-lists/recurring', { method: 'POST', body: JSON.stringify(data) }),
  deleteRecurringItem: (id: number) => request<any>(`/shopping-lists/recurring/${id}`, { method: 'DELETE' }),

  // Expenses & Budgets
  getMonthlyExpenses: (month?: number, year?: number) => {
    const qs = new URLSearchParams();
    if (month) qs.set('month', month.toString());
    if (year) qs.set('year', year.toString());
    return request<any>(`/expenses/monthly?${qs.toString()}`);
  },
  getAnnualExpenses: (year?: number) => {
    const qs = new URLSearchParams();
    if (year) qs.set('year', year.toString());
    return request<any>(`/expenses/annual?${qs.toString()}`);
  },
  addManualExpense: (data: any) => request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  getBudgets: (year?: number) => request<any[]>(`/budgets${year ? `?year=${year}` : ''}`),
  setBudget: (data: any) => request<any>('/budgets', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'PUT' }),
};
