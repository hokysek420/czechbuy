"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDiscordAuth } from "@/lib/discord-auth-context";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  LogOut,
  UserCheck,
  RefreshCw,
  Crown,
  User,
} from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";
import { Button } from "@/components/ui/button";

function PrihlaseniContent() {
  const { user, isLoggedIn, login, logout, testLogin, refreshVipStatus } = useDiscordAuth();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const successParam = searchParams.get("success");

  const [customTestName, setCustomTestName] = useState("");
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshVipStatus();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-in fade-in duration-300">
      {/* If logged in: User Profile Card */}
      {isLoggedIn && user ? (
        <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 shadow-lg space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#5865F2]/40 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#23a55a] border-2 border-white dark:border-neutral-900" />
                {user.isVip && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-neutral-950 font-bold text-[10px] shadow">
                    <Crown className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-neutral-950 dark:text-white">
                    {user.global_name || user.username}
                  </h1>
                  {user.isVip ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      <span>VIP Zákazník</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-400 text-[10px] font-medium">
                      Bez role
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
                Discord účet propojen
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Discord Role
              </span>
              <p className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 flex items-center gap-1.5">
                {user.isVip ? (
                  <>
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-500">VIP Zákazník</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-500">Bez VIP role</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {user.isVip
                  ? "Aktivní VIP výhody a přednostní přístup"
                  : "Role VIP nebyla na Discordu nalezena"}
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
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Ověřuji role..." : "Zkontrolovat VIP roli z Discordu"}</span>
            </button>

            <Link href="/parfemy" className="w-full sm:w-auto">
              <Button size="lg" className="w-full font-bold text-xs uppercase tracking-wider">
                <span>Přejít do nabídky</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* If unauthenticated: Login Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main login card */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 shadow-xl space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] text-xs font-bold uppercase tracking-wider">
                <DiscordIcon className="h-3.5 w-3.5" />
                <span>Komunitní účet</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
                Přihlášení přes Discord
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Přihlaste se svým Discord účtem. Pokud máte na našem serveru roli <strong>VIP Customer</strong>, získáte automaticky status VIP na webu i přednostní přístup k dropům.
              </p>
            </div>

            {errorParam && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                <strong>Chyba při přihlašování:</strong> {errorParam}
              </div>
            )}

            {successParam && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
                Úspěšně jste se přihlásili přes Discord!
              </div>
            )}

            {/* Primary Action Button */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={login}
                className="w-full py-4 px-6 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.99] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
              >
                <DiscordIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Pokračovat přes Discord</span>
                <ArrowRight className="h-4 w-4 opacity-80 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[11px] text-center text-neutral-400">
                Bezpečné OAuth2 přihlášení. Nezískáme vaše heslo ani soukromé zprávy.
              </p>
            </div>

            {/* Dev / Test mode toggle */}
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
              <button
                type="button"
                onClick={() => setShowDevOptions(!showDevOptions)}
                className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 underline"
              >
                {showDevOptions ? "Skrýt testovací přihlášení" : "Rychlé testovací přihlášení (Vývoj)"}
              </button>

              {showDevOptions && (
                <div className="mt-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3 text-left">
                  <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    Otestujte chování s rolí a bez role:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => testLogin("VIP_Zakaznik", true)}
                      className="py-2.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Crown className="h-3.5 w-3.5" />
                      <span>Test s VIP rolí</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => testLogin("Bezny_Uzivatel", false)}
                      className="py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Test bez role</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Perks side column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Systém rolí pro CzechBuy
              </h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                      VIP role na Discordu = VIP na webu
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                      Pokud máte na serveru roli VIP Customer, web vám automaticky aktivuje VIP přístup a označení.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                      Běžný uživatel bez VIP role
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                      Uživatelé bez VIP role nemají žádný VIP odznak a nakupují ve standardním režimu.
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
                  <span>Připojit se na náš Discord server</span>
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
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PrihlaseniContent />
    </Suspense>
  );
}
