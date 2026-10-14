import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, ArrowLeft, Check } from 'lucide-react';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product.types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addToCart } from '../../store/cart/cart.slice';
import { cartService } from '../../services/cart.service';
import { useAuth } from '../../hooks/useAuth';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        let p: Product;
        if (slug.length === 36 && slug.includes('-')) {
          p = await productService.getProductById(slug);
        } else {
          p = await productService.getProductBySlug(slug);
        }
        setProduct(p);
        const primary = p.images?.find((i) => i.isPrimary)?.storagePath 
          || p.images?.[0]?.storagePath 
          || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
        setSelectedImage(primary);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Product not found</h2>
        <p className="text-slate-500">The product you are looking for does not exist or was removed.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const currentPrice = product.discountPrice ?? product.price;
  const availableStock = product.inventory ? product.inventory.quantity - product.inventory.reservedQuantity : 0;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await dispatch(addToCart({ productId: product.id, quantity }));
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await dispatch(addToCart({ productId: product.id, quantity }));
    navigate('/cart');
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isWishlisted) {
      await cartService.removeFromWishlist(product.id);
      setIsWishlisted(false);
    } else {
      await cartService.addToWishlist(product.id);
      setIsWishlisted(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Breadcrumb / Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.storagePath)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img.storagePath
                      ? 'border-indigo-600 scale-95'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.storagePath} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                SKU: {product.sku}
              </span>
              <button
                onClick={handleToggleWishlist}
                className={`p-2 rounded-full border transition-all ${
                  isWishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-500'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
                title="Save to wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-snug">{product.name}</h1>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-4 text-sm">
            <div>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  Out of Stock
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  In Stock ({availableStock} units)
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">${currentPrice.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="text-base text-slate-400 line-through">${product.price.toFixed(2)}</span>
                <span className="text-xs font-bold text-slate-950 bg-[#FFE08B] border border-[#F2D070] px-2.5 py-0.5 rounded-full shadow-xs">
                  Save ${(product.price - product.discountPrice!).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="text-sm text-slate-600 leading-relaxed space-y-2">
              <h3 className="font-semibold text-slate-800">Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 disabled:opacity-50"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock || isOutOfStock}
                  className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {addedNotice && (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-sm font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                Added to cart successfully!
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 rounded-xl font-black bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 shadow-md shadow-amber-200/60 border border-[#F2D070] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-slate-950" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Delivery & Warranty perks */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1">
              <Truck className="w-5 h-5 mx-auto text-amber-700" />
              <p className="font-semibold text-slate-800">Fast Delivery</p>
              <p className="text-[11px] text-slate-400">2-4 business days</p>
            </div>
            <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1">
              <RotateCcw className="w-5 h-5 mx-auto text-amber-700" />
              <p className="font-semibold text-slate-800">30-Day Returns</p>
              <p className="text-[11px] text-slate-400">Easy refunds</p>
            </div>
            <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-amber-700" />
              <p className="font-semibold text-slate-800">Warranty</p>
              <p className="text-[11px] text-slate-400">1-Year guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
