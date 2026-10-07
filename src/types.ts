import type { OrderStatus } from './theme';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  /** Remote URL or local URI. Empty string = placeholder. */
  image: string;
  description: string;
  rating: number;
  colors: ProductColor[];
  sizes: string[];
  stockBySize: Record<string, number>;
  available: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  size: string;
  colorName: string;
  qty: number;
}

export interface OrderItem {
  productId: string;
  brand: string;
  name: string;
  image: string;
  size: string;
  colorName: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  coupon?: string;
  status: OrderStatus;
}

export interface Settings {
  userName: string;
  deliveryFee: number;
  currency: string;
  notifications: boolean;
}
