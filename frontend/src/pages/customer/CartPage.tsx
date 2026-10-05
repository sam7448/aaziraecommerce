import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCart, updateCartQuantity, removeCartItem } from '../../store/cart/cart.slice';
import { useAuth } from '../../hooks/useAuth';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();
  const { cart, loading } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <ShoppingBag className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Sign in to view your cart</h2>
        <p className="text-sm text-slate-500">Sign in to access your saved cart items and complete your purchase.</p>
        <Link to="/login" className="inline-block w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const isFreeShipping = subtotal >= 50;
  const shipping = isFreeShipping ? 0 : 5.0;
  const total = subtotal + tax + shipping;

  const handleQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      dispatch(removeCartItem(itemId));
    } else {
      dispatch(updateCartQuantity({ itemId, quantity: newQty }));
    }
  };

  const handleRemove = (itemId: string) => {
    dispatch(removeCartItem(itemId));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Your Shopping Cart</h1>
        <p className="text-sm text-slate-500 mt-1">Review your items before proceeding to checkout</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Looks like you haven't added any items to your shopping cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {items.map((item) => {
                const prod = item.product;
                const unitPrice = prod?.discountPrice ?? prod?.price ?? 0;
                const img = prod?.images?.[0]?.storagePath || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';

                return (
                  <div key={item.id} className="p-4 sm:p-6 flex gap-4 items-center">
                    <img
                      src={img}
                      alt={prod?.name || 'product'}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${prod?.slug || prod?.id}`}
                        className="font-semibold text-slate-900 text-sm sm:text-base hover:text-indigo-600 line-clamp-1"
                      >
                        {prod?.name || 'Product'}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">SKU: {prod?.sku || 'N/A'}</p>
                      <p className="text-sm font-bold text-slate-800 mt-1.5">${unitPrice.toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => handleQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 hover:bg-slate-200 text-slate-700 text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 hover:bg-slate-200 text-slate-700 text-sm font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Free shipping threshold notice */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-indigo-950">
                  {isFreeShipping ? '🎉 You unlocked Free Express Shipping!' : `Add $${(50 - subtotal).toFixed(2)} more for Free Shipping!`}
                </p>
                <div className="w-full bg-indigo-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Checkout Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart?.totalItems} items)</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (18% GST)</span>
                <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Guaranteed Safe & Encrypted Checkout
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
