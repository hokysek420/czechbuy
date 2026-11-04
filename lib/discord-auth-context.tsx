"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DiscordUser } from "@/types";
import {
  DISCORD_USER_COOKIE,
  DISCORD_USER_STORAGE_KEY,
  getDiscordAvatarUrl,
} from "./discord-auth";

interface DiscordAuthContextType {
  user: DiscordUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  setSession: (user: DiscordUser | null) => void;
  testLogin: (customUsername?: string) => void;
}

const DiscordAuthContext = createContext<DiscordAuthContextType | undefined>(undefined);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name: string, value: string, days = 30): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function DiscordAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Initial load from localStorage / Cookie
    try {
      const stored = localStorage.getItem(DISCORD_USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          setUser(parsed);
        }
      } else {
        const cookieVal = readCookie(DISCORD_USER_COOKIE);
        if (cookieVal) {
          const parsed = JSON.parse(cookieVal);
          if (parsed && parsed.id) {
            setUser(parsed);
            localStorage.setItem(DISCORD_USER_STORAGE_KEY, JSON.stringify(parsed));
          }
        }
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }

    // 2. Cross-tab & event listener
    const handleCustomEvent = (e: any) => {
      if (e?.detail) {
        setUser(e.detail);
      } else {
        setUser(null);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === DISCORD_USER_STORAGE_KEY) {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {}
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("czechbuy_discord_auth_changed", handleCustomEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("czechbuy_discord_auth_changed", handleCustomEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setSession = (newUser: DiscordUser | null) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      if (newUser) {
        const serialized = JSON.stringify(newUser);
        localStorage.setItem(DISCORD_USER_STORAGE_KEY, serialized);
        writeCookie(DISCORD_USER_COOKIE, serialized);
        window.dispatchEvent(
          new CustomEvent("czechbuy_discord_auth_changed", { detail: newUser })
        );
      } else {
        localStorage.removeItem(DISCORD_USER_STORAGE_KEY);
        deleteCookie(DISCORD_USER_COOKIE);
        window.dispatchEvent(
          new CustomEvent("czechbuy_discord_auth_changed", { detail: null })
        );
      }
    }
  };

  const login = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/api/auth/discord/login";
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/discord/logout", { method: "POST" });
    } catch {}
    setSession(null);
  };

  // Instant Test Login for development / local testing
  const testLogin = (customUsername = "CzechBuyFam_VIP") => {
    const demoUser: DiscordUser = {
      id: "1558604485088256060",
      username: customUsername.toLowerCase().replace(/\s+/g, "_"),
      global_name: customUsername,
      discriminator: "0",
      avatar: null,
      avatarUrl: getDiscordAvatarUrl({ discriminator: "0" }),
      email: `${customUsername.toLowerCase()}@czechbuy.fam`,
      verified: true,
      isCzechBuyFam: true,
      joinedAt: new Date().toISOString(),
    };
    setSession(demoUser);
  };

  return (
    <DiscordAuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        isLoading,
        login,
        logout,
        setSession,
        testLogin,
      }}
    >
      {children}
    </DiscordAuthContext.Provider>
  );
}

export function useDiscordAuth() {
  const context = useContext(DiscordAuthContext);
  if (!context) {
    throw new Error("useDiscordAuth must be used within a DiscordAuthProvider");
  }
  return context;
}
