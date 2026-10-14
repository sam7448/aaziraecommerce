import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Home } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="max-w-xl mx-auto my-12 text-center bg-white p-8 sm:p-12 rounded-3xl border-2 border-[#FFE08B] shadow-xl shadow-amber-100/30 space-y-6">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Thank You for Your Order!</h1>
        <p className="text-sm text-slate-600">
          Your order has been received and confirmed. We have notified our fulfillment center to pack your items.
        </p>
      </div>

      <div className="bg-[#FFFDF5] border border-[#FFE08B] rounded-2xl p-4 space-y-1">
        <span className="text-xs uppercase font-bold text-slate-500">Order Reference</span>
        <p className="text-lg font-mono font-black text-slate-950">{orderNumber}</p>
      </div>

      <p className="text-xs text-slate-400">
        A confirmation email and real-time delivery tracking link will be sent shortly.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link
          to="/orders"
          className="flex-1 py-3 px-4 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 font-bold border border-[#F2D070] rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
        >
          <Package className="w-4 h-4 text-slate-950" /> Track in Orders
        </Link>
        <Link
          to="/"
          className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Home className="w-4 h-4 text-slate-600" /> Return Home
        </Link>
      </div>
    </div>
  );
};
