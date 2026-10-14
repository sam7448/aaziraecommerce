import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types/product.types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addToCart } from '../../store/cart/cart.slice';
import { cartService } from '../../services/cart.service';
import { useAuth } from '../../hooks/useAuth';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const primaryImage = product.images?.find((img) => img.isPrimary)?.storagePath 
    || product.images?.[0]?.storagePath 
    || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    await dispatch(addToCart({ productId: product.id, quantity: 1 }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      if (isWishlisted) {
        await cartService.removeFromWishlist(product.id);
        setIsWishlisted(false);
      } else {
        await cartService.addToWishlist(product.id);
        setIsWishlisted(true);
      }
    } catch {
      // Ignored
    }
  };

  const isOutOfStock = product.inventory && product.inventory.quantity <= 0;

  return (
    <div className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-[#FFE08B] transition-all duration-300 flex flex-col justify-between">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <Link to={`/products/${product.slug || product.id}`}>
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="bg-[#FFE08B] text-slate-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs border border-[#F2D070]">
              -{discountPercent}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-slate-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white shadow-xs'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product.slug || product.id}`}>
            <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 hover:text-amber-800 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900">
                ${(product.discountPrice ?? product.price).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            {product.inventory && product.inventory.quantity <= 5 && product.inventory.quantity > 0 && (
              <p className="text-[10px] font-medium text-amber-700">Only {product.inventory.quantity} left!</p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || added}
            className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 border border-[#F2D070] shadow-xs'
            }`}
            title="Add to cart"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4 text-slate-900" />}
          </button>
        </div>
      </div>
    </div>
  );
};
