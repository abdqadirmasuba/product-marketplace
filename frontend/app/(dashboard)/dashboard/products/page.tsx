'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiRequests } from '@/lib/api';
import { Product, ProductStatus } from '@/types';
import { Search, Plus, Trash2, Send, CheckCircle, XCircle, Edit, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/products/StatusBadge';

export default function ProductsListPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [search, statusFilter, products]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiRequests.get<Product[]>('/api/products/');
      setProducts(data);
    } catch (error) {
      showToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (id: number) => {
    try {
      await apiRequests.post(`/api/products/${id}/submit/`);
      showToast('Product submitted for approval', 'success');
      loadProducts();
    } catch (error) {
      showToast('Failed to submit product', 'error');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await apiRequests.post(`/api/products/${id}/approve/`);
      showToast('Product approved successfully', 'success');
      loadProducts();
    } catch (error) {
      showToast('Failed to approve product', 'error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await apiRequests.post(`/api/products/${id}/reject/`);
      showToast('Product rejected', 'success');
      loadProducts();
    } catch (error) {
      showToast('Failed to reject product', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiRequests.delete(`/api/products/${id}/`);
      showToast('Product deleted successfully', 'success');
      loadProducts();
    } catch (error) {
      showToast('Failed to delete product', 'error');
    }
  };

  const canCreate = user && ['admin', 'approver', 'editor'].includes(user.role);
  const canEdit = (product: Product) => {
    if (!user) return false;
    if (product.status === 'approved') return false;
    return ['admin', 'approver', 'editor'].includes(user.role);
  };
  const canDelete = user?.role === 'admin';
  const canApprove = user && ['admin', 'approver'].includes(user.role);
  const canSubmit = user && ['admin', 'approver', 'editor'].includes(user.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Products
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your product catalog
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                statusFilter === ''
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                statusFilter === 'draft'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setStatusFilter('pending_approval')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                statusFilter === 'pending_approval'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                statusFilter === 'approved'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Product
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Price
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Created By
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Date
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-600 dark:text-slate-400">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      ${parseFloat(product.price).toFixed(2)}
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
                        {product.status === 'draft' && canSubmit && (
                          <button
                            onClick={() => handleSubmit(product.id)}
                            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                            title="Submit for approval"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {product.status === 'pending_approval' && canApprove && (
                          <>
                            <button
                              onClick={() => handleApprove(product.id)}
                              className="p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(product.id)}
                              className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {canEdit(product) && (
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
