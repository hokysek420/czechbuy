export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  sale_percentage: number;
  sku: string;
  stock_quantity: number;
  category_id?: string;
  category_name?: string;
  images: string[];
  featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
  user_name?: string;
}

export type OrderStatus = 'pending' | 'awaiting_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'awaiting_payment' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'gopay' | 'card';

export interface ShippingAddress {
  full_name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  total: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_method: PaymentMethod;
  variable_symbol?: string;
  shipping_address?: ShippingAddress;
  phone?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  product_name?: string;
  product_image?: string;
  created_at: string;
}

export interface PaymentLog {
  id: string;
  order_id?: string;
  payment_method: string;
  action: string;
  status?: string;
  payload?: Record<string, unknown>;
  created_at: string;
}
