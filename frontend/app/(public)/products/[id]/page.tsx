'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequests } from '@/lib/api';
import { PublicProduct } from '@/types';
import { ArrowLeft, Package, Building2, Calendar, DollarSign } from 'lucide-react';

export default function PublicProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiRequests.get<PublicProduct>(`/api/products/public/products/${params.id}/`);
      setProduct(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Product Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'This product does not exist or is not available.'}
          </p>
          <Link
            href="/products"
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
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:gap-3 transition-all mb-8 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        {/* Product Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-500 to-accent-500 p-8 sm:p-12">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {product.name}
            </h1>
            <div className="text-5xl font-bold text-white">
              ${parseFloat(product.price).toFixed(2)}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 sm:p-12">
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Description
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-brand-500" />
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Business
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {product.business_name}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-brand-500" />
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Listed On
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {new Date(product.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Interested in this product? Sign in to your dashboard to manage products.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
