'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, Building2, Calendar, ArrowLeft } from 'lucide-react';
import { PublicProduct } from '@/types';
import { apiRequests } from '@/lib/api';

export default function PublicProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiRequests.get("api/products/public/products/" + params.id + "/");
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
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
          <Package className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Product not found
          </h3>
          <button
            onClick={() => router.push('/products')}
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/products')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to products
        </button>

        {/* Product Detail */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 animate-fade-in">
          {/* Product Icon */}
          <div className="mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Package className="w-10 h-10 text-white" />
          </div>

          {/* Product Name */}
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mb-8">
            <p className="text-5xl font-bold text-brand-600 dark:text-brand-400">
              ${product.price}
            </p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Description
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                <Building2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Business</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {product.business_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Listed on</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {new Date(product.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
