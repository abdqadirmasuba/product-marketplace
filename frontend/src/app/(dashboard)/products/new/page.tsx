'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { apiRequests } from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      const product = await apiRequests.post('/api/products/', formData);
      showToast('Product created successfully', 'success');
      router.push(`/dashboard/products/${product.data.id}`);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to create product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <button
          onClick={() => router.push('/dashboard/products')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to products
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create New Product</h1>
        <p className="text-slate-600 dark:text-slate-400">Add a new product to your catalog</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500'
              } focus:ring-2 transition-all`}
              placeholder="e.g., Premium Widget Pro"
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
              rows={5}
              className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.description 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500'
              } focus:ring-2 transition-all resize-none`}
              placeholder="Describe your product features and benefits..."
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
              className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border ${
                errors.price 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500'
              } focus:ring-2 transition-all`}
              placeholder="99.99"
            />
            {errors.price && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-all disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Product
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
