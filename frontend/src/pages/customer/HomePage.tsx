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
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#FFFDF5] to-[#FFF8E6] text-slate-900 rounded-3xl p-8 sm:p-12 lg:p-16 border-2 border-[#FFE08B] shadow-xl shadow-amber-100/50">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE08B]/40 text-amber-950 text-xs font-bold border border-[#FFE08B]">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Season 2026 Collection Live
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-950">
            Discover Quality Essentials for Modern Life.
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Shop directly from verified independent creators and global brands with guaranteed next-day dispatch and secure checkout.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 font-extrabold rounded-xl shadow-md shadow-amber-200/60 border border-[#F2D070] transition-all transform hover:-translate-y-0.5"
            >
              Shop All Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/products?sortBy=price_desc"
              className="px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl border border-slate-200 shadow-xs transition-all"
            >
              Premium Selection
            </Link>
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#FFE08B]/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 top-10 w-72 h-72 bg-[#FFE08B]/20 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Explore by Category</h2>
              <p className="text-sm text-slate-500">Handpicked collections suited for every need</p>
            </div>
            <Link to="/products" className="text-sm font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="group p-5 bg-white border border-slate-200/80 rounded-2xl text-center hover:border-[#FFE08B] hover:shadow-lg hover:shadow-amber-100/50 transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFE08B]/30 text-amber-900 group-hover:bg-[#FFE08B] group-hover:text-slate-950 transition-colors flex items-center justify-center font-extrabold text-base border border-[#FFE08B]/40">
                  {cat.name[0]}
                </div>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-amber-800 transition-colors">
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
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Hot Right Now
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Trending Products</h2>
          </div>
          <Link to="/products" className="text-sm font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1">
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
              className="inline-block mt-2 px-5 py-2.5 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 font-bold rounded-xl text-sm shadow-xs border border-[#F2D070]"
            >
              Add First Product
            </Link>
          </div>
        )}
      </section>

      {/* Trust & Guarantee Callout */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-[#FFE08B] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#FFE08B]" /> Buyer Protection Guarantee
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
          className="px-7 py-3.5 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-400/20 transition-all flex-shrink-0 border border-[#F2D070]"
        >
          Start Shopping
        </Link>
      </section>
    </div>
  );
};
