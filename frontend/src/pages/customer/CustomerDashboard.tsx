import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Heart,
  User,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ArrowRight,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/order.service';
import { cartService } from '../../services/cart.service';
import { Order } from '../../types/order.types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ordersData, wishlistData] = await Promise.allSettled([
          orderService.getMyOrders(),
          cartService.getWishlist(),
        ]);

        if (ordersData.status === 'fulfilled') {
          setOrders(ordersData.value || []);
        }
        if (wishlistData.status === 'fulfilled') {
          setWishlistCount(wishlistData.value?.length || 0);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalCartCount = cart?.totalItems ?? 0;
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped'
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FFFDF5] to-[#FFF8E6] border-2 border-[#FFE08B] text-slate-900 p-8 sm:p-10 shadow-xl shadow-amber-100/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE08B] text-slate-950 flex items-center justify-center text-2xl font-black border border-[#F2D070] shadow-sm">
              {user?.fullName ? user.fullName[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Welcome back, {user?.fullName || user?.email?.split('@')[0]}!
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-[#FFE08B] border border-[#F2D070] text-slate-950 shadow-xs">
                  {user?.role}
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-1">
                Manage your orders, saved items, and account settings from your customer portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 font-bold border border-[#F2D070] rounded-xl text-sm shadow-sm transition-all hover:shadow"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              Explore Catalog
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <User className="w-4 h-4 text-slate-600" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Decorative background circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#FFE08B]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-48 h-48 bg-amber-200/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-[#FFE08B] transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{orders.length}</h3>
            <Link to="/orders" className="text-xs text-slate-900 hover:text-amber-800 font-bold inline-flex items-center gap-1 mt-2">
              View all orders <ArrowRight className="w-3 h-3 text-amber-700" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFE08B]/30 text-amber-950 border border-[#FFE08B] flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-[#FFE08B] transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Deliveries</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeOrdersCount}</h3>
            <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1 mt-2">
              <Truck className="w-3.5 h-3.5" /> In transit or processing
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-[#FFE08B] transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items in Cart</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalCartCount}</h3>
            <Link to="/cart" className="text-xs text-slate-900 hover:text-amber-800 font-bold inline-flex items-center gap-1 mt-2">
              Go to checkout <ArrowRight className="w-3 h-3 text-amber-700" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFE08B]/30 text-amber-950 border border-[#FFE08B] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Saved Wishlist */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-[#FFE08B] transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Wishlist Items</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{wishlistCount}</h3>
            <Link to="/wishlist" className="text-xs text-slate-900 hover:text-amber-800 font-bold inline-flex items-center gap-1 mt-2">
              Manage wishlist <ArrowRight className="w-3 h-3 text-amber-700" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
                <p className="text-xs text-slate-500 mt-0.5">Track your past purchases and shipment statuses</p>
              </div>
              {orders.length > 0 && (
                <Link
                  to="/orders"
                  className="text-xs font-bold text-slate-900 hover:text-amber-800 flex items-center gap-1"
                >
                  View All Orders <ChevronRight className="w-4 h-4 text-amber-700" />
                </Link>
              )}
            </div>

            {loadingOrders ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFE08B]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50/60 text-amber-900 mx-auto flex items-center justify-center border border-[#FFE08B]/60">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No orders placed yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                    Once you make a purchase, your order history and tracking updates will appear right here.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 rounded-xl text-sm font-bold border border-[#F2D070] transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" /> Start Shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FFFDF5] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#FFE08B]/30 text-amber-950 border border-[#FFE08B] flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-slate-900">
                            #{order.orderNumber}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total</span>
                        <span className="text-sm font-black text-slate-950">${order.total.toFixed(2)}</span>
                      </div>
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-[#FFE08B] hover:text-slate-950 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/products"
              className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#FFF9E6] border border-[#FFE08B] flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FFE08B] text-slate-950 border border-[#F2D070] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Explore All Products</h4>
                <p className="text-xs text-slate-500 mt-0.5">Discover the newest drops, top brands and hot deals</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#FFFDF5] border border-slate-200 hover:border-[#FFE08B] flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#FFE08B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Manage Addresses</h4>
                <p className="text-xs text-slate-500 mt-0.5">Add or update your delivery addresses & preferences</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Account Snapshot & Safety */}
        <div className="space-y-6">
          {/* User Account Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base">Account Overview</h3>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#FFE08B] text-slate-950 border border-[#F2D070] flex items-center justify-center font-black text-base shadow-xs">
                {user?.fullName ? user.fullName[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 text-sm truncate">{user?.fullName || 'Nova Customer'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Account Type</span>
                <span className="font-bold text-slate-800 uppercase">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Security</span>
                <span className="text-slate-700 font-medium">Supabase Auth</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/profile"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-[#FFE08B] hover:text-slate-950 border border-slate-200 hover:border-[#F2D070] rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                Go to Full Profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Guarantee / Perks */}
          <div className="bg-[#FFFDF5] rounded-2xl border border-[#FFE08B]/80 p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Buyer Protection
            </div>
            <div className="space-y-2.5 text-xs text-slate-700">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>100% authentic items sourced directly from verified sellers.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>30-day hassle-free returns on eligible merchandise.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Encrypted checkout powered by industry standard tokenization.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
