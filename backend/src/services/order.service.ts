import { orderRepository } from '../repositories/order.repository';
import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { CreateOrderDTO, Order, OrderStatus } from '../types/order.types';

export class OrderService {
  async checkout(customerId: string, dto: CreateOrderDTO): Promise<Order> {
    const cart = await cartRepository.getCartByUserId(customerId);

    if (!cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    // Validate inventory and prepare items with price snapshot
    const orderItems: { productId: string; sellerId: string; priceSnapshot: number; quantity: number }[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product || product.status !== 'active') {
        throw new Error(`Product "${item.product?.name || item.productId}" is no longer available.`);
      }

      const availableStock = product.inventory ? product.inventory.quantity - product.inventory.reservedQuantity : 0;
      if (item.quantity > availableStock) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${availableStock}`);
      }

      const unitPrice = product.discountPrice ?? product.price;
      subtotal += unitPrice * item.quantity;

      orderItems.push({
        productId: product.id,
        sellerId: product.sellerId,
        priceSnapshot: unitPrice,
        quantity: item.quantity,
      });
    }

    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% standard GST/Tax
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
    const total = subtotal + tax + shipping;

    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

    const order = await orderRepository.createOrder({
      customerId,
      orderNumber,
      subtotal,
      tax,
      shipping,
      total,
      shippingSnapshot: dto.shippingAddress,
      items: orderItems,
      paymentMethod: dto.paymentMethod,
    });

    // Deduct stock for each product
    for (const item of orderItems) {
      const product = await productRepository.findById(item.productId);
      if (product && product.inventory) {
        const newQty = product.inventory.quantity - item.quantity;
        await productRepository.updateInventory(item.productId, newQty, 'outbound', customerId);
      }
    }

    // Clear user cart
    await cartRepository.clearCart(customerId);

    return order;
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return orderRepository.findByCustomerId(customerId);
  }

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    return orderRepository.findBySellerId(sellerId);
  }

  async getAllOrders(): Promise<Order[]> {
    return orderRepository.findAll();
  }

  async getOrderById(orderId: string, userId: string, role: string): Promise<Order> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');

    if (role === 'customer' && order.customerId !== userId) {
      throw new Error('Forbidden: You can only view your own orders');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');

    // Business rules: cannot transition delivered/cancelled orders arbitrarily
    if (order.status === 'cancelled' || order.status === 'delivered') {
      throw new Error(`Cannot change status of an already ${order.status} order`);
    }

    return orderRepository.updateStatus(orderId, status);
  }
}

export const orderService = new OrderService();
