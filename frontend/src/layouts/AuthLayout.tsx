import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 flex flex-col">
      {/* Top bar */}
      <header className="py-5 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xl hover:text-indigo-700 transition-colors">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          NovaMarket
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
