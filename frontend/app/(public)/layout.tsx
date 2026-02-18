'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Store, Sun, Moon, Monitor, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ChatWidget from '@/components/chat/ChatWidget';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/products" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Marketplace</h1>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              {/* Theme Switcher */}
              {mounted ? (
                <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-1.5 rounded transition-all ${
                      theme === 'light'
                        ? 'bg-white dark:bg-slate-700 shadow-sm'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    aria-label="Light theme"
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-1.5 rounded transition-all ${
                      theme === 'system'
                        ? 'bg-white dark:bg-slate-700 shadow-sm'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    aria-label="System theme"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-1.5 rounded transition-all ${
                      theme === 'dark'
                        ? 'bg-white dark:bg-slate-700 shadow-sm'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    aria-label="Dark theme"
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div className="p-1.5 rounded">
                    <Sun className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="p-1.5 rounded">
                    <Monitor className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="p-1.5 rounded">
                    <Moon className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}

              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
      
      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
