import React, { useState } from 'react';
import { Package, Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(fullName, email, password, phone);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-card border border-cream-muted">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange text-white flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-charcoal">Create Household Account</h2>
          <p className="text-xs text-secondary mt-1">Get your household inventory completely under control</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-secondary absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-muted focus:border-orange focus:ring-1 focus:ring-orange text-sm text-charcoal outline-none bg-cream-light"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-charcoal uppercase mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-secondary absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-muted focus:border-orange focus:ring-1 focus:ring-orange text-sm text-charcoal outline-none bg-cream-light"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-orange hover:bg-orange-dark text-white font-semibold text-sm shadow-soft transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {loading ? 'Registering...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-secondary">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-orange hover:underline"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
