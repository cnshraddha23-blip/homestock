import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  ScanLine, 
  CheckSquare, 
  AlertTriangle, 
  Wallet, 
  BarChart3, 
  Bell, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  unreadCount = 0
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'scan', label: 'Scan Bill', icon: ScanLine, highlight: true },
    { id: 'shopping-lists', label: 'Shopping Lists', icon: CheckSquare },
    { id: 'expiry', label: 'Expiry Tracker', icon: AlertTriangle },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`relative bg-cream-light border-r border-cream-muted transition-all duration-300 flex flex-col z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Trigger Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3.5 top-7 w-7 h-7 bg-cream border border-cream-muted rounded-full flex items-center justify-center text-charcoal shadow-sm hover:text-orange hover:border-orange transition-colors z-40"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation Menu */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-charcoal text-white shadow-soft font-semibold' 
                  : item.highlight
                  ? 'bg-orange/10 text-orange-dark hover:bg-orange/20 font-semibold'
                  : 'text-charcoal/80 hover:bg-cream hover:text-charcoal'
              }`}
            >
              <Icon 
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-orange' : item.highlight ? 'text-orange' : 'text-secondary group-hover:text-charcoal'
                }`} 
              />
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.badge && item.badge > 0 ? (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-orange text-white">
                  {item.badge}
                </span>
              ) : null}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-charcoal text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                  {item.badge && item.badge > 0 ? ` (${item.badge})` : ''}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Action Prompt in Expanded Sidebar */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 mb-4 rounded-xl bg-gradient-to-br from-cream to-cream-muted border border-cream-muted/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal mb-1">
            <Sparkles className="w-3.5 h-3.5 text-orange" />
            <span>AI Bill Ingestion</span>
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            Snap your grocery receipt to update stock & log expense in 1-click.
          </p>
        </div>
      )}

      {/* User Footer Profile */}
      <div className="p-3 border-t border-cream-muted">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-cream/60 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-orange/20 text-orange font-bold flex items-center justify-center flex-shrink-0">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-charcoal truncate">{user?.full_name}</p>
              <p className="text-[10px] text-secondary truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-secondary hover:text-orange rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
