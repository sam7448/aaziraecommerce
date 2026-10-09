import React, { useEffect, useState } from 'react';
import { Package, TrendingUp, AlertTriangle, Plus, Check, Edit } from 'lucide-react';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import { Product, Category } from '../../types/product.types';
import { Order } from '../../types/order.types';
import { useAuth } from '../../hooks/useAuth';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'orders'>('overview');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    categoryId: '',
    price: 0,
    discountPrice: 0,
    initialStock: 10,
    description: '',
    imageUrl: '',
    status: 'active' as const,
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick inventory update state
  const [adjustingStockId, setAdjustingStockId] = useState<string | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(0);

  const loadSellerData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, orderRes] = await Promise.all([
        productService.getProducts({ sellerId: user?.id, limit: 100 }).catch((e) => {
          console.warn('Error loading products:', e);
          return { products: [], total: 0 };
        }),
        productService.getCategories().catch((e) => {
          console.warn('Error loading categories:', e);
          return [];
        }),
        orderService.getSellerOrders().catch((e) => {
          console.warn('Error loading seller orders:', e);
          return [];
        }),
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes || []);
      setOrders(orderRes || []);
    } catch (err) {
      console.error('Failed to load seller portal data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, [user?.id]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || newProduct.price <= 0) {
      setFormError('Please fill in product name, SKU, and a valid price.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await productService.createProduct({
        name: newProduct.name.trim(),
        sku: newProduct.sku.trim(),
        categoryId: newProduct.categoryId ? newProduct.categoryId : undefined,
        price: Number(newProduct.price),
        discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : undefined,
        description: newProduct.description.trim(),
        status: newProduct.status,
        initialStock: Number(newProduct.initialStock),
        images: newProduct.imageUrl.trim() ? [{ storagePath: newProduct.imageUrl.trim(), isPrimary: true }] : [],
      });
      setShowAddModal(false);
      setNewProduct({
        name: '',
        sku: '',
        categoryId: '',
        price: 0,
        discountPrice: 0,
        initialStock: 10,
        description: '',
        imageUrl: '',
        status: 'active',
      });
      setSuccessMessage('Product created successfully and published to store catalog!');
      setActiveTab('products');
      setTimeout(() => setSuccessMessage(''), 5000);
      await loadSellerData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleProductStatus = async (product: Product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await productService.updateProduct(product.id, { status: nextStatus });
      setProducts(products.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p)));
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleUpdateStock = async (productId: string) => {
    if (newStockQty < 0) return;
    try {
      await productService.updateInventory(productId, newStockQty);
      setAdjustingStockId(null);
      await loadSellerData();
    } catch (err) {
      console.error('Failed to update stock', err);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      await loadSellerData();
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  // Metrics
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing');
  const lowStockProducts = products.filter(
    (p) => p.inventory && p.inventory.quantity <= (p.inventory.lowStockThreshold || 5)
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-white rounded-2xl border border-slate-100" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">Merchant Portal</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Seller Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Store Owner: <span className="font-semibold text-slate-700">{user?.fullName || user?.email}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Product Listing
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'inventory'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Inventory Control ({lowStockProducts.length > 0 && <span className="text-amber-600">!</span>})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Seller Orders ({orders.length})
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Gross Store Revenue</p>
                <h3 className="text-2xl font-black text-slate-900">${totalSales.toFixed(2)}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Orders</p>
                <h3 className="text-2xl font-black text-slate-900">{orders.length}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Active Products</p>
                <h3 className="text-2xl font-black text-slate-900">
                  {products.filter((p) => p.status === 'active').length}
                </h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Low Stock Alerts</p>
                <h3 className="text-2xl font-black text-slate-900">{lowStockProducts.length}</h3>
              </div>
            </div>
          </div>

          {/* Pending fulfillment table */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Orders Awaiting Fulfillment</h2>
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-slate-400">All customer orders have been dispatched or completed.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingOrders.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600">{ord.orderNumber}</span>
                      <p className="text-xs text-slate-500">
                        {ord.shippingSnapshot?.recipientName} • {ord.shippingSnapshot?.city}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-amber-50 text-amber-700">
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Products Management Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">Product Catalog</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              + Create Listing
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="p-4 font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="p-4 font-bold text-slate-800">${p.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          (p.inventory?.quantity ?? 0) <= 0
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.inventory?.quantity ?? 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          p.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleProductStatus(p)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        {p.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
          <div>
            <h2 className="font-bold text-slate-900">Inventory Stock Audit</h2>
            <p className="text-xs text-slate-500">Enforces positive stock balance and atomic updates</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Available Stock</th>
                  <th className="p-3">Reserved</th>
                  <th className="p-3">Threshold</th>
                  <th className="p-3 text-right">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const qty = p.inventory?.quantity ?? 0;
                  const isEditing = adjustingStockId === p.id;

                  return (
                    <tr key={p.id}>
                      <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="p-3 font-bold text-slate-800">{qty}</td>
                      <td className="p-3 text-slate-500">{p.inventory?.reservedQuantity ?? 0}</td>
                      <td className="p-3 text-slate-500">{p.inventory?.lowStockThreshold ?? 5}</td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={newStockQty}
                              onChange={(e) => setNewStockQty(Number(e.target.value))}
                              className="w-20 px-2 py-1 text-xs border rounded-lg"
                            />
                            <button
                              onClick={() => handleUpdateStock(p.id)}
                              className="p-1 bg-emerald-600 text-white rounded-md text-xs font-bold"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setAdjustingStockId(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded-md text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAdjustingStockId(p.id);
                              setNewStockQty(qty);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            <Edit className="w-3.5 h-3.5" /> Set Qty
                          </button>
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

      {/* 4. Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
          <div>
            <h2 className="font-bold text-slate-900">Seller Fulfillment Orders</h2>
            <p className="text-xs text-slate-500">Manage orders containing your store's items</p>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 border rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-indigo-700 text-sm">{ord.orderNumber}</span>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                      {ord.status}
                    </span>
                    <select
                      value={ord.status}
                      onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value)}
                      className="text-xs bg-slate-50 border rounded-lg px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <span className="font-bold block text-slate-800 mb-0.5">Shipping Address:</span>
                  {ord.shippingSnapshot?.recipientName}, {ord.shippingSnapshot?.addressLine1},{' '}
                  {ord.shippingSnapshot?.city} ({ord.shippingSnapshot?.postalCode}) • Phone:{' '}
                  {ord.shippingSnapshot?.phone || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900">Add New Product Listing</h2>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Wireless Noise Canceling Headphones"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="WNC-001"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.discountPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, discountPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.initialStock}
                    onChange={(e) => setNewProduct({ ...newProduct, initialStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product specifications, materials, highlights..."
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700"
                >
                  {submitting ? 'Creating...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
