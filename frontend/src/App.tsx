import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { ScanBillPage } from './pages/ScanBillPage';
import { ExpiryTrackerPage } from './pages/ExpiryTrackerPage';
import { ShoppingListsPage } from './pages/ShoppingListsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Auto-switch to dashboard when user logs in
  useEffect(() => {
    if (isAuthenticated && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('dashboard');
    } else if (!isAuthenticated && currentPage !== 'landing' && currentPage !== 'login' && currentPage !== 'register') {
      setCurrentPage('landing');
    }
  }, [isAuthenticated]);

  // Periodic notification count poll
  useEffect(() => {
    if (!isAuthenticated) return;
    const checkNotifs = async () => {
      try {
        const notifs = await api.getNotifications();
        const unread = notifs.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (e) {
        // ignore
      }
    };
    checkNotifs();
    const interval = setInterval(checkNotifs, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'inventory':
        return <InventoryPage onNavigate={setCurrentPage} />;
      case 'scan':
        return <ScanBillPage onNavigate={setCurrentPage} />;
      case 'expiry':
        return <ExpiryTrackerPage onNavigate={setCurrentPage} />;
      case 'shopping-lists':
        return <ShoppingListsPage onNavigate={setCurrentPage} />;
      case 'expenses':
      case 'analytics':
        return <ExpensesPage onNavigate={setCurrentPage} />;
      case 'notifications':
        return <NotificationsPage onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentPage} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  const isAuthView = isAuthenticated && currentPage !== 'landing';

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />

      {isAuthView ? (
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            unreadCount={unreadCount}
          />
          <main className="flex-1 overflow-y-auto bg-cream">
            {renderCurrentPage()}
          </main>
        </div>
      ) : (
        <main className="flex-1">
          {renderCurrentPage()}
        </main>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
