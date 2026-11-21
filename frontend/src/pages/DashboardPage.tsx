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
  Image as ImageIcon,
  MapPin,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  ShoppingBag
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
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-10 bg-cream-muted/50 rounded-xl w-72 animate-pulse"></div>
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
      <div className="p-8 text-center bg-white rounded-2xl border border-cream-muted m-6 max-w-lg mx-auto shadow-card">
        <AlertTriangle className="w-12 h-12 text-orange mx-auto mb-3" />
        <h3 className="text-lg font-bold text-charcoal">Database Connection Error</h3>
        <p className="text-xs text-secondary mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-5 py-2.5 bg-orange text-white text-xs font-semibold rounded-xl shadow-soft"
        >
          Retry SQL Query
        </button>
      </div>
    );
  }

  const { inventory, expenses, expiry, recent_purchases } = data;

  // Calculate Freshness Index
  const totalBatches = expiry.expiring_in_7_days + expiry.expiring_in_30_days + expiry.expired_products;
  const safeCount = Math.max(0, inventory.total_products - expiry.expired_products);
  const freshnessIndex = inventory.total_products > 0 
    ? Math.round(((inventory.total_products - expiry.expired_products - (expiry.expiring_in_7_days * 0.5)) / inventory.total_products) * 100)
    : 100;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-cream-muted">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-muted text-charcoal text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange" />
            <span>Pantry Command Center • Live MySQL Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-xs text-secondary mt-1">
            Real-time household inventory levels, upcoming batch expirations, and monthly grocery expenses.
          </p>
        </div>

        {/* Quick Action Ribbon */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('scan')}
            className="px-4 py-2.5 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold text-xs shadow-soft hover:shadow-card transition-all flex items-center gap-2 group"
          >
            <ScanLine className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Scan Bill</span>
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-4 py-2.5 rounded-xl bg-white border border-cream-muted hover:border-orange/60 text-charcoal font-semibold text-xs shadow-soft transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-orange" />
            <span>Add Grocery</span>
          </button>
          <button
            onClick={() => onNavigate('shopping-lists')}
            className="px-4 py-2.5 rounded-xl bg-white border border-cream-muted hover:border-orange/60 text-charcoal font-semibold text-xs shadow-soft transition-all flex items-center gap-2"
          >
            <ListPlus className="w-4 h-4 text-orange" />
            <span>Monthly Plan</span>
          </button>
          <button
            onClick={() => onNavigate('expenses')}
            className="px-4 py-2.5 rounded-xl bg-charcoal hover:bg-charcoal-dark text-white font-semibold text-xs shadow-soft transition-all flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-orange" />
            <span>Expense Ledger</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          WIDGET A: INVENTORY METRIC TILES
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <Boxes className="w-4 h-4 text-orange" />
            <span>Pantry Inventory Health</span>
          </h2>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
          >
            Explore Catalog
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-secondary">Total Products</span>
              <span className="w-2 h-2 rounded-full bg-orange"></span>
            </div>
            <p className="text-3xl font-serif font-bold text-charcoal">{inventory.total_products}</p>
            <span className="text-[10px] text-secondary mt-1 block">Active household items</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-emerald-700">Well Stocked</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-3xl font-serif font-bold text-emerald-700">{inventory.available_products}</p>
            <span className="text-[10px] text-secondary mt-1 block">Above safe min threshold</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-orange">Low Stock Alert</span>
              <AlertTriangle className="w-3.5 h-3.5 text-orange" />
            </div>
            <p className="text-3xl font-serif font-bold text-orange">{inventory.low_stock_products}</p>
            <span className="text-[10px] text-secondary mt-1 block">Auto-added to shopping list</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-charcoal">Out of Stock</span>
              <span className="w-2 h-2 rounded-full bg-charcoal"></span>
            </div>
            <p className="text-3xl font-serif font-bold text-charcoal">{inventory.out_of_stock_products}</p>
            <span className="text-[10px] text-secondary mt-1 block">Zero stock available</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          PANTRY FRESHNESS & EXPENSE DUAL WIDGET
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* EXPENSE SUMMARY (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-cream-muted shadow-card flex flex-col justify-between">
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
                Detailed Ledger
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-cream-light border border-cream-muted">
                <span className="text-xs text-secondary block mb-1">Current Month's Spend</span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
                  ₹{expenses.current_month_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-secondary mt-1 block">
                  Previous Month: ₹{expenses.previous_month_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-cream-light border border-cream-muted">
                <span className="text-xs text-secondary block mb-1">Cumulative Annual Total</span>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
                  ₹{expenses.annual_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-secondary mt-1 block">
                  Monthly Avg: ₹{expenses.average_monthly_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Target Budget Progress Bar */}
            {expenses.current_month_budget ? (
              <div className="p-4 rounded-xl bg-cream/60 border border-cream-muted space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-charcoal">
                    Monthly Budget: ₹{expenses.current_month_budget.toLocaleString('en-IN')}
                  </span>
                  <span className={expenses.remaining_budget && expenses.remaining_budget >= 0 ? "text-emerald-700 font-bold" : "text-red-600 font-bold"}>
                    {expenses.remaining_budget && expenses.remaining_budget >= 0 
                      ? `₹${expenses.remaining_budget.toLocaleString('en-IN')} headroom left` 
                      : `Exceeded by ₹${Math.abs(expenses.remaining_budget || 0).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="w-full bg-cream-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
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
            <span>Non-duplicated calculations from SQL `expenses`</span>
            <span className="font-bold text-charcoal font-mono">ACID Guaranteed</span>
          </div>
        </div>

        {/* PANTRY FRESHNESS INDEX (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-cream-muted shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cream-muted mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-charcoal text-base">Freshness Index</h3>
              </div>
              <button
                onClick={() => onNavigate('expiry')}
                className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
              >
                Inspect Batches
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular Gauge Graphic */}
            <div className="p-4 rounded-xl bg-cream-light border border-cream-muted flex items-center gap-5">
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-cream-muted"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={freshnessIndex > 80 ? "text-emerald-500" : freshnessIndex > 50 ? "text-orange" : "text-red-500"}
                    strokeDasharray={`${freshnessIndex}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-serif font-bold text-lg text-charcoal">{freshnessIndex}%</span>
              </div>
              <div>
                <p className="font-bold text-charcoal text-sm">
                  {freshnessIndex >= 85 ? "Pantry in Peak Freshness" : freshnessIndex >= 60 ? "Expiring Items Need Attention" : "Immediate Discard Required"}
                </p>
                <p className="text-[11px] text-secondary mt-0.5 leading-relaxed">
                  Based on active batch shelf lives and FIFO consumption cycles.
                </p>
              </div>
            </div>

            {/* Expiry Pill Counters */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-3 bg-orange/10 rounded-xl border border-orange/20">
                <span className="text-[10px] font-bold uppercase text-orange-dark block">In 7 Days</span>
                <span className="text-xl font-bold font-serif text-orange">{expiry.expiring_in_7_days}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-800 block">In 30 Days</span>
                <span className="text-xl font-bold font-serif text-amber-800">{expiry.expiring_in_30_days}</span>
              </div>
              <div className="p-3 bg-charcoal/5 rounded-xl border border-charcoal/20">
                <span className="text-[10px] font-bold uppercase text-charcoal block">Expired</span>
                <span className="text-xl font-bold font-serif text-charcoal">{expiry.expired_products}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-secondary mt-3">
            Status: Green (Safe), Orange (&le;7 days), Red (Expired).
          </p>
        </div>

      </div>

      {/* ========================================================
          WIDGET D: RECENT CONFIRMED PURCHASES WITH BLOB PREVIEWS
          ======================================================== */}
      <div className="p-6 rounded-2xl bg-white border border-cream-muted shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-cream-muted mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange" />
            <h3 className="font-bold text-charcoal text-base">Recent Supermarket Ingestions</h3>
          </div>
          <button
            onClick={() => onNavigate('scan')}
            className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
          >
            Upload Bill Photo
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
                <tr className="border-b border-cream-muted text-secondary font-bold uppercase text-[10px] bg-cream-light/40">
                  <th className="py-3 px-3">Store Name</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Image BLOB Status</th>
                  <th className="py-3 px-3 text-right">Bill Total (₹)</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-muted/50">
                {recent_purchases.map((p) => (
                  <tr key={p.purchase_id} className="hover:bg-cream-light/50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-charcoal">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-orange" />
                        <span>{p.store_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-secondary font-mono">{p.purchase_date}</td>
                    <td className="py-3.5 px-3">
                      {p.has_bill_image ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <ImageIcon className="w-3 h-3" />
                          MySQL BLOB Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-secondary font-mono">Simulated Ingestion</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-charcoal font-serif text-sm">
                      ₹{p.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => onNavigate('expenses')}
                        className="text-xs font-semibold text-orange hover:underline"
                      >
                        Ledger Info
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
