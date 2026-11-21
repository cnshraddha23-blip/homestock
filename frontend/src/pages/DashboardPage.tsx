import React, { useEffect, useState } from 'react';
import { 
  Boxes, 
  Wallet, 
  AlertTriangle, 
  ScanLine, 
  PlusCircle, 
  ListPlus, 
  ArrowUpRight, 
  Receipt, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-cream-muted/50 rounded-lg w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-cream-muted/40 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-cream-muted m-6">
        <AlertTriangle className="w-10 h-10 text-orange mx-auto mb-3" />
        <h3 className="text-lg font-bold text-charcoal">Database Connection Error</h3>
        <p className="text-xs text-secondary mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-orange text-white text-xs font-semibold rounded-xl"
        >
          Retry Query
        </button>
      </div>
    );
  }

  const { inventory, expenses, expiry, recent_purchases } = data;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cream-muted">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange">Pantry Intelligence Center</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">
            Hello, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-xs text-secondary mt-1">
            Your real-time inventory levels, upcoming expirations, and grocery expenses.
          </p>
        </div>

        {/* Quick Action Ribbon */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('scan')}
            className="px-4 py-2.5 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold text-xs shadow-soft transition-all flex items-center gap-2"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan Bill</span>
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-4 py-2.5 rounded-xl bg-white border border-cream-muted hover:border-orange/50 text-charcoal font-semibold text-xs shadow-soft transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-orange" />
            <span>Add Grocery</span>
          </button>
          <button
            onClick={() => onNavigate('shopping-lists')}
            className="px-4 py-2.5 rounded-xl bg-white border border-cream-muted hover:border-orange/50 text-charcoal font-semibold text-xs shadow-soft transition-all flex items-center gap-2"
          >
            <ListPlus className="w-4 h-4 text-orange" />
            <span>Monthly Plan</span>
          </button>
          <button
            onClick={() => onNavigate('expenses')}
            className="px-4 py-2.5 rounded-xl bg-charcoal hover:bg-charcoal-dark text-white font-semibold text-xs shadow-soft transition-all flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-orange" />
            <span>Expenses</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          WIDGET A: INVENTORY SUMMARY CARDS
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <Boxes className="w-4 h-4 text-orange" />
            <span>Inventory Health</span>
          </h2>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
          >
            Manage All
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
            <span className="text-[11px] font-semibold text-secondary block mb-1">Total Products</span>
            <p className="text-3xl font-serif font-bold text-charcoal">{inventory.total_products}</p>
            <span className="text-[10px] text-secondary mt-1 block">Active household items</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
            <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Well Stocked</span>
            <p className="text-3xl font-serif font-bold text-emerald-700">{inventory.available_products}</p>
            <span className="text-[10px] text-secondary mt-1 block">Above safe min threshold</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
            <span className="text-[11px] font-semibold text-orange block mb-1">Low Stock Alert</span>
            <p className="text-3xl font-serif font-bold text-orange">{inventory.low_stock_products}</p>
            <span className="text-[10px] text-secondary mt-1 block">Needs restock soon</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
            <span className="text-[11px] font-semibold text-charcoal block mb-1">Out of Stock</span>
            <p className="text-3xl font-serif font-bold text-charcoal">{inventory.out_of_stock_products}</p>
            <span className="text-[10px] text-secondary mt-1 block">Zero inventory in pantry</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          WIDGET B & C: EXPENSES & EXPIRATION DUAL GRID
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* EXPENSE SUMMARY */}
        <div className="p-6 rounded-2xl bg-white border border-cream-muted shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-orange" />
                <h3 className="font-bold text-charcoal text-base">Expense Analytics</h3>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
              >
                Detailed Breakdown
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-cream-light border border-cream-muted">
                <span className="text-xs text-secondary block mb-1">This Month's Spending</span>
                <p className="text-2xl font-serif font-bold text-charcoal">
                  ₹{expenses.current_month_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-secondary">
                  Previous: ₹{expenses.previous_month_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-cream-light border border-cream-muted">
                <span className="text-xs text-secondary block mb-1">Annual Expenditure</span>
                <p className="text-2xl font-serif font-bold text-charcoal">
                  ₹{expenses.annual_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-secondary">
                  Monthly Avg: ₹{expenses.average_monthly_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Monthly Budget Progress Bar */}
            {expenses.current_month_budget ? (
              <div className="p-4 rounded-xl bg-cream/60 border border-cream-muted">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-charcoal">
                    Target Budget: ₹{expenses.current_month_budget.toLocaleString('en-IN')}
                  </span>
                  <span className={expenses.remaining_budget && expenses.remaining_budget >= 0 ? "text-emerald-700 font-bold" : "text-red-600 font-bold"}>
                    {expenses.remaining_budget && expenses.remaining_budget >= 0 
                      ? `₹${expenses.remaining_budget.toLocaleString('en-IN')} remaining` 
                      : `Budget exceeded by ₹${Math.abs(expenses.remaining_budget || 0).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="w-full bg-cream-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (expenses.remaining_budget || 0) < 0 ? 'bg-red-500' : 'bg-orange'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((expenses.current_month_expense / (expenses.current_month_budget || 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-4 border-t border-cream-muted mt-4 flex items-center justify-between text-xs text-secondary">
            <span>Aggregated via SQL View `view_monthly_expense_summary`</span>
            <span className="font-bold text-charcoal">ACID Verified</span>
          </div>
        </div>

        {/* EXPIRY SUMMARY */}
        <div className="p-6 rounded-2xl bg-white border border-cream-muted shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange" />
                <h3 className="font-bold text-charcoal text-base">Expiry Monitoring</h3>
              </div>
              <button
                onClick={() => onNavigate('expiry')}
                className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
              >
                Inspect All Batches
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-4 rounded-xl bg-orange/10 border border-orange/20 text-center">
                <span className="text-[10px] font-bold uppercase text-orange-dark block mb-1">In 7 Days</span>
                <p className="text-3xl font-serif font-bold text-orange">{expiry.expiring_in_7_days}</p>
                <span className="text-[10px] text-secondary">High Priority</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">In 30 Days</span>
                <p className="text-3xl font-serif font-bold text-amber-800">{expiry.expiring_in_30_days}</p>
                <span className="text-[10px] text-secondary">Approaching</span>
              </div>

              <div className="p-4 rounded-xl bg-charcoal/5 border border-charcoal/20 text-center">
                <span className="text-[10px] font-bold uppercase text-charcoal block mb-1">Expired</span>
                <p className="text-3xl font-serif font-bold text-charcoal">{expiry.expired_products}</p>
                <span className="text-[10px] text-secondary">Take Action</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cream-light border border-cream-muted text-xs text-secondary leading-relaxed flex items-center gap-3">
              <Clock className="w-4 h-4 text-orange flex-shrink-0" />
              <span>
                FIFO consumption strategy automatically marks earliest expiring batches first whenever pantry usage is recorded.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-cream-muted mt-4 flex items-center justify-between text-xs text-secondary">
            <span>Visual Badges: Green (Safe), Orange (Warning), Red (Expired)</span>
          </div>
        </div>

      </div>

      {/* ========================================================
          WIDGET D: RECENT PURCHASES (CONFIRMED BILLS)
          ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-cream-muted shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-cream-muted mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange" />
            <h3 className="font-bold text-charcoal text-base">Recent Confirmed Purchases</h3>
          </div>
          <button
            onClick={() => onNavigate('scan')}
            className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
          >
            Upload New Bill
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {recent_purchases.length === 0 ? (
          <div className="py-8 text-center text-xs text-secondary">
            No bills confirmed yet. Upload a grocery receipt to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream-muted text-secondary font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Store Name</th>
                  <th className="py-2.5 px-3">Purchase Date</th>
                  <th className="py-2.5 px-3">Bill Receipt Photo</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-muted/50">
                {recent_purchases.map((p) => (
                  <tr key={p.purchase_id} className="hover:bg-cream-light/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-charcoal">{p.store_name}</td>
                    <td className="py-3 px-3 text-secondary font-mono">{p.purchase_date}</td>
                    <td className="py-3 px-3">
                      {p.has_bill_image ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                          <ImageIcon className="w-3 h-3" />
                          MySQL BLOB Preserved
                        </span>
                      ) : (
                        <span className="text-[10px] text-secondary font-mono">Manual Ingestion</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-charcoal font-serif text-sm">
                      ₹{p.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('expenses')}
                        className="text-xs font-semibold text-orange hover:underline"
                      >
                        View Expense
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
