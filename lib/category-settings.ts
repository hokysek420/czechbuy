/**
 * Category Coming Soon Configuration
 * 
 * true  = Coming Soon IS ACTIVE (displays Coming Soon teaser banner matching screenshot)
 * false = Coming Soon IS INACTIVE (displays normal shop catalog with products and filters)
 */

export interface CategoryComingSoonConfig {
  parfemy: boolean;  // true = Coming Soon aktivní, false = Normální katalog
  obleceni: boolean; // true = Coming Soon aktivní, false = Normální katalog
  boty: boolean;     // true = Coming Soon aktivní, false = Normální katalog
  digital: boolean;  // true = Coming Soon aktivní, false = Normální katalog
}

// Backward compatibility alias
export type CategoryStatusConfig = CategoryComingSoonConfig;

export const DEFAULT_COMING_SOON_CONFIG: CategoryComingSoonConfig = {
  parfemy: false,  // Parfémy ve výchozím stavu: Normální katalog
  obleceni: true,  // Oblečení ve výchozím stavu: Coming Soon teaser
  boty: true,      // Boty ve výchozím stavu: Coming Soon teaser
  digital: true,   // Digital ve výchozím stavu: Coming Soon teaser
};

export const DEFAULT_CATEGORY_STATUS = DEFAULT_COMING_SOON_CONFIG;

export const CATEGORY_STORAGE_KEY = "czechbuy_coming_soon_config_v3";
export const CATEGORY_COOKIE_NAME = "czechbuy_coming_soon";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCategoryStatus(): CategoryComingSoonConfig {
  if (typeof window !== "undefined") {
    try {
      // 1. Try localStorage
      const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          return { ...DEFAULT_COMING_SOON_CONFIG, ...parsed };
        }
      }

      // 2. Fallback to Cookie
      const cookieVal = readCookie(CATEGORY_COOKIE_NAME);
      if (cookieVal) {
        const parsed = JSON.parse(cookieVal);
        if (parsed && typeof parsed === "object") {
          return { ...DEFAULT_COMING_SOON_CONFIG, ...parsed };
        }
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_COMING_SOON_CONFIG;
}

export function saveCategoryStatus(config: CategoryComingSoonConfig): void {
  if (typeof window !== "undefined") {
    const serialized = JSON.stringify(config);
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, serialized);
      writeCookie(CATEGORY_COOKIE_NAME, serialized);
      window.dispatchEvent(
        new CustomEvent("czechbuy_categories_changed", { detail: config })
      );
    } catch {
      // fallback
    }

    // Sync with server API asynchronously
    fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serialized,
    }).catch(() => {});
  }
}
