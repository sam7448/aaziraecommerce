import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { cartService } from '../../services/cart.service';
import { WishlistItem } from '../../types/cart.types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addToCart } from '../../store/cart/cart.slice';
import { useAuth } from '../../hooks/useAuth';

export const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();

  const loadWishlist = async () => {
    try {
      const data = await cartService.getWishlist();
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRemove = async (productId: string) => {
    try {
      await cartService.removeFromWishlist(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist', err);
    }
  };

  const handleMoveToCart = async (productId: string) => {
    await dispatch(addToCart({ productId, quantity: 1 }));
    await handleRemove(productId);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <Heart className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Sign in to view your wishlist</h2>
        <p className="text-sm text-slate-500">Keep track of your favorite items across all your devices.</p>
        <Link to="/login" className="inline-block w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">My Wishlist</h1>
        <p className="text-sm text-slate-500 mt-1">Saved items you want to shop later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Your wishlist is empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Explore our catalog and click the heart icon on any product to save it here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const prod = item.product;
            const img = prod?.images?.[0]?.storagePath || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
            const price = prod ? prod.discountPrice ?? prod.price : 0;

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="relative aspect-square bg-slate-100">
                  <img src={img} alt={prod?.name || 'Product'} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-500 hover:text-rose-600 transition-colors shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <Link to={`/products/${prod?.slug || prod?.id}`}>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-1 hover:text-indigo-600">
                      {prod?.name || 'Product'}
                    </h3>
                  </Link>
                  <p className="font-bold text-slate-900">${price.toFixed(2)}</p>

                  <button
                    onClick={() => handleMoveToCart(item.productId)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" /> Move to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
