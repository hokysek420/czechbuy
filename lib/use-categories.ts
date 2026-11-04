"use client";

import { useState, useEffect } from "react";
import {
  CategoryComingSoonConfig,
  DEFAULT_COMING_SOON_CONFIG,
  CATEGORY_STORAGE_KEY,
  getCategoryStatus,
  saveCategoryStatus,
} from "./category-settings";

export function useCategoryStatus() {
  const [status, setStatus] = useState<CategoryComingSoonConfig>(DEFAULT_COMING_SOON_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Initial local load from localStorage / Cookie
    const local = getCategoryStatus();
    setStatus(local);
    setIsLoaded(true);

    // 2. Fetch from server API to stay in sync
    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (serverData && typeof serverData === "object") {
          setStatus(serverData);
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

  const updateStatus = (newStatus: CategoryComingSoonConfig) => {
    setStatus(newStatus);
    saveCategoryStatus(newStatus);
  };

  const toggleCategory = (category: keyof CategoryComingSoonConfig) => {
    const updated = {
      ...status,
      [category]: !status[category],
    };
    updateStatus(updated);
  };

  const isComingSoon = (category: keyof CategoryComingSoonConfig): boolean => {
    return Boolean(status[category]);
  };

  return {
    status,
    updateStatus,
    toggleCategory,
    isComingSoon,
    isLoaded,
  };
}
