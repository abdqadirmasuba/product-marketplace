'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, Send, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Product, ProductStatus } from '@/types';
import StatusBadge from '@/components/products/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiRequests } from '@/lib/api';

export default function ProductsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiRequests.get('/api/products/', {
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setProducts(data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showToast('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (id: number) => {
    try {
      setActionLoading(id);
      await apiRequests.post(`/api/products/${id}/submit/`);
      
      showToast('Product submitted for approval', 'success');
      fetchProducts();
    } catch (error) {
      showToast('Failed to submit product', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      await apiRequests.post(`/api/products/${id}/approve/`);
      showToast('Product approved successfully', 'success');
      fetchProducts();
    } catch (error) {
      showToast('Failed to approve product', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setActionLoading(id);
      await apiRequests.post(`/api/products/${id}/reject/`);
      showToast('Product rejected', 'info');
      fetchProducts();
    } catch (error) {
      showToast('Failed to reject product', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    
    try {
      setActionLoading(id);
      await apiRequests.delete(`/api/products/${id}/`);
      showToast('Product deleted', 'success');
      fetchProducts();
    } catch (error) {
      showToast('Failed to delete product', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const canEdit = (product: Product) => {
    if (user?.role === 'admin') return true;
    if (product.status === 'approved') return false;
    return user?.role === 'approver' || user?.role === 'editor';
  };

  const canDelete = (product: Product) => {
    return user?.role === 'admin';
  };

  const canSubmit = (product: Product) => {
    if (product.status !== 'draft') return false;
    return user?.role === 'admin' || user?.role === 'approver' || user?.role === 'editor';
  };

  const canApproveReject = (product: Product) => {
    if (product.status !== 'pending_approval') return false;
    return user?.role === 'admin' || user?.role === 'approver';
  };

  const canCreate = user?.role === 'admin' || user?.role === 'approver' || user?.role === 'editor';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Products</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your product catalog</p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            New Product
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4 animate-slide-up">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'draft', label: 'Draft' },
            { value: 'pending_approval', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value as any)}
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                statusFilter === filter.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500 dark:hover:border-brand-500'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No products found</p>
            {canCreate && statusFilter === 'all' && !search && (
              <Link
                href="/dashboard/products/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                Create your first product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Created By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                        {product.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {product.created_by ? `${product.created_by.first_name} ${product.created_by.last_name}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {canSubmit(product) && (
                          <button
                            onClick={() => handleSubmit(product.id)}
                            disabled={actionLoading === product.id}
                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50"
                            title="Submit for approval"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {canApproveReject(product) && (
                          <>
                            <button
                              onClick={() => handleApprove(product.id)}
                              disabled={actionLoading === product.id}
                              className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(product.id)}
                              disabled={actionLoading === product.id}
                              className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {canEdit(product) && (
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        {canDelete(product) && (
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={actionLoading === product.id}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
