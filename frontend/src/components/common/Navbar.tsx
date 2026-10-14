import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User, Menu, X, Shield, Store, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { productService } from '../../services/product.service';
import { Category } from '../../types/product.types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  React.useEffect(() => {
    productService
      .getCategories()
      .then((data) => setCategories(data ? data.slice(0, 4) : []))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalCartCount = cart?.totalItems ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#FFE08B]/40 shadow-xs">
      {/* Top utility bar */}
      <div className="bg-[#FFE08B] text-slate-900 text-xs py-1.5 px-4 text-center font-semibold border-b border-[#F2D070]">
        ✨ Free shipping on all orders over $50! Use code <span className="font-extrabold text-slate-950 underline decoration-slate-950/40">WELCOME10</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFE08B] flex items-center justify-center text-slate-900 shadow-sm shadow-amber-200 border border-[#F2D070]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Nova<span className="bg-[#FFE08B] px-1 rounded-md text-slate-950 ml-0.5">Market</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FFE08B] focus:border-[#FFE08B] focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-900 text-xs px-4 py-1.5 rounded-full font-bold shadow-xs transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/products" className="hover:text-amber-800 transition-colors">
              All Products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="hover:text-amber-800 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/products?sortBy=newest" className="hover:text-amber-800 transition-colors">
              New Arrivals
            </Link>
          </nav>

          {/* Actions: Wishlist, Cart, Profile */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-slate-600 hover:text-amber-800 hover:bg-[#FFE08B]/20 rounded-full relative transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-1.5 p-2 text-slate-700 hover:text-amber-800 hover:bg-[#FFE08B]/20 rounded-full relative transition-colors"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FFE08B] text-slate-950 border border-amber-300 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {totalCartCount > 99 ? '99+' : totalCartCount}
                  </span>
                )}
              </div>
            </Link>

            {/* User Profile / Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 text-slate-700 hover:bg-[#FFE08B]/20 rounded-full border border-slate-200 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FFE08B] text-slate-900 border border-[#F2D070] flex items-center justify-center font-extrabold text-xs">
                    {user?.fullName ? user.fullName[0].toUpperCase() : user?.email[0].toUpperCase()}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName || user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-[#FFE08B]/30 text-amber-950 border border-[#FFE08B]">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-[#FFE08B]/10 hover:text-amber-800"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Customer Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-[#FFE08B]/10 hover:text-amber-800"
                    >
                      <User className="w-4 h-4" /> My Profile & Addresses
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-[#FFE08B]/10 hover:text-amber-800"
                    >
                      <ShoppingBag className="w-4 h-4" /> Order History
                    </Link>

                    {user?.role === 'seller' && (
                      <Link
                        to="/seller"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-900 bg-[#FFE08B]/20 hover:bg-[#FFE08B]/40 font-semibold"
                      >
                        <Store className="w-4 h-4" /> Seller Dashboard
                      </Link>
                    )}

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 bg-purple-50/50 hover:bg-purple-50 font-medium"
                      >
                        <Shield className="w-4 h-4" /> Admin Console
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-800 hover:text-slate-950 px-3.5 py-1.5 rounded-lg hover:bg-[#FFE08B]/20 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-[#FFE08B] hover:bg-[#F3D274] text-slate-900 px-4 py-1.5 rounded-xl shadow-xs border border-[#F2D070] transition-colors"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-amber-800 hover:bg-[#FFE08B]/20 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 rounded-lg"
            >
              All Products
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 rounded-lg"
            >
              Cart ({totalCartCount})
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 rounded-lg"
            >
              Wishlist
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
