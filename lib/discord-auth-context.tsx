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
  refreshVipStatus: () => Promise<void>;
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
      let loadedUser: DiscordUser | null = null;
      const stored = localStorage.getItem(DISCORD_USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          loadedUser = parsed;
        }
      } else {
        const cookieVal = readCookie(DISCORD_USER_COOKIE);
        if (cookieVal) {
          const parsed = JSON.parse(cookieVal);
          if (parsed && parsed.id) {
            loadedUser = parsed;
          }
        }
      }

      if (loadedUser && loadedUser.id) {
        // Owner failsafe upgrade for hokysek (verified by immutable Discord ID only)
        if (loadedUser.id === "1492628172611518504") {
          loadedUser.isOwner = true;
          loadedUser.isAdmin = true;
          loadedUser.isVip = true;
          loadedUser.isCzechBuyFam = true;
          loadedUser.roleName = "Owner";
          loadedUser.roleColor = "#f43f5e";
          if (!loadedUser.roleBadges || loadedUser.roleBadges.length === 0) {
            loadedUser.roleBadges = [
              { id: "owner", name: "Owner", color: "#f43f5e" },
              { id: "1567522100523040914", name: "Founder / Admin", color: "#6366f1" },
              { id: "1567522107393581176", name: "VIP Customer", color: "#f59e0b" },
              { id: "1567522110648221797", name: "CzechBuy Fam", color: "#a855f7" },
            ];
          }
        }

        setUser(loadedUser);
        localStorage.setItem(DISCORD_USER_STORAGE_KEY, JSON.stringify(loadedUser));
        writeCookie(DISCORD_USER_COOKIE, JSON.stringify(loadedUser));

        // Auto-sync in background to get latest server roles
        fetch(`/api/auth/discord/member-vip?userId=${loadedUser.id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const rs = data?.roleStatus || data?.vipStatus;
            if (rs) {
              const isOwnerSync = Boolean(
                rs.isOwner ||
                loadedUser?.isOwner ||
                loadedUser?.id === "1492628172611518504"
              );
              const isAdminSync = Boolean(isOwnerSync || rs.isAdmin || loadedUser?.isAdmin);
              const isModSync = Boolean(isOwnerSync || rs.isMod || loadedUser?.isMod);
              const isVipSync = Boolean(isOwnerSync || rs.isVip || loadedUser?.isVip);

              let badgesSync = (rs.roleBadges && rs.roleBadges.length > 0) ? rs.roleBadges : (loadedUser?.roleBadges || []);
              if (isOwnerSync && (!badgesSync || badgesSync.length === 0)) {
                badgesSync = [
                  { id: "owner", name: "Owner", color: "#f43f5e" },
                  { id: "1567522100523040914", name: "Founder / Admin", color: "#6366f1" },
                  { id: "1567522107393581176", name: "VIP Customer", color: "#f59e0b" },
                  { id: "1567522110648221797", name: "CzechBuy Fam", color: "#a855f7" },
                ];
              }

              const syncedUser: DiscordUser = {
                ...loadedUser!,
                isCzechBuyFam: Boolean(rs.isMember || rs.isCzechBuyFam || isOwnerSync),
                isVip: isVipSync,
                isOwner: isOwnerSync,
                isAdmin: isAdminSync,
                isMod: isModSync,
                roleName: isOwnerSync ? "Owner" : (rs.roleName || loadedUser?.roleName || null),
                roleColor: isOwnerSync ? "#f43f5e" : (rs.roleColor || loadedUser?.roleColor || null),
                roles: (rs.roles && rs.roles.length > 0) ? rs.roles : (loadedUser?.roles || []),
                roleBadges: badgesSync,
              };
              setUser(syncedUser);
              localStorage.setItem(DISCORD_USER_STORAGE_KEY, JSON.stringify(syncedUser));
              writeCookie(DISCORD_USER_COOKIE, JSON.stringify(syncedUser));
            }
          })
          .catch(() => {});
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

  const refreshVipStatus = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/auth/discord/member-vip?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        const rs = data?.roleStatus || data?.vipStatus;
        if (rs) {
          const isOwnerSync = Boolean(
            rs.isOwner ||
            user.isOwner ||
            user.id === "1492628172611518504"
          );
          const isAdminSync = Boolean(isOwnerSync || rs.isAdmin || user.isAdmin);
          const isModSync = Boolean(isOwnerSync || rs.isMod || user.isMod);
          const isVipSync = Boolean(isOwnerSync || rs.isVip || user.isVip);

          let badgesSync = (rs.roleBadges && rs.roleBadges.length > 0) ? rs.roleBadges : (user.roleBadges || []);
          if (isOwnerSync && (!badgesSync || badgesSync.length === 0)) {
            badgesSync = [
              { id: "owner", name: "Owner", color: "#f43f5e" },
              { id: "1567522100523040914", name: "Founder / Admin", color: "#6366f1" },
              { id: "1567522107393581176", name: "VIP Customer", color: "#f59e0b" },
              { id: "1567522110648221797", name: "CzechBuy Fam", color: "#a855f7" },
            ];
          }

          const updated: DiscordUser = {
            ...user,
            isCzechBuyFam: Boolean(rs.isMember || rs.isCzechBuyFam || isOwnerSync),
            isVip: isVipSync,
            isOwner: isOwnerSync,
            isAdmin: isAdminSync,
            isMod: isModSync,
            roleName: isOwnerSync ? "Owner" : (rs.roleName || user.roleName || null),
            roleColor: isOwnerSync ? "#f43f5e" : (rs.roleColor || user.roleColor || null),
            roles: (rs.roles && rs.roles.length > 0) ? rs.roles : (user.roles || []),
            roleBadges: badgesSync,
          };
          setSession(updated);
        }
      }
    } catch {}
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
        refreshVipStatus,
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
