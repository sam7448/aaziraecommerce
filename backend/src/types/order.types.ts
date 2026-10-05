import { Product } from './product.types';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface ShippingAddressSnapshot {
  recipientName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  priceSnapshot: number;
  quantity: number;
  createdAt: string;
  product?: Product;
}

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingSnapshot: ShippingAddressSnapshot;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface CreateOrderDTO {
  shippingAddress: ShippingAddressSnapshot;
  paymentMethod: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}
