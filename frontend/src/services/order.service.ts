import { api } from './api';
import { Order, ShippingAddress } from '../types/order.types';

export const orderService = {
  async checkout(shippingAddress: ShippingAddress, paymentMethod: string): Promise<Order> {
    const res = await api.post<{ data: Order }>('/orders/checkout', {
      shippingAddress,
      paymentMethod,
    });
    return res.data.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await api.get<{ data: Order[] }>('/orders/my-orders');
    return res.data.data;
  },

  async getSellerOrders(): Promise<Order[]> {
    const res = await api.get<{ data: Order[] }>('/orders/seller-orders');
    return res.data.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await api.get<{ data: Order[] }>('/orders/all');
    return res.data.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await api.get<{ data: Order }>(`/orders/${id}`);
    return res.data.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await api.patch<{ data: Order }>(`/orders/${id}/status`, { status });
    return res.data.data;
  },
};
