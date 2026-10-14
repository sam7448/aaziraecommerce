import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFFDF5] to-[#FFF9E6] flex flex-col">
      {/* Top bar */}
      <header className="py-5 px-6">
        <Link to="/" className="inline-flex items-center gap-2.5 text-slate-900 font-extrabold text-xl transition-colors">
          <div className="w-9 h-9 bg-[#FFE08B] border border-[#F2D070] rounded-xl flex items-center justify-center text-slate-950 shadow-xs">
            <ShoppingBag className="w-5 h-5 text-slate-950" />
          </div>
          <span>Nova<span className="bg-[#FFE08B] px-1 rounded-md text-slate-950 ml-0.5">Market</span></span>
        </Link>
      </header>

      {/* Main centered area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} NovaMarket. All rights reserved.
      </footer>
    </div>
  );
};
