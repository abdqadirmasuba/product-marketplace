'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequests } from '@/lib/api';
import { PublicProduct } from '@/types';
import { Search, Package, ArrowRight, DollarSign, Building2, TrendingUp } from 'lucide-react';

export default function PublicProductsPage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<PublicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [search, minPrice, maxPrice, products]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiRequests.get<PublicProduct[]>('/api/products/public/products');
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
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

    if (minPrice) {
      filtered = filtered.filter((p) => parseFloat(p.price) >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter((p) => parseFloat(p.price) <= parseFloat(maxPrice));
    }

    setFilteredProducts(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{products.length} Products Available</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-brand-100 max-w-2xl mx-auto">
              Browse our curated collection of approved products from trusted businesses
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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

            {/* Price Filters */}
            <div className="flex gap-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-28 pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-28 pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:border-brand-500 dark:hover:border-brand-500 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900/30 dark:to-accent-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <Building2 className="w-4 h-4" />
                    <span>{product.business_name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold group-hover:gap-3 transition-all">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
