import React, { useState } from 'react';
import { Package, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('aarav.sharma@example.com');
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-card border border-cream-muted">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange text-white flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-charcoal">Welcome Back</h2>
          <p className="text-xs text-secondary mt-1">Sign in to your HomeStock DBMS account</p>
        </div>

        {/* Demo Fast Login Pill */}
        <div 
          onClick={fillDemoAccount}
          className="mb-6 p-3 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-between cursor-pointer hover:bg-orange/15 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange" />
            <div className="text-left">
              <p className="text-xs font-bold text-charcoal">Academic Demo Account</p>
              <p className="text-[10px] text-secondary">Click to autofill Aarav Sharma's credentials</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-orange group-hover:underline">Autofill</span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-muted focus:border-orange focus:ring-1 focus:ring-orange text-sm text-charcoal outline-none bg-cream-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-muted focus:border-orange focus:ring-1 focus:ring-orange text-sm text-charcoal outline-none bg-cream-light"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold text-sm shadow-soft transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-secondary">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-orange hover:underline"
          >
            Create an Account
          </button>
        </div>

      </div>
    </div>
  );
};
