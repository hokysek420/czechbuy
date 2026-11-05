"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert, ArrowLeft, Crown, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useDiscordAuth } from "@/lib/discord-auth-context";
import { DiscordIcon } from "@/components/ui/social-icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isLoggedIn, login } = useDiscordAuth();
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isDiscordOwner = isLoggedIn && user && (user.isOwner || user.isAdmin);

  useEffect(() => {
    // If already authenticated as Discord Owner, redirect directly to admin dashboard
    if (isDiscordOwner) {
      router.push("/interni-portal-8f2a9x/sprava");
    }
  }, [isDiscordOwner, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!secretKey.trim()) {
      setErrorMessage("Zadejte administrátorský přístupový klíč.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: secretKey.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Přihlášení se nezdařilo.");
      } else {
        router.push("/interni-portal-8f2a9x/sprava");
        router.refresh();
      }
    } catch {
      setErrorMessage("Chyba spojení se serverem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8">
      {/* Top bar with back link and theme switcher */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Zpět do e-shopu</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Login Box */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white dark:text-neutral-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Lock className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-full">
              Zabezpečená zóna
            </span>
            <h1 className="text-xl font-black text-neutral-900 dark:text-white mt-2">
              CzechBuy Interní Správa
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Přístup je vyhrazen pouze autorizovaným správcům systému.
            </p>
          </div>

          {/* Discord Owner 1-Click Access Card */}
          {isDiscordOwner ? (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  Ověřený Discord Owner
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Jste přihlášen jako <strong>@{user.username}</strong> s rolí Owner. Máte plná administrátorská práva.
              </p>
              <Link href="/interni-portal-8f2a9x/sprava">
                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 mr-1.5" />
                  <span>Vstoupit do administrace</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => login()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-wider transition shadow-md"
              >
                <DiscordIcon className="h-4 w-4" />
                <span>Přihlásit se přes Discord (Owner / Admin)</span>
              </button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-400">
                    Nebo administrátorský klíč
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-key"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Administrátorský klíč (ADMIN_SECRET_KEY)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="admin-key"
                  type={showKey ? "text" : "password"}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Vložte tajný klíč..."
                  className="w-full text-xs py-2.5 pl-9 pr-10 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  aria-label={showKey ? "Skrýt klíč" : "Zobrazit klíč"}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full uppercase tracking-wider text-xs font-bold"
            >
              Vstoupit do administrace
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <p className="text-[11px] text-neutral-400">
              Výchozí vývojový klíč:{" "}
              <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-600 dark:text-neutral-300 font-mono">
                czechbuy-admin-secure-2026!
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center text-[11px] text-neutral-400 max-w-sm mx-auto">
        Tento portál je chráněn před indexací vyhledávači (robots.txt: Disallow). Neautorizované pokusy o přístup jsou monitorovány.
      </div>
    </div>
  );
}
