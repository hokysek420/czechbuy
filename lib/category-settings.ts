export interface CategoryStatusConfig {
  parfemy: boolean;  // true = Aktivní katalog, false = Coming Soon
  obleceni: boolean; // true = Aktivní katalog, false = Coming Soon
  boty: boolean;     // true = Aktivní katalog, false = Coming Soon
  digital: boolean;  // true = Aktivní katalog, false = Coming Soon
}

export const DEFAULT_CATEGORY_STATUS: CategoryStatusConfig = {
  parfemy: true,    // Parfémy jsou aktivní
  obleceni: false,  // Oblečení ve výchozím stavu Coming Soon
  boty: false,      // Boty ve výchozím stavu Coming Soon
  digital: false,   // Digital ve výchozím stavu Coming Soon
};

export const CATEGORY_STORAGE_KEY = "czechbuy_category_status_v2";

export function getCategoryStatus(): CategoryStatusConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CATEGORY_STATUS, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_CATEGORY_STATUS;
}

export function saveCategoryStatus(config: CategoryStatusConfig): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(
        new CustomEvent("czechbuy_categories_changed", { detail: config })
      );
    } catch {
      // fallback
    }

    // Sync to server API asynchronously
    fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    }).catch(() => {});
  }
}
