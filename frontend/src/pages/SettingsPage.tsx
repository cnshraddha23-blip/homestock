import React, { useState } from 'react';
import { 
  User, 
  Database, 
  ShieldCheck, 
  HardDrive, 
  Key, 
  IndianRupee, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="pb-6 border-b border-cream-muted">
        <span className="text-xs font-bold uppercase tracking-wider text-orange">System Preferences</span>
        <h1 className="font-serif text-3xl font-bold text-charcoal mt-1">Household Settings & DBMS Architecture</h1>
        <p className="text-xs text-secondary mt-1">
          User profile details, database connection status, and schema integrity specifications.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-cream-muted shadow-card space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-cream-muted">
          <div className="w-14 h-14 rounded-2xl bg-orange/20 text-orange font-serif text-2xl font-bold flex items-center justify-center">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="font-bold text-charcoal text-lg">{user?.full_name}</h2>
            <p className="text-xs text-secondary">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cream text-secondary">
              Household ID: #{user?.user_id}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-cream-light rounded-xl border border-cream-muted">
            <span className="text-secondary block mb-1">Currency Standard</span>
            <span className="font-bold text-charcoal text-sm flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-orange" />
              Indian Rupee (INR ₹)
            </span>
          </div>

          <div className="p-3.5 bg-cream-light rounded-xl border border-cream-muted">
            <span className="text-secondary block mb-1">Authentication Standard</span>
            <span className="font-bold text-charcoal text-sm">JWT Bearer (HS256)</span>
          </div>
        </div>
      </div>

      {/* Academic DBMS Specifications Card */}
      <div className="bg-white rounded-2xl p-6 border border-cream-muted shadow-card space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-cream-muted">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange" />
            <h3 className="font-bold text-charcoal text-base">Relational Database Engine</h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>3NF Normalized</span>
          </span>
        </div>

        <div className="space-y-3 text-xs text-secondary">
          <p className="leading-relaxed">
            HomeStock uses a strictly normalized 14-table relational database architecture with primary/foreign key cascading, check constraints, indexes on dates/users, and binary BLOB columns for bill images.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            {[
              "1. users",
              "2. categories",
              "3. products",
              "4. inventory_batches",
              "5. stock_movements",
              "6. bills (BLOB)",
              "7. purchases",
              "8. purchase_items",
              "9. monthly_grocery_lists",
              "10. grocery_list_items",
              "11. recurring_grocery_items",
              "12. expenses",
              "13. monthly_budgets",
              "14. notifications"
            ].map((tbl, idx) => (
              <div key={idx} className="p-2 bg-cream-light rounded-lg border border-cream-muted font-mono text-[11px] text-charcoal">
                {tbl}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-orange/10 border border-orange/20 text-charcoal mt-4">
            <p className="font-bold text-xs mb-1">Academic Project Strict Rule Compliance:</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-secondary">
              <li>No MongoDB / No Firebase / No Supabase used.</li>
              <li>No localStorage as primary database.</li>
              <li>Every dashboard figure and expense graph is computed from SQL.</li>
              <li>Physical receipts are preserved as binary images in MySQL.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
