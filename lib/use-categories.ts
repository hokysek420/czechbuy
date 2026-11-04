"use client";

import { useState, useEffect } from "react";
import {
  CategoryStatusConfig,
  DEFAULT_CATEGORY_STATUS,
  CATEGORY_STORAGE_KEY,
  getCategoryStatus,
  saveCategoryStatus,
} from "./category-settings";

export function useCategoryStatus() {
  const [status, setStatus] = useState<CategoryStatusConfig>(DEFAULT_CATEGORY_STATUS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Initial local load
    const local = getCategoryStatus();
    setStatus(local);
    setIsLoaded(true);

    // 2. Fetch from server API
    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (serverData && typeof serverData === "object") {
          setStatus((prev) => ({ ...prev, ...serverData }));
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(serverData));
            } catch {}
          }
        }
      })
      .catch(() => {});

    // 3. Listen to local custom event for instant re-rendering across components
    const handleLocal = (e: any) => {
      if (e?.detail) setStatus(e.detail);
    };

    // 4. Listen to storage event for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CATEGORY_STORAGE_KEY) {
        setStatus(getCategoryStatus());
      }
    };

    window.addEventListener("czechbuy_categories_changed", handleLocal);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("czechbuy_categories_changed", handleLocal);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateStatus = (newStatus: CategoryStatusConfig) => {
    setStatus(newStatus);
    saveCategoryStatus(newStatus);
  };

  const toggleCategory = (category: keyof CategoryStatusConfig) => {
    const updated = {
      ...status,
      [category]: !status[category],
    };
    updateStatus(updated);
  };

  return {
    status,
    updateStatus,
    toggleCategory,
    isLoaded,
  };
}
