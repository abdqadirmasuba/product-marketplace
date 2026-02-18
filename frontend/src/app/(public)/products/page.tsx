'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Package, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { PublicProduct } from '@/types';
import { apiRequests } from '@/lib/api';

export default function PublicProductsPage() {
    const [products, setProducts] = useState<PublicProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [search, minPrice, maxPrice]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiRequests.get('/api/products/public/products/',
                {
                    search: search || undefined,
                    min_price: minPrice || undefined,
                    max_price: maxPrice || undefined,
                });

            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                            <Package className="w-4 h-4" />
                            <span className="text-sm font-semibold">{products.length} Products Available</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Product Marketplace</h1>
                        <p className="text-xl text-brand-100 max-w-2xl mx-auto">
                            Discover amazing products from trusted businesses
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border-0 text-slate-900 dark:text-white placeholder-slate-400 shadow-xl focus:ring-2 focus:ring-white/50 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Products */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filter Toggle */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        All Products
                    </h2>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 transition-all"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mb-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Min Price ($)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Max Price ($)
                                </label>
                                <input
                                    type="number"
                                    placeholder="1000.00"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                            />
                        ))}
                    </div>
                ) : products.length === 0 ? (
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
                        {products.map((product, index) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.id}`}
                                className="group animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="h-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-xl transition-all">
                                    <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                        {product.name}
                                    </h3>

                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                                        {product.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                                                ${product.price}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {product.business_name}
                                            </p>
                                        </div>

                                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
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
