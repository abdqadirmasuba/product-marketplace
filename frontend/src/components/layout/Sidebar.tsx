'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { useAuth } from '@/hooks/useAuth';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { apiRequests } from '@/lib/api';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Store, 
  Sun, 
  Moon, 
  Monitor,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from 'next-themes';
import RoleBadge from '@/components/ui/RoleBadge';
import { useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequests.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logoutAction());
      router.push('/login');
    }
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/products', icon: Package, label: 'Products' },
    ...(user?.role === 'admin' ? [{ href: '/dashboard/users', icon: Users, label: 'Users' }] : []),
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-72 
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Marketplace</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Product Manager</p>
              </div>
            </Link>
          </div>

          {/* User Card */}
          {user && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(user.first_name, user.last_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <RoleBadge role={user.role} />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                    ${isActive 
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Store className="w-5 h-5" />
              Public Store
            </Link>
          </nav>

          {/* Theme Switcher */}
          <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Theme</p>
            {!mounted ? (
              <div className="flex gap-2">
                <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-800">
                  <Sun className="w-4 h-4 mx-auto text-slate-400" />
                </div>
                <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-800">
                  <Monitor className="w-4 h-4 mx-auto text-slate-400" />
                </div>
                <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-800">
                  <Moon className="w-4 h-4 mx-auto text-slate-400" />
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 p-2 rounded-lg transition-all ${
                    theme === 'light'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  aria-label="Light theme"
                >
                  <Sun className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex-1 p-2 rounded-lg transition-all ${
                    theme === 'system'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  aria-label="System theme"
                >
                  <Monitor className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 p-2 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  aria-label="Dark theme"
                >
                  <Moon className="w-4 h-4 mx-auto" />
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
