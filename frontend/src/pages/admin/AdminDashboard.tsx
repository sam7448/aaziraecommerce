import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Users, Store, Plus, RefreshCw } from 'lucide-react';
import { adminService, AdminMetrics } from '../../services/admin.service';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import { Category, Product } from '../../types/product.types';
import { Order } from '../../types/order.types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'orders' | 'users'>('overview');

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Category creation form modal state
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [metRes, catRes, prodRes, ordRes, usrRes] = await Promise.all([
        adminService.getMetrics(),
        productService.getCategories(),
        productService.getProducts({ limit: 100 }),
        orderService.getAllOrders(),
        adminService.getUsers(),
      ]);
      setMetrics(metRes);
      setCategories(catRes || []);
      setProducts(prodRes.products || []);
      setOrders(ordRes || []);
      setUsers(usrRes || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await adminService.createCategory({
        name: newCatName.trim(),
        slug: newCatSlug.trim() || undefined,
        isActive: true,
      });
      setShowCatModal(false);
      setNewCatName('');
      setNewCatSlug('');
      const updatedCats = await productService.getCategories();
      setCategories(updatedCats || []);
    } catch (err) {
      console.error('Failed to create category', err);
    }
  };

  const handleToggleCategory = async (cat: Category) => {
    try {
      await adminService.updateCategory(cat.id, { isActive: !cat.isActive });
      setCategories(categories.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c)));
    } catch (err) {
      console.error('Failed to toggle category', err);
    }
  };

  const handleToggleProduct = async (prod: Product) => {
    const nextStatus = prod.status === 'active' ? 'inactive' : 'active';
    try {
      await productService.updateProduct(prod.id, { status: nextStatus });
      setProducts(products.map((p) => (p.id === prod.id ? { ...p, status: nextStatus } : p)));
    } catch (err) {
      console.error('Failed to toggle product status', err);
    }
  };

  const handleSellerApproval = async (userId: string, status: string) => {
    try {
      await adminService.updateSellerStatus(userId, status);
      await loadAdminData();
    } catch (err) {
      console.error('Failed to update seller status', err);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      await loadAdminData();
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 shadow-lg">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#FFE08B] tracking-wider">Super Administrator</span>
          <h1 className="text-2xl font-black text-white mt-0.5">Platform Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">Platform-wide metrics, governance, and catalog oversight</p>
        </div>

        <button
          onClick={loadAdminData}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-700 hover:bg-[#FFE08B] hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#FFE08B] text-[#FFE08B] font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-[#FFE08B] text-[#FFE08B] font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-[#FFE08B] text-[#FFE08B] font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Products Moderation ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#FFE08B] text-[#FFE08B] font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Platform Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#FFE08B] text-[#FFE08B] font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Users & Sellers ({users.length})
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 shadow-md">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Gross Platform Volume</p>
              <h3 className="text-2xl font-black text-white mt-1">${(metrics?.totalRevenue ?? 0).toFixed(2)}</h3>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 shadow-md">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Total Lifetime Orders</p>
              <h3 className="text-2xl font-black text-white mt-1">{metrics?.totalOrders ?? 0}</h3>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 shadow-md">
              <div className="p-3 bg-[#FFE08B]/20 text-[#FFE08B] rounded-xl w-fit mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Registered Customers</p>
              <h3 className="text-2xl font-black text-white mt-1">{metrics?.customersCount ?? 0}</h3>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 shadow-md">
              <div className="p-3 bg-[#FFE08B]/20 text-[#FFE08B] rounded-xl w-fit mb-3">
                <Store className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Active Merchants</p>
              <h3 className="text-2xl font-black text-white mt-1">{metrics?.sellersCount ?? 0}</h3>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Recent Customer Orders</h2>
            {orders.length === 0 ? (
              <p className="text-xs text-slate-400">No orders placed on the platform yet.</p>
            ) : (
              <div className="divide-y divide-slate-700">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#FFE08B]">{o.orderNumber}</span>
                      <p className="text-slate-400">{o.shippingSnapshot?.recipientName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white">${o.total.toFixed(2)}</span>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden space-y-4 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white">Category Taxonomy</h2>
              <p className="text-xs text-slate-400">Manage hierarchical category catalog</p>
            </div>
            <button
              onClick={() => setShowCatModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 font-bold border border-[#F2D070] rounded-xl text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3">Category Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="p-3 font-semibold text-white">{c.name}</td>
                    <td className="p-3 font-mono text-slate-400">{c.slug}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleCategory(c)}
                        className="text-xs font-semibold text-[#FFE08B] hover:text-amber-300"
                      >
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Products Moderation Tab */}
      {activeTab === 'products' && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden space-y-4 p-6">
          <h2 className="text-base font-bold text-white">Global Products Moderation</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 font-semibold text-white">{p.name}</td>
                    <td className="p-3 font-mono text-slate-400">{p.sku}</td>
                    <td className="p-3 font-bold text-white">${p.price.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleProduct(p)}
                        className="text-xs font-semibold text-[#FFE08B] hover:text-amber-300"
                      >
                        {p.status === 'active' ? 'Suspend' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden space-y-4 p-6">
          <h2 className="text-base font-bold text-white">Platform-wide Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="p-3 font-mono font-bold text-[#FFE08B]">{o.orderNumber}</td>
                    <td className="p-3 text-slate-300">{o.shippingSnapshot?.recipientName}</td>
                    <td className="p-3 font-bold text-white">${o.total.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase bg-slate-700 text-slate-200">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden space-y-4 p-6">
          <h2 className="text-base font-bold text-white">Users & Seller Approvals</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Approval Status</th>
                  <th className="p-3 text-right">Governance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((u) => {
                  const sellerStatus = u.seller_profiles?.[0]?.approval_status || 'standard';
                  return (
                    <tr key={u.id}>
                      <td className="p-3 font-mono text-slate-400">{u.id.slice(0, 8)}...</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-[#FFE08B]/20 text-[#FFE08B] border border-[#FFE08B]/40">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-300">{sellerStatus}</td>
                      <td className="p-3 text-right">
                        {u.role === 'seller' && (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleSellerApproval(u.id, 'approved')}
                              className="px-2 py-1 bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-md font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleSellerApproval(u.id, 'suspended')}
                              className="px-2 py-1 bg-rose-600/30 text-rose-400 hover:bg-rose-600 hover:text-white rounded-md font-bold"
                            >
                              Suspend
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Create New Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Home & Kitchen"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE08B]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Slug</label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="home-kitchen"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FFE08B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 rounded-xl font-bold border border-[#F2D070]"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
