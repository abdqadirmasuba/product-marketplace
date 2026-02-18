'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Store, AlertCircle } from 'lucide-react';
import { useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/store/slices/authSlice';
import GuestGuard from '@/components/auth/GuestGuard';
import { apiRequests } from '@/lib/api';

const demoAccounts = [
  { email: 'admin@acme.com', password: 'password123', role: 'Admin', color: 'from-purple-500 to-purple-600' },
  { email: 'approver@acme.com', password: 'password123', role: 'Approver', color: 'from-blue-500 to-blue-600' },
  { email: 'editor@acme.com', password: 'password123', role: 'Editor', color: 'from-green-500 to-green-600' },
  { email: 'viewer@acme.com', password: 'password123', role: 'Viewer', color: 'from-slate-500 to-slate-600' },
];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiRequests.post('/api/auth/login/', { email, password });
      dispatch(setUser(response.data));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <GuestGuard>
      <div className="min-h-screen flex">
        {/* Left Panel - Branded */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-700 p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          
          <div className="relative z-10 text-white max-w-md animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
              <Store className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Product Marketplace</h1>
            <p className="text-xl text-brand-100 mb-8">
              Manage products with powerful approval workflows and role-based access control
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">✓</div>
                <p className="text-brand-50">Multi-role user management</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">✓</div>
                <p className="text-brand-50">Product approval workflow</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">✓</div>
                <p className="text-brand-50">Public marketplace storefront</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
          <div className="w-full max-w-md animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Quick Login (Demo Accounts)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    className={`p-3 rounded-xl bg-gradient-to-br ${account.color} text-white font-semibold text-sm hover:shadow-lg transition-all`}
                  >
                    {account.role}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-slide-up">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
