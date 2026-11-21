import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart as PieIcon, 
  BarChart2, 
  IndianRupee,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { MonthlyExpenseReport, AnnualExpenseReport } from '../types';

interface ExpensesPageProps {
  onNavigate: (page: string) => void;
}

const PALETTE = ['#E9853B', '#CA6429', '#252522', '#81796F', '#D89758', '#4A7C59', '#36558F', '#9B5DE5'];

export const ExpensesPage: React.FC<ExpensesPageProps> = () => {
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // November
  const [monthlyData, setMonthlyData] = useState<MonthlyExpenseReport | null>(null);
  const [annualData, setAnnualData] = useState<AnnualExpenseReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Budget update modal
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudgetAmt, setNewBudgetAmt] = useState<number>(6500);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        api.getMonthlyExpenses(selectedMonth, selectedYear),
        api.getAnnualExpenses(selectedYear)
      ]);
      setMonthlyData(mRes);
      setAnnualData(aRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.setBudget({
        month: selectedMonth,
        year: selectedYear,
        budget_amount: newBudgetAmt
      });
      setShowBudgetModal(false);
      fetchExpenses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-muted">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange">Financial Ledger & Aggregations</span>
          <h1 className="font-serif text-3xl font-bold text-charcoal mt-1">Household Expense Analytics</h1>
          <p className="text-xs text-secondary mt-1">
            Real-time monthly breakdowns and cumulative annual cost roll-ups computed directly in SQL.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-cream-muted shadow-soft self-start sm:self-auto">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'monthly' ? 'bg-orange text-white shadow-sm' : 'text-secondary hover:text-charcoal'
            }`}
          >
            Monthly Report
          </button>
          <button
            onClick={() => setViewMode('annual')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'annual' ? 'bg-orange text-white shadow-sm' : 'text-secondary hover:text-charcoal'
            }`}
          >
            Annual Report
          </button>
        </div>
      </div>

      {/* Date Selectors Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-cream-muted shadow-soft text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-charcoal">Filter Period:</span>
          {viewMode === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-cream-muted text-charcoal font-semibold bg-cream-light outline-none"
            >
              {[
                { m: 1, name: 'January' }, { m: 2, name: 'February' }, { m: 3, name: 'March' },
                { m: 4, name: 'April' }, { m: 5, name: 'May' }, { m: 6, name: 'June' },
                { m: 7, name: 'July' }, { m: 8, name: 'August' }, { m: 9, name: 'September' },
                { m: 10, name: 'October' }, { m: 11, name: 'November' }, { m: 12, name: 'December' }
              ].map(item => (
                <option key={item.m} value={item.m}>{item.name}</option>
              ))}
            </select>
          )}

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-cream-muted text-charcoal font-semibold bg-cream-light outline-none"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {viewMode === 'monthly' && monthlyData && (
          <button
            onClick={() => {
              setNewBudgetAmt(monthlyData.monthly_budget);
              setShowBudgetModal(true);
            }}
            className="text-xs font-bold text-orange hover:underline flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Set Target Budget (₹{monthlyData.monthly_budget.toLocaleString('en-IN')})</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-secondary animate-pulse">
          Calculating financial aggregations from SQL ledger...
        </div>
      ) : viewMode === 'monthly' && monthlyData ? (
        /* ========================================================
            MONTHLY REPORT VIEW
            ======================================================== */
        <div className="space-y-6">
          
          {/* Monthly KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
              <span className="text-[11px] font-semibold text-secondary block mb-1">Total Monthly Expense</span>
              <p className="text-3xl font-serif font-bold text-charcoal">
                ₹{monthlyData.total_monthly_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-secondary mt-1 block font-mono">{monthlyData.number_of_purchases} purchases recorded</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
              <span className="text-[11px] font-semibold text-secondary block mb-1">Average Bill Size</span>
              <p className="text-3xl font-serif font-bold text-charcoal">
                ₹{monthlyData.average_bill_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-secondary mt-1 block">Per supermarket run</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
              <span className="text-[11px] font-semibold text-secondary block mb-1">Most Expensive Category</span>
              <p className="text-xl font-bold text-orange truncate mt-1">
                {monthlyData.most_expensive_category}
              </p>
              <span className="text-[10px] text-secondary mt-1 block">Top household drain</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
              <span className="text-[11px] font-semibold text-secondary block mb-1">Budget Balance</span>
              <p className={`text-2xl font-serif font-bold ${
                monthlyData.remaining_budget >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}>
                ₹{Math.abs(monthlyData.remaining_budget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-secondary mt-1 block">
                {monthlyData.remaining_budget >= 0 ? 'Remaining headroom' : 'Over budget!'}
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Breakdown (Pie Chart) */}
            <div className="p-6 rounded-2xl bg-white border border-cream-muted shadow-card">
              <h3 className="font-bold text-charcoal text-base mb-1">Category-wise Expenditure</h3>
              <p className="text-xs text-secondary mb-6">Percentage share of each grocery category</p>

              {monthlyData.category_breakdown.length === 0 ? (
                <div className="py-16 text-center text-xs text-secondary">No expenses recorded for this month.</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthlyData.category_breakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={3}
                      >
                        {monthlyData.category_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Spend']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-cream-muted text-xs">
                {monthlyData.category_breakdown.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-light border border-cream-muted text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                    <span className="font-semibold text-charcoal">{c.category}:</span>
                    <span className="font-bold text-orange">₹{c.amount.toFixed(0)} ({c.percentage}%)</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Weekly Spending Trend (Bar Chart) */}
            <div className="p-6 rounded-2xl bg-white border border-cream-muted shadow-card">
              <h3 className="font-bold text-charcoal text-base mb-1">Weekly Purchase Distribution</h3>
              <p className="text-xs text-secondary mb-6">Spend progression across weeks of {monthlyData.month_label}</p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData.weekly_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9DFD1" vertical={false} />
                    <XAxis dataKey="week" stroke="#81796F" fontSize={11} />
                    <YAxis stroke="#81796F" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Expense']} />
                    <Bar dataKey="amount" fill="#E9853B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      ) : annualData ? (
        /* ========================================================
            ANNUAL REPORT VIEW
            ======================================================== */
        <div className="space-y-6">
          
          {/* Annual KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
              <span className="text-[11px] font-semibold text-secondary block mb-1">Total Annual Expenditure</span>
              <p className="text-3xl font-serif font-bold text-charcoal">
                ₹{annualData.total_annual_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-secondary mt-1 block">Full Fiscal Year {annualData.year}</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
              <span className="text-[11px] font-semibold text-secondary block mb-1">Average Monthly Spend</span>
              <p className="text-3xl font-serif font-bold text-charcoal">
                ₹{annualData.average_monthly_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-secondary mt-1 block">Across recorded months</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
              <span className="text-[11px] font-semibold text-secondary block mb-1">Peak Spending Month</span>
              <p className="text-lg font-bold text-orange mt-1">
                {annualData.highest_spending_month}
              </p>
              <span className="text-[10px] text-secondary mt-1 block">Highest groceries outgo</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-cream-muted shadow-soft">
              <span className="text-[11px] font-semibold text-secondary block mb-1">Lowest Spending Month</span>
              <p className="text-lg font-bold text-emerald-700 mt-1">
                {annualData.lowest_spending_month}
              </p>
              <span className="text-[10px] text-secondary mt-1 block">Most economical run</span>
            </div>
          </div>

          {/* 12-Month Progression Bar Chart */}
          <div className="p-6 rounded-2xl bg-white border border-cream-muted shadow-card">
            <h3 className="font-bold text-charcoal text-base mb-1">12-Month Expenditure Progression</h3>
            <p className="text-xs text-secondary mb-6">Historical grocery budget distribution for {annualData.year}</p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annualData.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9DFD1" vertical={false} />
                  <XAxis dataKey="month" stroke="#81796F" fontSize={11} />
                  <YAxis stroke="#81796F" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Expenditure']} />
                  <Bar dataKey="amount" fill="#E9853B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category-wise Annual Breakdown Table */}
          <div className="p-6 rounded-2xl bg-white border border-cream-muted shadow-card">
            <h3 className="font-bold text-charcoal text-base mb-4 pb-2 border-b border-cream-muted">
              Annual Spend by Category
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cream-muted text-secondary font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Total Transactions</th>
                    <th className="py-2.5 px-3">Annual Spend</th>
                    <th className="py-2.5 px-3 text-right">Share of Annual Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-muted/50">
                  {annualData.category_annual_breakdown.map((c, idx) => (
                    <tr key={idx} className="hover:bg-cream-light/40">
                      <td className="py-3 px-3 font-bold text-charcoal">{c.category}</td>
                      <td className="py-3 px-3 text-secondary font-mono">{c.transactions} bills</td>
                      <td className="py-3 px-3 font-bold text-charcoal font-serif">
                        ₹{c.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-orange">{c.percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : null}

      {/* BUDGET UPDATE MODAL */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-card border border-cream-muted space-y-4">
            <h3 className="font-bold text-charcoal text-base">Set Monthly Target Budget</h3>
            <p className="text-xs text-secondary">
              HomeStock will track your real-time spend and notify you if your bill total exceeds this amount.
            </p>
            <form onSubmit={handleSetBudget} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase mb-1">Target Budget (₹)</label>
                <input
                  type="number"
                  step="100"
                  min="500"
                  value={newBudgetAmt}
                  onChange={(e) => setNewBudgetAmt(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-cream-muted text-charcoal font-mono outline-none focus:border-orange bg-cream-light"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-cream-muted font-semibold text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
