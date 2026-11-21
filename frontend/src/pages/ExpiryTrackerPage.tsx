import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Utensils, 
  Calendar, 
  Filter, 
  ShieldCheck, 
  Package, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

interface BatchExpiry {
  batch_id: number;
  product_id: number;
  product_name: string;
  category_name: string;
  batch_number: string;
  quantity: number;
  unit: string;
  purchase_date: string;
  expiry_date: string;
  days_left: number;
  status: 'SAFE' | 'EXPIRING_SOON' | 'EXPIRED';
  storage_location: string;
}

interface ExpiryTrackerPageProps {
  onNavigate: (page: string) => void;
}

export const ExpiryTrackerPage: React.FC<ExpiryTrackerPageProps> = () => {
  const [batches, setBatches] = useState<BatchExpiry[]>([]);
  const [summary, setSummary] = useState({
    expiring_today: 0,
    expiring_in_7_days: 0,
    expiring_in_30_days: 0,
    already_expired: 0,
    total_active_batches: 0
  });
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      const [sumData, batchData] = await Promise.all([
        api.getExpirySummary(),
        api.getExpiryBatches(filter)
      ]);
      setSummary(sumData);
      setBatches(batchData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, [filter]);

  const handleAction = async (batchId: number, action: 'CONSUME' | 'DISCARD') => {
    if (!confirm(`Are you sure you want to mark this batch as ${action.toLowerCase()}d? This will safely update product inventory.`)) return;
    try {
      await api.handleExpiryAction(batchId, { action });
      fetchExpiryData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-muted">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange">Zero Food Waste Assurance</span>
          <h1 className="font-serif text-3xl font-bold text-charcoal mt-1">Expiry Date Tracker</h1>
          <p className="text-xs text-secondary mt-1">
            Monitor batch shelf lives, prioritize consuming soon-to-expire groceries, and avoid wasteful spoilage.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter(filter === 'TODAY' ? 'ALL' : 'TODAY')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === 'TODAY' 
              ? 'bg-orange/15 border-orange shadow-card' 
              : 'bg-white border-cream-muted hover:border-orange/50 shadow-soft'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-orange block mb-1">Expiring Today</span>
          <p className="text-3xl font-serif font-bold text-orange">{summary.expiring_today}</p>
          <span className="text-[10px] text-secondary mt-1 block">Immediate action</span>
        </button>

        <button
          onClick={() => setFilter(filter === '7_DAYS' ? 'ALL' : '7_DAYS')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === '7_DAYS' 
              ? 'bg-orange/15 border-orange shadow-card' 
              : 'bg-white border-cream-muted hover:border-orange/50 shadow-soft'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-orange-dark block mb-1">In 7 Days (Critical)</span>
          <p className="text-3xl font-serif font-bold text-orange-dark">{summary.expiring_in_7_days}</p>
          <span className="text-[10px] text-secondary mt-1 block">Plan next meals</span>
        </button>

        <button
          onClick={() => setFilter(filter === '30_DAYS' ? 'ALL' : '30_DAYS')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === '30_DAYS' 
              ? 'bg-amber-100/50 border-amber-300 shadow-card' 
              : 'bg-white border-cream-muted hover:border-amber-300 shadow-soft'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">In 30 Days (Approaching)</span>
          <p className="text-3xl font-serif font-bold text-amber-800">{summary.expiring_in_30_days}</p>
          <span className="text-[10px] text-secondary mt-1 block">Safe window</span>
        </button>

        <button
          onClick={() => setFilter(filter === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === 'EXPIRED' 
              ? 'bg-charcoal text-white shadow-card' 
              : 'bg-white border-cream-muted hover:border-charcoal/50 shadow-soft'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase block mb-1 ${filter === 'EXPIRED' ? 'text-orange' : 'text-charcoal'}`}>
            Already Expired
          </span>
          <p className={`text-3xl font-serif font-bold ${filter === 'EXPIRED' ? 'text-white' : 'text-charcoal'}`}>
            {summary.already_expired}
          </p>
          <span className={`text-[10px] mt-1 block ${filter === 'EXPIRED' ? 'text-cream-muted' : 'text-secondary'}`}>
            Inspect & Discard
          </span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-cream-muted shadow-soft text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-secondary" />
          <span className="font-semibold text-charcoal">Active Filter:</span>
          <span className="font-bold text-orange uppercase tracking-wider">{filter.replace('_', ' ')}</span>
        </div>
        {filter !== 'ALL' && (
          <button 
            onClick={() => setFilter('ALL')}
            className="text-orange font-semibold hover:underline"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      {/* Batches Expiry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-secondary animate-pulse">
            Querying active batches from SQL...
          </div>
        ) : batches.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-secondary bg-white rounded-2xl border border-cream-muted">
            No grocery batches match this expiry criteria. All household food is safely accounted for!
          </div>
        ) : (
          batches.map((b) => {
            const isExpired = b.days_left < 0;
            const isSoon = b.days_left >= 0 && b.days_left <= 7;

            // Visual Status: Green (Safe), Orange (Expiring soon), Red/Charcoal (Expired)
            const badgeBg = isExpired 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : isSoon 
              ? 'bg-orange/15 text-orange-dark border-orange/30' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            const badgeText = isExpired 
              ? `Expired ${Math.abs(b.days_left)} days ago` 
              : b.days_left === 0 
              ? 'Expires Today' 
              : isSoon 
              ? `Expires in ${b.days_left} days` 
              : `Safe (${b.days_left} days left)`;

            return (
              <div 
                key={b.batch_id} 
                className={`p-5 rounded-2xl bg-white border transition-all duration-200 shadow-soft hover:shadow-card flex flex-col justify-between ${
                  isExpired ? 'border-red-200' : isSoon ? 'border-orange/40' : 'border-cream-muted'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-secondary font-semibold">
                      {b.batch_number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                      {badgeText}
                    </span>
                  </div>

                  <h3 className="font-bold text-charcoal text-base mb-1">{b.product_name}</h3>
                  <p className="text-xs text-secondary mb-3">{b.category_name}</p>

                  <div className="p-3 bg-cream-light rounded-xl border border-cream-muted space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-secondary">Quantity:</span>
                      <span className="font-mono font-bold text-charcoal">{b.quantity} {b.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Storage Zone:</span>
                      <span className="font-medium text-charcoal flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-secondary" />
                        {b.storage_location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Expiry Date:</span>
                      <span className="font-mono font-bold text-charcoal">{b.expiry_date}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-cream-muted flex gap-2">
                  <button
                    onClick={() => handleAction(b.batch_id, 'CONSUME')}
                    className="flex-1 py-2 rounded-xl bg-orange hover:bg-orange-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Consume</span>
                  </button>
                  <button
                    onClick={() => handleAction(b.batch_id, 'DISCARD')}
                    className="py-2 px-3 rounded-xl border border-cream-muted hover:border-red-300 text-secondary hover:text-red-600 text-xs font-semibold transition-colors"
                    title="Discard Spoiled Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
