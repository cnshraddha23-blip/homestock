import React, { useState } from 'react';
import { Package, Menu, X, ArrowRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage = 'landing' }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: string) => {
    if (onNavigate) onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-cream/85 border-b border-cream-muted/70 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-orange flex items-center justify-center text-white shadow-soft transition-transform duration-300 group-hover:scale-105 group-hover:bg-orange-dark">
            <Package className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-charcoal">
              Home<span className="text-orange">Stock</span>
            </span>
            <span className="block text-[10px] tracking-widest uppercase font-semibold text-secondary">
              Household DBMS
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {!isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal/85">
            <button 
              onClick={() => handleNav('landing')} 
              className="hover:text-orange transition-colors"
            >
              Home
            </button>
            <a href="#features" className="hover:text-orange transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-orange transition-colors">
              How it works
            </a>
            <a href="#about" className="hover:text-orange transition-colors">
              About
            </a>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-charcoal/85">
            <button 
              onClick={() => handleNav('dashboard')} 
              className={`hover:text-orange transition-colors ${currentPage === 'dashboard' ? 'text-orange font-semibold' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleNav('inventory')} 
              className={`hover:text-orange transition-colors ${currentPage === 'inventory' ? 'text-orange font-semibold' : ''}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => handleNav('scan')} 
              className={`hover:text-orange transition-colors ${currentPage === 'scan' ? 'text-orange font-semibold' : ''}`}
            >
              Scan Bill
            </button>
            <button 
              onClick={() => handleNav('shopping-lists')} 
              className={`hover:text-orange transition-colors ${currentPage === 'shopping-lists' ? 'text-orange font-semibold' : ''}`}
            >
              Monthly Planner
            </button>
            <button 
              onClick={() => handleNav('expenses')} 
              className={`hover:text-orange transition-colors ${currentPage === 'expenses' ? 'text-orange font-semibold' : ''}`}
            >
              Expenses
            </button>
          </nav>
        )}

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => handleNav('login')}
                className="px-5 py-2.5 text-sm font-semibold text-charcoal hover:text-orange transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => handleNav('register')}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange-dark rounded-xl shadow-soft hover:shadow-card transition-all duration-200 flex items-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div 
                onClick={() => handleNav('settings')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-cream-light border border-cream-muted cursor-pointer hover:border-orange/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-orange/15 text-orange flex items-center justify-center font-bold text-xs">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <span className="text-xs font-semibold text-charcoal max-w-[120px] truncate">
                  {user?.full_name}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-xs font-medium text-secondary hover:text-charcoal px-2.5 py-1.5 rounded-lg border border-transparent hover:border-cream-muted"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-charcoal hover:bg-cream-muted"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream border-b border-cream-muted px-4 pt-3 pb-6 space-y-3">
          {!isAuthenticated ? (
            <>
              <button 
                onClick={() => handleNav('landing')} 
                className="block w-full text-left py-2 font-medium text-charcoal"
              >
                Home
              </button>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-charcoal">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-charcoal">
                How it works
              </a>
              <div className="pt-3 border-t border-cream-muted flex flex-col gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-2.5 text-center font-semibold text-charcoal border border-charcoal/20 rounded-xl"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="w-full py-2.5 text-center font-semibold text-white bg-orange rounded-xl"
                >
                  Get Started
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <button onClick={() => handleNav('dashboard')} className="block w-full text-left py-2 font-medium">Dashboard</button>
              <button onClick={() => handleNav('inventory')} className="block w-full text-left py-2 font-medium">Inventory</button>
              <button onClick={() => handleNav('scan')} className="block w-full text-left py-2 font-medium">Scan Bill</button>
              <button onClick={() => handleNav('shopping-lists')} className="block w-full text-left py-2 font-medium">Monthly Planner</button>
              <button onClick={() => handleNav('expiry')} className="block w-full text-left py-2 font-medium">Expiry Tracker</button>
              <button onClick={() => handleNav('expenses')} className="block w-full text-left py-2 font-medium">Expenses</button>
              <button onClick={() => handleNav('settings')} className="block w-full text-left py-2 font-medium">Settings</button>
              <button onClick={logout} className="block w-full text-left py-2 font-medium text-orange">Logout</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
