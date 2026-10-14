import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, PackageOpen } from 'lucide-react';
import { productService } from '../../services/product.service';
import { Product, Category } from '../../types/product.types';
import { ProductCard } from '../../components/product/ProductCard';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters from query params
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('categoryId') || '';
  const currentSort = (searchParams.get('sortBy') as any) || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        search: currentSearch || undefined,
        categoryId: currentCategory || undefined,
        sortBy: currentSort,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        limit: 24,
      });
      setProducts(res.products || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentCategory, currentSort, minPrice, maxPrice]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const applyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMinPrice) next.set('minPrice', localMinPrice);
    else next.delete('minPrice');

    if (localMaxPrice) next.set('maxPrice', localMaxPrice);
    else next.delete('maxPrice');

    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setLocalMinPrice('');
    setLocalMaxPrice('');
  };

  const hasActiveFilters = Boolean(currentSearch || currentCategory || minPrice || maxPrice);

  return (
    <div className="space-y-6">
      {/* Top Header & Sort Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentSearch ? `Search results for "${currentSearch}"` : 'All Products'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} of {totalCount} available products
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={currentSort}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#FFE08B] focus:border-[#FFE08B] focus:outline-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside
          className={`lg:block ${
            sidebarOpen ? 'block fixed inset-0 z-50 bg-black/40 p-4' : 'hidden'
          } lg:relative lg:p-0`}
        >
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 max-w-sm ml-auto lg:max-w-none">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-800" /> Filter Catalog
              </h2>
              {sidebarOpen && (
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            )}

            {/* Categories Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('categoryId', null)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    !currentCategory
                      ? 'bg-[#FFE08B] text-slate-950 font-bold border border-[#F2D070]'
                      : 'text-slate-600 hover:bg-[#FFE08B]/20'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('categoryId', c.id)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      currentCategory === c.id
                        ? 'bg-[#FFE08B] text-slate-950 font-bold border border-[#F2D070]'
                        : 'text-slate-600 hover:bg-[#FFE08B]/20'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price ($)</h3>
              <form onSubmit={applyPriceFilter} className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFE08B] focus:border-[#FFE08B]"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFE08B] focus:border-[#FFE08B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 text-xs font-bold rounded-lg transition-colors border border-[#F2D070] shadow-xs cursor-pointer"
                >
                  Apply Price
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                  <div className="aspect-square bg-slate-100 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8 space-y-4">
              <PackageOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No products match your filters</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Try clearing selected filters or searching with different keywords.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 font-bold border border-[#F2D070] rounded-xl text-sm shadow-sm transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
