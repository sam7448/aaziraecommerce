import crypto from 'crypto';
import { razorpayClient } from '../config/razorpay';
import { config } from '../config/env';
import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { orderRepository } from '../repositories/order.repository';
import { Order, ShippingAddressSnapshot } from '../types/order.types';

export class PaymentService {
  async createRazorpayOrder(customerId: string): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  }> {
    const cart = await cartRepository.getCartByUserId(customerId);

    if (!cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

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
    }

    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const shipping = subtotal >= 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    const amountInPaise = Math.round(total * 100);

    const rzpOrder = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
      notes: {
        customerId,
      },
    });

    return {
      orderId: rzpOrder.id,
      amount: rzpOrder.amount as number,
      currency: rzpOrder.currency,
      keyId: config.razorpay.keyId,
      subtotal,
      tax,
      shipping,
      total,
    };
  }

  async verifyPaymentAndCreateOrder(
    customerId: string,
    payload: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      shippingAddress: ShippingAddressSnapshot;
    }
  ): Promise<Order> {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, shippingAddress } = payload;

    // 1. Verify Razorpay HMAC signature
    const hmac = crypto.createHmac('sha256', config.razorpay.keySecret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new Error('Payment verification failed: Invalid digital signature');
    }

    // 2. Fetch cart and assemble items
    const cart = await cartRepository.getCartByUserId(customerId);
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    const orderItems: { productId: string; sellerId: string; priceSnapshot: number; quantity: number }[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product || product.status !== 'active') {
        throw new Error(`Product "${item.product?.name || item.productId}" is no longer available.`);
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

    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const shipping = subtotal >= 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

    // 3. Create confirmed order with completed payment
    const order = await orderRepository.createOrder({
      customerId,
      orderNumber,
      subtotal,
      tax,
      shipping,
      total,
      shippingSnapshot: shippingAddress,
      items: orderItems,
      paymentMethod: 'razorpay',
      orderStatus: 'confirmed',
      providerPaymentId: razorpayPaymentId,
      paymentStatus: 'completed',
    });

    // 4. Update inventory
    for (const item of orderItems) {
      const product = await productRepository.findById(item.productId);
      if (product && product.inventory) {
        const newQty = product.inventory.quantity - item.quantity;
        await productRepository.updateInventory(item.productId, newQty, 'outbound', customerId);
      }
    }

    // 5. Clear cart
    await cartRepository.clearCart(customerId);

    return order;
  }
}

export const paymentService = new PaymentService();
