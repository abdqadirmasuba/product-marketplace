'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, CheckCircle, Clock, FileText, ArrowRight, Plus, UserCheck, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types';
import { apiRequests } from '@/lib/api';
import StatusBadge from '@/components/products/StatusBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await apiRequests.get<Product[]>('/api/products/');
      setProducts(data);
      
      setStats({
        total: data.length,
        approved: data.filter(p => p.status === 'approved').length,
        pending: data.filter(p => p.status === 'pending_approval').length,
        draft: data.filter(p => p.status === 'draft').length,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentProducts = products.slice(0, 5);

  const rolePermissions = {
    admin: ['Create, edit & delete all products', 'Approve & reject products', 'Manage users & permissions', 'Full system access'],
    approver: ['Create & edit products', 'Approve & reject pending products', 'View all products'],
    editor: ['Create & edit own products', 'Submit products for approval', 'View all products'],
    viewer: ['View all products', 'Read-only access'],
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's what's happening with your marketplace today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'from-brand-500 to-brand-600', delay: '0ms' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'from-green-500 to-green-600', delay: '50ms' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-orange-500 to-orange-600', delay: '100ms' },
          { label: 'Drafts', value: stats.draft, icon: FileText, color: 'from-slate-500 to-slate-600', delay: '150ms' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-slide-up"
              style={{ animationDelay: stat.delay }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {loading ? '...' : stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Products</h2>
            <Link
              href="/dashboard/products"
              className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">No products yet</p>
              {(user?.role === 'admin' || user?.role === 'approver' || user?.role === 'editor') && (
                <Link
                  href="/dashboard/products/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all"
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
                  className="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        ${product.price} • {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <StatusBadge status={product.status} />
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Role Access Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Access</h2>
          
          <div className="mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Current Role</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
              <UserCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span className="font-bold text-brand-700 dark:text-brand-300 capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              What you can do
            </p>
            <ul className="space-y-2">
              {user && rolePermissions[user.role]?.map((permission, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{permission}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Quick Actions
            </p>
            {(user?.role === 'admin' || user?.role === 'approver' || user?.role === 'editor') && (
              <Link
                href="/dashboard/products/new"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                New Product
              </Link>
            )}
            <Link
              href="/products"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 text-slate-700 dark:text-slate-300 font-semibold transition-all"
            >
              <Eye className="w-4 h-4" />
              Public Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
