export interface CountdownConfig {
  targetDate: string; // "YYYY-MM-DDTHH:mm"
  headline: string;
  subtext: string;
  badgeText: string;
}

export const DEFAULT_COUNTDOWN_CONFIG: CountdownConfig = {
  targetDate: "2026-11-21T20:00",
  headline: "Připravujeme pro vás nový zážitek z nakupování",
  subtext: "CzechBuy brzy spustí exkluzivní nabídku prémiových vůní a zakázkového importu. Otevření proběhne za:",
  badgeText: "Připravujeme otevření e-shopu",
};

const COUNTDOWN_STORAGE_KEY = "czechbuy_countdown_config_v1";

export function getCountdownConfig(): CountdownConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_COUNTDOWN_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback to default
    }
  }
  return DEFAULT_COUNTDOWN_CONFIG;
}

export function saveCountdownConfig(config: CountdownConfig): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // fallback
    }
  }
}
