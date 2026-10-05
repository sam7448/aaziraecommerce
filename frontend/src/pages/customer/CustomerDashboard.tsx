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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white p-8 sm:p-10 shadow-xl shadow-indigo-100">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold border border-white/30 shadow-inner">
              {user?.fullName ? user.fullName[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome back, {user?.fullName || user?.email?.split('@')[0]}!
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase rounded-md bg-white/20 border border-white/30 backdrop-blur-sm text-indigo-100">
                  {user?.role}
                </span>
              </div>
              <p className="text-indigo-100 text-sm mt-1">
                Manage your orders, saved items, and account settings from your customer portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl text-sm shadow hover:bg-indigo-50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Explore Catalog
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-800/40 hover:bg-indigo-800/60 border border-white/20 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <User className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Decorative background circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-48 h-48 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</h3>
            <Link to="/orders" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 mt-2">
              View all orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Deliveries</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeOrdersCount}</h3>
            <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1 mt-2">
              <Truck className="w-3.5 h-3.5" /> In transit or processing
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Items in Cart</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCartCount}</h3>
            <Link to="/cart" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 mt-2">
              Go to checkout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Saved Wishlist */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Wishlist Items</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{wishlistCount}</h3>
            <Link to="/wishlist" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 mt-2">
              Manage wishlist <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
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
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View All Orders <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {loadingOrders ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-200">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">No orders placed yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                    Once you make a purchase, your order history and tracking updates will appear right here.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" /> Start Shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-sm text-slate-800">
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
                        <span className="text-sm font-bold text-slate-900">${order.total.toFixed(2)}</span>
                      </div>
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-medium transition-colors"
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
              className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Explore All Products</h4>
                <p className="text-xs text-slate-500 mt-0.5">Discover the newest drops, top brands and hot deals</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Manage Addresses</h4>
                <p className="text-xs text-slate-500 mt-0.5">Add or update your delivery addresses & preferences</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Account Snapshot & Safety */}
        <div className="space-y-6">
          {/* User Account Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-base">Account Overview</h3>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                {user?.fullName ? user.fullName[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-slate-800 text-sm truncate">{user?.fullName || 'Nova Customer'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Account Type</span>
                <span className="font-semibold text-slate-700 uppercase">{user?.role}</span>
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
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                Go to Full Profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Guarantee / Perks */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Buyer Protection
            </div>
            <div className="space-y-2.5 text-xs text-slate-600">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>100% authentic items sourced directly from verified sellers.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>30-day hassle-free returns on eligible merchandise.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Encrypted checkout powered by industry standard tokenization.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
