import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Home } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="max-w-xl mx-auto my-12 text-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-xl space-y-6">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Thank You for Your Order!</h1>
        <p className="text-sm text-slate-500">
          Your order has been received and confirmed. We have notified our fulfillment center to pack your items.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1">
        <span className="text-xs uppercase font-bold text-slate-400">Order Reference</span>
        <p className="text-lg font-mono font-bold text-indigo-700">{orderNumber}</p>
      </div>

      <p className="text-xs text-slate-400">
        A confirmation email and real-time delivery tracking link will be sent shortly.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link
          to="/orders"
          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
        >
          <Package className="w-4 h-4" /> Track in Orders
        </Link>
        <Link
          to="/"
          className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" /> Return Home
        </Link>
      </div>
    </div>
  );
};
