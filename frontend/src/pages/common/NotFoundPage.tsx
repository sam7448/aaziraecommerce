import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25" />
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-50 to-violet-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
            <span className="text-4xl font-extrabold tracking-wider">404</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Page not found</h1>
          <p className="text-slate-500 text-sm">
            Sorry, we couldn’t find the page you’re looking for. It might have been moved or removed.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-indigo-200"
          >
            <Home className="w-4 h-4" /> Go to Home
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            <Search className="w-4 h-4" /> Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};
