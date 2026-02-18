'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, CheckCircle, XCircle, Trash2, User, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types';
import StatusBadge from '@/components/products/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiRequests } from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await apiRequests.get<Product>(`/api/products/${params.id}/`);
      setProduct(data);
      setFormData({
        name: data.name,
        description: data.description,
        price: data.price,
      });
    } catch (error) {
      showToast('Failed to fetch product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !product) return;
    
    try {
      setSaving(true);
      const updated = await apiRequests.put<Product>(`/api/products/${product.id}/`, formData);
      setProduct(updated.data);
      showToast('Product updated successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to update product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action: 'submit' | 'approve' | 'reject' | 'delete') => {
    if (!product) return;
    
    if (action === 'delete' && !confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      switch (action) {
        case 'submit':
          await apiRequests.post(`/api/products/${product.id}/submit/`);
          showToast('Product submitted for approval', 'success');
          break;
        case 'approve':
          await apiRequests.post(`/api/products/${product.id}/approve/`);
          showToast('Product approved', 'success');
          break;
        case 'reject':
          await apiRequests.post(`/api/products/${product.id}/reject/`);
          showToast('Product rejected', 'info');
          break;
        case 'delete':
          await apiRequests.delete(`/api/products/${product.id}/`);
          showToast('Product deleted', 'success');
          router.push('/dashboard/products');
          return;
      }
      
      fetchProduct();
    } catch (error: any) {
      showToast(error.response?.data?.detail || `Failed to ${action} product`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const canEdit = () => {
    if (!product || !user) return false;
    if (user.role === 'admin') return true;
    if (product.status === 'approved') return false;
    return user.role === 'approver' || user.role === 'editor';
  };

  const canSubmit = () => {
    return product?.status === 'draft' && (user?.role === 'admin' || user?.role === 'approver' || user?.role === 'editor');
  };

  const canApproveReject = () => {
    return product?.status === 'pending_approval' && (user?.role === 'admin' || user?.role === 'approver');
  };

  const canDelete = () => {
    return user?.role === 'admin';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Product not found</p>
          <button
            onClick={() => router.push('/dashboard/products')}
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const isLocked = product.status === 'approved' && user?.role !== 'admin';

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <button
          onClick={() => router.push('/dashboard/products')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to products
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h1>
            <StatusBadge status={product.status} />
          </div>
          {/* Workflow Actions */}
          <div className="flex gap-2">
            {canSubmit() && (
              <button
                onClick={() => handleAction('submit')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            )}
            {canApproveReject() && (
              <>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {canDelete() && (
              <button
                onClick={() => handleAction('delete')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6 animate-slide-up">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
              {isLocked && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    ⚠️ This product is approved and locked for editing
                  </p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLocked || !canEdit()}
                  className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500'
                  } focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isLocked || !canEdit()}
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.description 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500'
                  } focus:ring-2 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed`}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={isLocked || !canEdit()}
                  className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.price 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500'
                  } focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                />
                {errors.price && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Save Button */}
            {canEdit() && !isLocked && (
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-all disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Audit Trail */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Audit Trail</h2>
            
            <div className="space-y-4">
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                  <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Created by</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {product.created_by 
                      ? `${product.created_by.first_name} ${product.created_by.last_name}`
                      : 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(product.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Updated */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Last updated</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(product.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Approved */}
              {product.approved_by && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Approved by</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {`${product.approved_by.first_name} ${product.approved_by.last_name}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Business */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Business</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{product.business_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
