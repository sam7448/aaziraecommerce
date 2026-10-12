import { api } from './api';
import { Order, ShippingAddress } from '../types/order.types';

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  shippingAddress: ShippingAddress;
}

export const paymentService = {
  async createOrder(): Promise<RazorpayOrderResponse> {
    const res = await api.post<{ success: boolean; data: RazorpayOrderResponse }>('/payments/create-order');
    return res.data.data;
  },

  async verifyPayment(payload: VerifyPaymentPayload): Promise<Order> {
    const res = await api.post<{ success: boolean; data: Order }>('/payments/verify', payload);
    return res.data.data;
  },
};
