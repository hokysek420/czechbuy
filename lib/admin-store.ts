import { Product, Order, OrderStatus } from "@/types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from "./mock-data";

// In-memory global store with localStorage persistence on client
let productsState: Product[] = [...INITIAL_PRODUCTS];
let ordersState: Order[] = [...INITIAL_ORDERS];

const PRODUCTS_STORAGE_KEY = "czechbuy_admin_products_v1";
const ORDERS_STORAGE_KEY = "czechbuy_admin_orders_v2";

export function getInitialProducts(): Product[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
  }
  return productsState;
}

export function saveProducts(products: Product[]): void {
  productsState = products;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch {
      // fallback
    }
  }
}

export function getInitialOrders(): Order[] {
  if (typeof window !== "undefined") {
    try {
      // Clear legacy storage containing fake test orders
      localStorage.removeItem("czechbuy_admin_orders_v1");
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
  }
  return ordersState;
}

export function saveOrders(orders: Order[]): void {
  ordersState = orders;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // fallback
    }
  }
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order[] {
  const current = getInitialOrders();
  const updated = current.map((order) =>
    order.id === orderId ? { ...order, status } : order
  );
  saveOrders(updated);
  return updated;
}
