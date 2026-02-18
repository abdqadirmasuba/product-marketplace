'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiRequests } from '@/lib/api';
import { Product } from '@/types';
import { ArrowLeft, AlertCircle, CheckCircle, Send, Trash2, User, Calendar } from 'lucide-react';
import StatusBadge from '@/components/products/StatusBadge';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiRequests.get<Product>(`/api/products/${params.id}/`);
      setProduct(data);
      setName(data.name);
      setDescription(data.description);
      setPrice(data.price);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const { data } = await apiRequests.patch<Product>(`/api/products/${product.id}/`, {
        name,
        description,
        price,
      });
      setProduct(data);
      setIsEditing(false);
      showToast('Product updated successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to update product', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!product) return;

    try {
      const { data } = await apiRequests.post<Product>(`/api/products/${product.id}/submit/`);
      setProduct(data);
      showToast('Product submitted for approval', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to submit product', 'error');
    }
  };

  const handleApprove = async () => {
    if (!product) return;

    try {
      const { data } = await apiRequests.post<Product>(`/api/products/${product.id}/approve/`);
      setProduct(data);
      showToast('Product approved successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to approve product', 'error');
    }
  };

  const handleReject = async () => {
    if (!product) return;

    try {
      const { data } = await apiRequests.post<Product>(`/api/products/${product.id}/reject/`);
      setProduct(data);
      showToast('Product rejected', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to reject product', 'error');
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiRequests.delete(`/api/products/${product.id}/`);
      showToast('Product deleted successfully', 'success');
      setTimeout(() => router.push('/dashboard/products'), 1000);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to delete product', 'error');
    }
  };

  const canEdit = product && user && product.status !== 'approved' && ['admin', 'approver', 'editor'].includes(user.role);
  const canDelete = user?.role === 'admin';
  const canSubmit = product && user && product.status === 'draft' && ['admin', 'approver', 'editor'].includes(user.role);
  const canApprove = product && user && product.status === 'pending_approval' && ['admin', 'approver'].includes(user.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
            Product Not Found
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
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
      <div className="mb-8">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:gap-3 transition-all mb-4 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {product.name}
            </h1>
            <StatusBadge status={product.status} />
          </div>
          <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
            ${parseFloat(product.price).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Product Form/Details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 mb-6">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(product.name);
                  setDescription(product.description);
                  setPrice(product.price);
                }}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Description
              </h3>
              <p className="text-slate-900 dark:text-white leading-relaxed">
                {product.description}
              </p>
            </div>

            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all"
              >
                Edit Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Audit Trail */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Audit Trail
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Created By
              </span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {product.created_by ? `${product.created_by.first_name} ${product.created_by.last_name}` : 'Unknown'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Created On
              </span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {new Date(product.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {product.approved_by && (
            <>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Approved By
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {`${product.approved_by.first_name} ${product.approved_by.last_name}`}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Updated On
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {new Date(product.updated_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Workflow Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Workflow Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {canSubmit && (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
              Submit for Approval
            </button>
          )}
          {canApprove && (
            <>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Product
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all"
              >
                <AlertCircle className="w-4 h-4" />
                Reject Product
              </button>
            </>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
