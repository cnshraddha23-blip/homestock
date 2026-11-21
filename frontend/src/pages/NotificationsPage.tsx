import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  AlertTriangle, 
  Package, 
  Wallet, 
  Receipt, 
  CheckCheck,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'EXPIRY_ALERT':
        return <AlertTriangle className="w-4 h-4 text-orange" />;
      case 'LOW_STOCK':
        return <Package className="w-4 h-4 text-orange-dark" />;
      case 'BUDGET_EXCEEDED':
        return <Wallet className="w-4 h-4 text-red-600" />;
      case 'BILL_SCANNED':
        return <Receipt className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-charcoal" />;
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-muted">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange">Alert Center</span>
          <h1 className="font-serif text-3xl font-bold text-charcoal mt-1">Household Notifications</h1>
          <p className="text-xs text-secondary mt-1">
            Automated alerts for expiring products, low stock levels, and budget limits.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-white border border-cream-muted hover:border-orange text-xs font-semibold text-charcoal flex items-center gap-2 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-orange" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-secondary animate-pulse">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-secondary bg-white rounded-2xl border border-cream-muted">
            No notifications at this time. Your pantry is in optimal shape!
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notification_id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 text-xs ${
                n.is_read ? 'bg-white/70 border-cream-muted/70 opacity-80' : 'bg-white border-orange/30 shadow-soft'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cream-light border border-cream-muted flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-charcoal text-sm">{n.title}</h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-orange"></span>
                    )}
                  </div>
                  <p className="text-secondary leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-secondary font-mono mt-1.5 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.notification_id)}
                  className="px-2.5 py-1 rounded-lg bg-cream hover:bg-cream-muted text-secondary hover:text-charcoal text-[11px] font-semibold flex-shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
