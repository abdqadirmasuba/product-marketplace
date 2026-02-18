'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/store/slices/authSlice';
import { apiRequests } from '@/lib/api';
import GuestGuard from '@/components/auth/GuestGuard';
import { Store, Eye, EyeOff, AlertCircle, Users } from 'lucide-react';
import { AuthResponse } from '@/types';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        console.log('Attempting login with:', { email, password });
      const { data } = await apiRequests.post<AuthResponse>('/api/auth/login/', { email, password });
      console.log('Login successful:', data);
      dispatch(setUser(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <GuestGuard>
      <div className="min-h-screen flex">
        {/* Left Panel - Brand */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 p-12 flex-col justify-between">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Store className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Marketplace</h1>
                <p className="text-sm text-brand-100">Product Manager</p>
              </div>
            </div>

            <div className="max-w-md space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Manage Your Product Workflow
              </h2>
              <p className="text-xl text-brand-100">
                Streamline product approval with role-based access control and intuitive management tools.
              </p>

              <div className="space-y-4 pt-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Role-Based Access</h3>
                    <p className="text-brand-100 text-sm">Admin, Approver, Editor, and Viewer roles with specific permissions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Approval Workflow</h3>
                    <p className="text-brand-100 text-sm">Draft, submit, approve, and publish products seamlessly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Public Storefront</h3>
                    <p className="text-brand-100 text-sm">Approved products automatically appear in the public store</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-brand-100 text-sm">
            © 2026 Marketplace. All rights reserved.
          </p>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-950">
          <div className="w-full max-w-md animate-slide-up">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Marketplace</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Product Manager</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="mb-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Demo Accounts
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    className={`p-2.5 rounded-lg bg-gradient-to-br ${account.color} text-white text-xs font-semibold hover:shadow-lg hover:scale-105 transition-all`}
                  >
                    {account.role}
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Click to auto-fill credentials [ for testing purposes only ]
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-slide-up">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
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
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <span className="text-brand-600 dark:text-brand-400 font-semibold">
                Contact your administrator
              </span>
            </p>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
