'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiRequests } from '@/lib/api';
import { Product } from '@/types';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  FileText, 
  TrendingUp,
  Plus,
  Users as UsersIcon,
  Eye,
  Edit,
  ThumbsUp,
  ArrowRight 
} from 'lucide-react';
import StatusBadge from '@/components/products/StatusBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await apiRequests.get<Product[]>('/api/products/');
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: products.length,
    approved: products.filter((p) => p.status === 'approved').length,
    pending: products.filter((p) => p.status === 'pending_approval').length,
    draft: products.filter((p) => p.status === 'draft').length,
  };

  const recentProducts = products.slice(0, 5);

  const rolePermissions = {
    admin: ['Manage users', 'Approve products', 'Edit products', 'Delete products'],
    approver: ['Approve products', 'Create products', 'Edit products'],
    editor: ['Create products', 'Edit products', 'Submit for approval'],
    viewer: ['View products', 'View reports'],
  };

  const canCreate = user && ['admin', 'approver', 'editor'].includes(user.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's what's happening with your products today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.total}
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Products
          </div>
        </div>

        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.approved}
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Approved
          </div>
        </div>

        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.pending}
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Pending Approval
          </div>
        </div>

        <div 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: '150ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.draft}
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Drafts
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Products */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Recent Products
              </h2>
              <Link
                href="/dashboard/products"
                className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-2 flex items-center gap-1 transition-all"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No products yet</p>
                {canCreate && (
                  <Link
                    href="/dashboard/products/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Product
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900/30 dark:to-accent-900/30 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>
                    <StatusBadge status={product.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Role Card */}
          <div className="bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl p-6 text-white animate-slide-up" style={{ animationDelay: '250ms' }}>
            <h3 className="text-lg font-bold mb-4">Your Access Level</h3>
            <div className="text-3xl font-bold mb-4 capitalize">{user?.role}</div>
            <div className="space-y-2">
              {user && rolePermissions[user.role].map((permission) => (
                <div key={permission} className="flex items-center gap-2 text-brand-50">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{permission}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {canCreate && (
                <Link
                  href="/dashboard/products/new"
                  className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Create Product
                </Link>
              )}
              <Link
                href="/dashboard/products"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-all font-medium"
              >
                <Eye className="w-5 h-5" />
                View All Products
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/dashboard/users"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-all font-medium"
                >
                  <UsersIcon className="w-5 h-5" />
                  Manage Users
                </Link>
              )}
              <Link
                href="/products"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-all font-medium"
              >
                <Package className="w-5 h-5" />
                Public Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
