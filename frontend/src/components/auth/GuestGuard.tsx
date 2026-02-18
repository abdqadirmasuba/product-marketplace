'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { useAuth } from '@/hooks/useAuth';
import { setUser } from '@/store/slices/authSlice';
import { apiRequests } from '@/lib/api';
import { AuthResponse } from '@/types';

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {

    const checkAuth = async () => {
      // First, check if user already exists in Redux
      if (user) {
        setChecking(false);
        router.push('/dashboard');
        return;
      }

      console.log('No user in Redux, attempting to refresh auth...');

      // If no user in Redux, try to refresh (in case they have valid cookies)
      try {

        console.log('Attempting to refresh auth...');

        const response = await apiRequests.post('/api/auth/refresh/');
        console.log('Refresh successful:', response);
        // Success - set user data and redirect to dashboard
        dispatch(setUser(response.data.user));
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Failed to refresh auth:', error);
        setChecking(false);
        // Refresh failed - user is not authenticated, stay on login page
        dispatch(setUser(null));
      } finally {
        console.log('Finished auth check');
        setChecking(false);
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
