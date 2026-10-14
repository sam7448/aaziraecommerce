import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      {/* Feature highlights bar */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-[#FFE08B]/15 text-[#FFE08B] border border-[#FFE08B]/20 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Free Express Shipping</h4>
              <p className="text-xs text-slate-400">On all eligible orders over $50</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-[#FFE08B]/15 text-[#FFE08B] border border-[#FFE08B]/20 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Secure Transactions</h4>
              <p className="text-xs text-slate-400">Encrypted payment & checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-[#FFE08B]/15 text-[#FFE08B] border border-[#FFE08B]/20 rounded-xl">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">30-Day Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free refunds & exchanges</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-[#FFE08B]/15 text-[#FFE08B] border border-[#FFE08B]/20 rounded-xl">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Dedicated Support</h4>
              <p className="text-xs text-slate-400">24/7 customer care & assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFE08B] text-slate-950 flex items-center justify-center font-black border border-[#F2D070]">
              <ShoppingBag className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">Nova<span className="text-[#FFE08B]">Market</span></span>
          </Link>
          <p className="text-sm text-slate-400 max-w-sm">
            Your destination for premium electronics, fashion, lifestyle gear, and verified marketplace products with direct seller fulfillment.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
            <li><Link to="/products?category=apparel" className="hover:text-white transition-colors">Fashion & Apparel</Link></li>
            <li><Link to="/products?sortBy=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/orders" className="hover:text-white transition-colors">Track Orders</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            <li><Link to="/profile" className="hover:text-white transition-colors">Account Settings</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Partners</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/register" className="hover:text-white transition-colors">Sell on NovaMarket</Link></li>
            <li><Link to="/seller" className="hover:text-white transition-colors">Seller Portal</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">Platform Admin</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} NovaMarket E-Commerce Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};
