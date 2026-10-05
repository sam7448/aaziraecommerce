import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { Cart, AddToCartDTO, WishlistItem } from '../types/cart.types';

export class CartService {
  async getCart(userId: string): Promise<Cart> {
    return cartRepository.getCartByUserId(userId);
  }

  async addToCart(userId: string, dto: AddToCartDTO): Promise<Cart> {
    const product = await productRepository.findById(dto.productId);
    if (!product || product.status !== 'active') {
      throw new Error('Product not available');
    }

    const availableStock = product.inventory ? product.inventory.quantity - product.inventory.reservedQuantity : 0;
    if (dto.quantity > availableStock) {
      throw new Error(`Cannot add ${dto.quantity} items. Only ${availableStock} in stock.`);
    }

    await cartRepository.addItem(userId, dto.productId, dto.quantity);
    return cartRepository.getCartByUserId(userId);
  }

  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
    await cartRepository.updateItemQuantity(userId, itemId, quantity);
    return cartRepository.getCartByUserId(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    await cartRepository.removeItem(userId, itemId);
    return cartRepository.getCartByUserId(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await cartRepository.clearCart(userId);
  }

  // Wishlist
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return cartRepository.getWishlist(userId);
  }

  async addToWishlist(userId: string, productId: string): Promise<void> {
    await cartRepository.addToWishlist(userId, productId);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await cartRepository.removeFromWishlist(userId, productId);
  }
}

export const cartService = new CartService();
