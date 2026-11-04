"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  LogOut,
  ArrowRight,
  UserCheck,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";
import { useDiscordAuth } from "@/lib/discord-auth-context";
import { Button } from "@/components/ui/button";

function PrihlaseniContent() {
  const { user, isLoggedIn, isLoading, login, logout, testLogin } = useDiscordAuth();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "1";
  const errorParam = searchParams.get("error");
  const [customTesterName, setCustomTesterName] = useState("");
  const [showTesterInput, setShowTesterInput] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-400 mb-8 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Domů
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
          Discord Přihlášení
        </span>
      </nav>

      {/* Notification banner if just redirected */}
      {isSuccess && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <strong className="block font-bold">Přihlášení proběhlo úspěšně!</strong>
            <span>Váš Discord účet je nyní propojen s CzechBuy.</span>
          </div>
        </div>
      )}

      {errorParam && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
          <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{decodeURIComponent(errorParam)}</span>
        </div>
      )}

      {isLoggedIn && user ? (
        /* LOGGED IN PROFILE CARD */
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 shadow-xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.global_name || user.username}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#5865F2] shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-neutral-950 dark:text-white">
                    {user.global_name || user.username}
                  </h1>
                  {user.isCzechBuyFam && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                      ⭐ CzechBuy Fam
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  @{user.username} • ID: {user.id}
                </p>
                {user.email && (
                  <p className="text-xs text-neutral-400 mt-1">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => logout()}
              className="text-xs uppercase tracking-wider font-semibold self-start sm:self-auto border-neutral-300 dark:border-neutral-700"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              <span>Odhlásit se</span>
            </Button>
          </div>

          {/* Member perks grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Stav účtu
              </span>
              <p className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-500" />
                <span>Ověřený člen</span>
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Aktivní Discord propojení
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                CzechBuy Komunita
              </span>
              <p className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>{user.isCzechBuyFam ? "VIP Člen" : "Host"}</span>
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {user.isCzechBuyFam ? "Přístup k privátním dropům" : "Připojte se na server pro VIP výhody"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Rychlá pokladna
              </span>
              <p className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Předvyplněno</span>
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Email i identita uloženy
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/katalog">
              <Button size="lg" className="text-xs uppercase tracking-wider font-bold">
                <ShoppingBag className="h-4 w-4 mr-2" />
                <span>Procházet katalog</span>
              </Button>
            </Link>

            <Link href="/pokladna">
              <Button size="lg" variant="outline" className="text-xs uppercase tracking-wider font-semibold">
                <span>Přejít do pokladny</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <a
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] font-semibold text-xs tracking-wider uppercase transition ml-auto"
            >
              <DiscordIcon className="h-4 w-4" />
              <span>Otevřít CzechBuy Discord</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ) : (
        /* LOGGED OUT STATE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Login Card */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 shadow-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] text-xs font-semibold tracking-wider uppercase">
              <DiscordIcon className="h-3.5 w-3.5" />
              <span>Oficiální přihlášení</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white">
                Přihlášení přes Discord
              </h1>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Přihlaste se jedním kliknutím pomocí svého Discord účtu. Žádná zdlouhavá hesla ani registrace.
              </p>
            </div>

            {/* Big Discord Login Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => login()}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-[#5865F2]/25 active:scale-[0.99]"
              >
                <DiscordIcon className="h-5 w-5" />
                <span>Pokračovat přes Discord</span>
              </button>
              <p className="text-[11px] text-center text-neutral-400 mt-2">
                Budete bezpečně přesměrováni na autorizační stránku Discordu.
              </p>
            </div>

            {/* Quick Dev/Test Login Section */}
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Rychlé testovací přihlášení (Dev preview)
                </span>
                <button
                  type="button"
                  onClick={() => setShowTesterInput(!showTesterInput)}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline"
                >
                  {showTesterInput ? "Zavřít" : "Vlastní jméno"}
                </button>
              </div>

              {showTesterInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTesterName}
                    onChange={(e) => setCustomTesterName(e.target.value)}
                    placeholder="Zadejte uživatelské jméno..."
                    className="flex-1 text-xs py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950"
                  />
                  <Button
                    size="sm"
                    onClick={() => testLogin(customTesterName || "CzechBuyTester")}
                    className="text-xs uppercase tracking-wider"
                  >
                    Přihlásit
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => testLogin("CzechBuyFam_VIP")}
                  className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Přihlásit jako VIP člen (1-klikový test)</span>
                </button>
              )}
            </div>
          </div>

          {/* Perks side column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Výhody přihlášení s Discordem
              </h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                      CzechBuy Fam VIP status
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                      Automatické ověření vaší role z oficiálního Discord serveru s přístupem ke speciálním akcím.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                      Přednostní notifikace dropů
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                      Okamžité upozornění na naskladnění limitovaných streetwear kolekcí a parfémů.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                      Rychlá a bezpečná pokladna
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                      Při nákupu se vaše kontaktní údaje předvyplní automaticky, nemusíte nic přepisovat.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#5865F2] hover:underline flex items-center gap-1.5"
                >
                  <span>Ještě nejste na našem Discordu? Připojte se</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrihlaseniPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-neutral-500">
          Načítání přihlašovacího rozhraní...
        </div>
      }
    >
      <PrihlaseniContent />
    </Suspense>
  );
}
