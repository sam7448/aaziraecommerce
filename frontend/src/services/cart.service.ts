import { api } from './api';
import { Cart, WishlistItem } from '../types/cart.types';

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await api.get<{ data: Cart }>('/cart');
    return res.data.data;
  },

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    const res = await api.post<{ data: Cart }>('/cart/items', { productId, quantity });
    return res.data.data;
  },

  async updateQuantity(itemId: string, quantity: number): Promise<Cart> {
    const res = await api.put<{ data: Cart }>(`/cart/items/${itemId}`, { quantity });
    return res.data.data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const res = await api.delete<{ data: Cart }>(`/cart/items/${itemId}`);
    return res.data.data;
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },

  // Wishlist methods
  async getWishlist(): Promise<WishlistItem[]> {
    const res = await api.get<{ data: WishlistItem[] }>('/cart/wishlist');
    return res.data.data;
  },

  async addToWishlist(productId: string): Promise<void> {
    await api.post('/cart/wishlist', { productId });
  },

  async removeFromWishlist(productId: string): Promise<void> {
    await api.delete(`/cart/wishlist/${productId}`);
  },
};
