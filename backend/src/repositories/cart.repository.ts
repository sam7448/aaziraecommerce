import { supabaseAdmin } from '../config/supabase';
import { Cart, CartItem, WishlistItem } from '../types/cart.types';

export class CartRepository {
  async getOrCreateCart(userId: string): Promise<string> {
    const { data: existing } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: newCart, error } = await supabaseAdmin
      .from('carts')
      .insert({ user_id: userId })
      .select('id')
      .single();

    if (error) throw error;
    return newCart.id;
  }

  async getCartByUserId(userId: string): Promise<Cart> {
    const cartId = await this.getOrCreateCart(userId);

    const { data: items, error } = await supabaseAdmin
      .from('cart_items')
      .select('*, products(*, product_images(*), inventory(*))')
      .eq('cart_id', cartId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let subtotal = 0;
    let totalItems = 0;

    const formattedItems: CartItem[] = (items || []).map((row: any) => {
      const prod = row.products;
      const unitPrice = prod?.discount_price ? Number(prod.discount_price) : Number(prod?.price || 0);
      subtotal += unitPrice * row.quantity;
      totalItems += row.quantity;

      return {
        id: row.id,
        cartId: row.cart_id,
        productId: row.product_id,
        quantity: row.quantity,
        createdAt: row.created_at,
        product: prod ? {
          id: prod.id,
          sellerId: prod.seller_id,
          categoryId: prod.category_id,
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku,
          price: Number(prod.price),
          discountPrice: prod.discount_price ? Number(prod.discount_price) : null,
          status: prod.status,
          createdAt: prod.created_at,
          updatedAt: prod.updated_at,
          images: prod.product_images,
          inventory: prod.inventory,
        } : undefined,
      };
    });

    return {
      id: cartId,
      userId,
      items: formattedItems,
      subtotal,
      totalItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<void> {
    const cartId = await this.getOrCreateCart(userId);

    const { data: existingItem } = await supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingItem) {
      await supabaseAdmin
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
    } else {
      await supabaseAdmin.from('cart_items').insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
      });
    }
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<void> {
    const cartId = await this.getOrCreateCart(userId);
    if (quantity <= 0) {
      await this.removeItem(userId, itemId);
      return;
    }

    await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('cart_id', cartId);
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    const cartId = await this.getOrCreateCart(userId);
    await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('cart_id', cartId);
  }

  async clearCart(userId: string): Promise<void> {
    const cartId = await this.getOrCreateCart(userId);
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cartId);
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabaseAdmin
      .from('wishlist_items')
      .select('*, products(*, product_images(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      createdAt: row.created_at,
      product: row.products,
    }));
  }

  async addToWishlist(userId: string, productId: string): Promise<void> {
    await supabaseAdmin
      .from('wishlist_items')
      .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' });
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await supabaseAdmin
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
  }
}

export const cartRepository = new CartRepository();
