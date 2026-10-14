import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import { orderService } from '../../services/order.service';
import { Order } from '../../types/order.types';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Order not found</h2>
        <Link to="/orders" className="text-indigo-600 font-semibold hover:underline">
          Return to order history
        </Link>
      </div>
    );
  }

  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStepIdx = steps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-3xl border-2 border-[#FFE08B] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Order Information</span>
            <h1 className="text-2xl font-mono font-black text-slate-900">{order.orderNumber}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-2xl font-black text-slate-950">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Progress Tracker */}
        {order.status !== 'cancelled' ? (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Fulfillment Status</h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
              {steps.map((st, i) => {
                const isPassed = currentStepIdx >= i;
                return (
                  <div key={st} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed ? 'bg-[#FFE08B] text-slate-950 border border-[#F2D070] shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : i + 1}
                    </div>
                    <span className="text-[11px] font-bold capitalize text-slate-700">{st}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold">
            This order has been cancelled.
          </div>
        )}
      </div>

      {/* Grid: Delivery Snapshot & Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Purchased Items List */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-800" /> Items in this Order ({order.items?.length})
          </h2>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-amber-50/50 border border-amber-200/40 rounded-xl flex items-center justify-center text-amber-900 font-bold text-xs flex-shrink-0">
                    Item
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {item.product?.name || `Product ID: ${item.productId.slice(0, 8)}`}
                    </h4>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-950">
                    ${(item.priceSnapshot * item.quantity).toFixed(2)}
                  </span>
                  <p className="text-[11px] text-slate-400">${item.priceSnapshot.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-800" /> Shipping Details
            </h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">{order.shippingSnapshot?.recipientName}</p>
              <p>{order.shippingSnapshot?.addressLine1}</p>
              {order.shippingSnapshot?.addressLine2 && <p>{order.shippingSnapshot?.addressLine2}</p>}
              <p>
                {order.shippingSnapshot?.city}, {order.shippingSnapshot?.state} {order.shippingSnapshot?.postalCode}
              </p>
              <p>{order.shippingSnapshot?.country}</p>
              {order.shippingSnapshot?.phone && <p>Phone: {order.shippingSnapshot?.phone}</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-800" /> Payment Summary
            </h3>
            <div className="text-xs text-slate-600 space-y-2 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18% GST)</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900 text-sm">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
