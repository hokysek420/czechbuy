import { Product, Order, OrderStatus } from "@/types";

// In-memory global store initialized to empty array
let productsState: Product[] = [];
let ordersState: Order[] = [];

const PRODUCTS_STORAGE_KEY = "czechbuy_products_store_v2";
const ORDERS_STORAGE_KEY = "czechbuy_admin_orders_v2";

/**
 * Returns products from localStorage or in-memory store.
 * Starts completely empty until added by admin.
 */
export function getInitialProducts(): Product[] {
  if (typeof window !== "undefined") {
    try {
      // Purge any legacy localStorage keys that may hold old static mock items
      localStorage.removeItem("czechbuy_admin_products_v1");

      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          productsState = parsed;
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return productsState;
}

/**
 * Saves products to localStorage, notifies all active components,
 * and syncs with the server API.
 */
export function saveProducts(products: Product[]): void {
  productsState = products;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      // Dispatch custom event for instant cross-component re-rendering without reload
      window.dispatchEvent(
        new CustomEvent("czechbuy_products_changed", { detail: products })
      );
    } catch {
      // fallback
    }

    // Sync with server API asynchronously
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products),
    }).catch(() => {});
  }
}

/**
 * Orders management
 */
export function getInitialOrders(): Order[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("czechbuy_admin_orders_v1");
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          ordersState = parsed;
          return parsed;
        }
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
      window.dispatchEvent(
        new CustomEvent("czechbuy_orders_changed", { detail: orders })
      );
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
