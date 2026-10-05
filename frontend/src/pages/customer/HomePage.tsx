import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { productService } from '../../services/product.service';
import { Product, Category } from '../../types/product.types';
import { ProductCard } from '../../components/product/ProductCard';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ limit: 8, sortBy: 'newest' }),
          productService.getCategories(),
        ]);
        setFeaturedProducts(prodRes.products || []);
        setCategories(catRes || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Season 2026 Collection Live
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Discover Quality Essentials for Modern Life.
          </h1>
          <p className="text-base sm:text-lg text-indigo-200">
            Shop directly from verified independent creators and global brands with guaranteed next-day dispatch and secure checkout.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-900 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-all transform hover:-translate-y-0.5"
            >
              Shop All Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/products?sortBy=price_desc"
              className="px-6 py-3.5 bg-indigo-700/50 hover:bg-indigo-700 text-white font-medium rounded-xl backdrop-blur-sm border border-indigo-500/30 transition-all"
            >
              Premium Selection
            </Link>
          </div>
        </div>

        {/* Decorative background blobs */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 top-10 w-72 h-72 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Explore by Category</h2>
              <p className="text-sm text-slate-500">Handpicked collections suited for every need</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="group p-5 bg-white border border-slate-100 rounded-2xl text-center hover:border-indigo-200 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center font-bold">
                  {cat.name[0]}
                </div>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending / New Arrivals Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Hot Right Now
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Trending Products</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 space-y-3">
            <Zap className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No products uploaded yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Sellers can add products via the seller portal to make them appear here immediately.
            </p>
            <Link
              to="/seller"
              className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium"
            >
              Add First Product
            </Link>
          </div>
        )}
      </section>

      {/* Trust & Guarantee Callout */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Buyer Protection Guarantee
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            100% Authentic Products & Transparent Tracking
          </h2>
          <p className="text-sm text-slate-300">
            Every order is protected by our zero-risk guarantee with automated status notifications, real-time dispatch verification, and 30-day refunds.
          </p>
        </div>
        <Link
          to="/products"
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex-shrink-0"
        >
          Start Shopping
        </Link>
      </section>
    </div>
  );
};
