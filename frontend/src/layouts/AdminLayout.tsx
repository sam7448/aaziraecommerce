import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, LogOut, ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base block tracking-tight">NovaAdmin</span>
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                Management Console
              </span>
            </div>
          </div>

          {/* Admin User Info */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
            <p className="text-slate-400">Authenticated Admin</p>
            <p className="font-semibold text-white truncate">{user?.email}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-semibold">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-purple-600 text-white shadow-sm"
            >
              <Shield className="w-4 h-4" /> Administration
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> View Storefront
            </Link>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white py-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 py-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-900 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
