import { supabaseAdmin } from '../config/supabase';
import { Order, OrderItem, OrderStatus, ShippingAddressSnapshot } from '../types/order.types';

export class OrderRepository {
  async createOrder(params: {
    customerId: string;
    orderNumber: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    shippingSnapshot: ShippingAddressSnapshot;
    items: { productId: string; sellerId: string; priceSnapshot: number; quantity: number }[];
    paymentMethod: string;
  }): Promise<Order> {
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: params.customerId,
        order_number: params.orderNumber,
        status: 'pending',
        subtotal: params.subtotal,
        tax: params.tax,
        shipping: params.shipping,
        total: params.total,
        shipping_snapshot: params.shippingSnapshot,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItemsToInsert = params.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      seller_id: item.sellerId,
      price_snapshot: item.priceSnapshot,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    // Create payment entry
    await supabaseAdmin.from('payments').insert({
      order_id: order.id,
      method: params.paymentMethod,
      amount: params.total,
      status: 'initiated',
    });

    return (await this.findById(order.id))!;
  }

  async findById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(*, product_images(*)))')
      .eq('id', orderId)
      .single();

    if (error) return null;
    return this.mapToEntity(data);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(*, product_images(*)))')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapToEntity);
  }

  async findBySellerId(sellerId: string): Promise<Order[]> {
    const { data: itemRows, error } = await supabaseAdmin
      .from('order_items')
      .select('order_id')
      .eq('seller_id', sellerId);

    if (error) throw error;
    const orderIds = Array.from(new Set((itemRows || []).map((r) => r.order_id)));

    if (orderIds.length === 0) return [];

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(*, product_images(*)))')
      .in('id', orderIds)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;
    return (orders || []).map(this.mapToEntity);
  }

  async findAll(): Promise<Order[]> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(*, product_images(*)))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapToEntity);
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*, order_items(*, products(*, product_images(*)))')
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  private mapToEntity(row: any): Order {
    return {
      id: row.id,
      customerId: row.customer_id,
      orderNumber: row.order_number,
      status: row.status,
      subtotal: Number(row.subtotal),
      tax: Number(row.tax),
      shipping: Number(row.shipping),
      total: Number(row.total),
      shippingSnapshot: row.shipping_snapshot,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items: (row.order_items || []).map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        sellerId: item.seller_id,
        priceSnapshot: Number(item.price_snapshot),
        quantity: item.quantity,
        createdAt: item.created_at,
        product: item.products,
      })),
    };
  }
}

export const orderRepository = new OrderRepository();
