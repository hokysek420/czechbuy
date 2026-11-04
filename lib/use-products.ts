"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { getInitialProducts, saveProducts } from "@/lib/admin-store";

const PRODUCTS_STORAGE_KEY = "czechbuy_products_store_v2";

/**
 * React hook providing reactive, synchronized product data across all pages
 * (catalog, home page, product details, and admin portal).
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Load initial products from local store
    const local = getInitialProducts();
    setProducts(local);
    setIsLoaded(true);

    // 2. Sync with server API
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (Array.isArray(serverData)) {
          // If server has data or local storage was empty, update
          if (serverData.length > 0 || local.length === 0) {
            setProducts(serverData);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(serverData));
              } catch {}
            }
          }
        }
      })
      .catch(() => {});

    // 3. Listen to local custom event for immediate instant updates
    const handleLocalUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      } else {
        setProducts(getInitialProducts());
      }
    };

    // 4. Listen to storage event for cross-tab sync
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === PRODUCTS_STORAGE_KEY) {
        setProducts(getInitialProducts());
      }
    };

    window.addEventListener("czechbuy_products_changed", handleLocalUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("czechbuy_products_changed", handleLocalUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  return {
    products,
    setProducts: (newProducts: Product[]) => {
      setProducts(newProducts);
      saveProducts(newProducts);
    },
    isLoaded,
  };
}
