'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { useAuth } from '@/hooks/useAuth';
import { setUser } from '@/store/slices/authSlice';
import { apiRequests } from '@/lib/api';
import { AuthResponse } from '@/types';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If user exists in Redux, they're authenticated
      if (user) {
        setChecking(false);
        return;
      }

      // If no user in Redux, try to refresh (in case they have valid cookies)
      try {
        const { data } = await apiRequests.post<AuthResponse>('/api/auth/refresh/');
        // Success - rehydrate Redux with user data
        dispatch(setUser(data.user));
        setChecking(false);
      } catch (error) {
        // Refresh failed - redirect to login
        dispatch(setUser(null));
        router.push('/login');
      }
    };

    checkAuth();
  }, [user, dispatch, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
