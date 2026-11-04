"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  LogOut,
  Clock,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";

export function AdminToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<{
    configured: boolean;
    inviteUrl?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const hasCookie = document.cookie
        .split("; ")
        .some(
          (item) =>
            item.startsWith("czechbuy_admin_active=true") ||
            item.startsWith("czechbuy_admin_session=") ||
            item.startsWith("czechbuy_admin_token=")
        );
      setIsAdmin(hasCookie);

      if (hasCookie) {
        fetch("/api/admin/discord-status")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              setDiscordStatus({
                configured: data.configured,
                inviteUrl: data.inviteUrl,
              });
            }
          })
          .catch(() => {});
      }

      const savedMinimized = sessionStorage.getItem("czechbuy_admin_toolbar_minimized");
      if (savedMinimized === "true") {
        setIsMinimized(true);
      }
    } catch {
      setIsAdmin(false);
    }
  }, [pathname]);

  const toggleMinimize = () => {
    const nextState = !isMinimized;
    setIsMinimized(nextState);
    try {
      sessionStorage.setItem("czechbuy_admin_toolbar_minimized", String(nextState));
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      document.cookie = "czechbuy_admin_active=; path=/; max-age=0";
      document.cookie = "czechbuy_admin_session=; path=/; max-age=0";
      document.cookie = "czechbuy_admin_token=; path=/; max-age=0";
    } catch {
      // fallback
    }
    // Redirect to the locked countdown page
    window.location.href = "/brzy-otevirame";
  };

  // Don't render if not mounted, not admin, or already on the admin portal dashboard
  if (!mounted || !isAdmin || (pathname && pathname.startsWith("/interni-portal-8f2a9x"))) {
    return null;
  }

  // Minimized floating badge
  if (isMinimized) {
    return (
      <div className="fixed top-3 right-4 z-50 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={toggleMinimize}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950/90 dark:bg-neutral-900/90 text-white border border-neutral-700/80 shadow-xl backdrop-blur-md hover:bg-neutral-900 transition text-xs font-semibold group"
          title="Rozbalit administrační lištu"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[11px] text-amber-400 font-mono">Admin náhled</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition" />
        </button>
      </div>
    );
  }

  // Full floating toolbar at top of the screen
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-neutral-950/95 dark:bg-neutral-900/95 text-white border border-neutral-700/80 shadow-2xl backdrop-blur-md rounded-2xl p-2.5 sm:px-5 sm:py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Indicator & Status */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>

          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400 tracking-tight">
              Režim správce (Náhled webu)
            </span>
            <span className="hidden lg:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
              Veřejnost vidí odpočet
            </span>

            {/* Discord Webhook Status Indicator */}
            {discordStatus && (
              <div
                className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${
                  discordStatus.configured
                    ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300"
                    : "bg-amber-950/60 border-amber-700/60 text-amber-300"
                }`}
                title={
                  discordStatus.configured
                    ? "DISCORD_ORDER_WEBHOOK_URL je aktivní a propojen"
                    : "Upozornění: DISCORD_ORDER_WEBHOOK_URL není v .env nastaven"
                }
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    discordStatus.configured ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                  }`}
                />
                <span>
                  {discordStatus.configured ? "Webhook OK" : "Webhook nenastaven"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Discord Server Quick-Link */}
          <a
            href={discordStatus?.inviteUrl || process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#7983F5] hover:text-white border border-[#5865F2]/30 transition text-xs font-semibold active:scale-[0.98]"
            title="Otevřít oficiální CzechBuy Discord server (#live-objednávky)"
          >
            <DiscordIcon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Discord</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          {/* Quick link: Open Admin Panel */}
          <Link
            href="/interni-portal-8f2a9x/sprava"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 font-semibold text-xs tracking-wide transition shadow-xs active:scale-[0.98]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Přejít do správy</span>
          </Link>

          {/* Quick link: View Countdown Preview */}
          <Link
            href="/brzy-otevirame"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition text-xs"
            title="Zobrazit, jak stránku vidí běžní návštěvníci"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Náhled odpočtu</span>
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800/60 transition text-xs disabled:opacity-50"
            title="Ukončit režim správce a zamknout web"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Odhlásit se</span>
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={toggleMinimize}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Sbalit administrační lištu"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
