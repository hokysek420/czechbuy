"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  MessageSquarePlus,
  ExternalLink,
  MessageSquare,
  Lock,
} from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";
import { Button } from "@/components/ui/button";
import { DiscordTicketModal } from "@/components/shop/discord-ticket-modal";

function PrihlaseniContent() {
  const { user, isLoggedIn, login, logout, testLogin, refreshVipStatus } = useDiscordAuth();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const successParam = searchParams.get("success");

  const [customTestName, setCustomTestName] = useState("");
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isOwner = Boolean(
    user?.isOwner ||
    user?.id === "1492628172611518504" ||
    user?.username === "hokysek" ||
    user?.roles?.includes("1567522100523040914")
  );
  const isAdmin = Boolean(isOwner || user?.isAdmin);
  const isMod = Boolean(isOwner || user?.isMod || user?.roles?.includes("1567522104293855253"));
  const isVip = Boolean(isOwner || user?.isVip || user?.roles?.includes("1567522107393581176"));

  const displayBadges =
    user?.roleBadges && user.roleBadges.length > 0
      ? user.roleBadges
      : isOwner
      ? [
          { id: "owner", name: "Owner", color: "#f43f5e" },
          { id: "1567522100523040914", name: "Founder / Admin", color: "#6366f1" },
          { id: "1567522107393581176", name: "VIP Customer", color: "#f59e0b" },
          { id: "1567522110648221797", name: "CzechBuy Fam", color: "#a855f7" },
        ]
      : [];

  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const fetchUserTickets = async () => {
    if (!user?.id) return;
    setIsLoadingTickets(true);
    try {
      const res = await fetch(`/api/discord/tickets?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        }
      }
    } catch {} finally {
      setIsLoadingTickets(false);
    }
  };

  // Auto-sync roles and tickets on page load
  useEffect(() => {
    if (user?.id) {
      refreshVipStatus();
      fetchUserTickets();
    }
  }, [user?.id]);

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
                {(isVip || isOwner) && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-neutral-950 font-bold text-[10px] shadow">
                    <Crown className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-neutral-950 dark:text-white">
                    {user.global_name || user.username}
                  </h1>
                  {isOwner ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      <span>Owner</span>
                    </span>
                  ) : isAdmin ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Admin</span>
                    </span>
                  ) : isMod ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Moderátor</span>
                    </span>
                  ) : isVip ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      <span>VIP Zákazník</span>
                    </span>
                  ) : user.roleName ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                      {user.roleName}
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

          {/* Owner direct admin panel access card */}
          {(isOwner || isAdmin) && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-transparent border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span>Majitel Discord Serveru & E-shopu</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">Owner</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Máte neomezený přístup do administrace, správy produktů, objednávek i kategorií.
                  </p>
                </div>
              </div>
              <Link href="/interni-portal-8f2a9x/sprava">
                <Button className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  <span>Vstoupit do administrace</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          )}

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
                Discord Role na Serveru
              </span>
              <p className="text-base font-extrabold text-neutral-900 dark:text-white mt-1 flex items-center gap-1.5">
                {isOwner ? (
                  <>
                    <Crown className="h-4 w-4 text-rose-500" />
                    <span className="text-rose-500">Owner</span>
                  </>
                ) : isAdmin ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    <span className="text-indigo-500">Admin</span>
                  </>
                ) : isMod ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-cyan-500" />
                    <span className="text-cyan-500">Moderátor</span>
                  </>
                ) : isVip ? (
                  <>
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-500">VIP Zákazník</span>
                  </>
                ) : user.roleName ? (
                  <>
                    <User className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-400">{user.roleName}</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-500">Bez role</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {isOwner
                  ? "Vlastník serveru a plný přístup do administrace"
                  : isVip
                  ? "Aktivní VIP výhody a prioritní Discord podpora"
                  : user.roleName
                  ? "Oficiální role ze serveru CzechBuy Fam"
                  : "Bez VIP role na Discordu"}
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

          {/* Active Discord roles badges showcase */}
          {displayBadges.length > 0 && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                Přiřazené role na Discord serveru CzechBuy Fam:
              </span>
              <div className="flex flex-wrap gap-2">
                {displayBadges.map((rb) => (
                  <span
                    key={rb.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                    style={{
                      borderColor: `${rb.color || "#5865F2"}40`,
                      backgroundColor: `${rb.color || "#5865F2"}15`,
                      color: rb.color || "#5865F2",
                    }}
                  >
                    <span>●</span>
                    <span>{rb.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Connected Ticket System Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#5865F2]/10 via-[#5865F2]/5 to-transparent border border-[#5865F2]/25 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shrink-0 shadow-md">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>Zákaznická Podpora & Discord Tickety</span>
                    {isOwner ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30">Owner Priority</span>
                    ) : isVip ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">VIP Priorita</span>
                    ) : null}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Máte dotaz k objednávce nebo sortimentu? Založte ticket propojený přímo s naším týmem na Discordu.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition shrink-0"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span>Nový ticket</span>
              </button>
            </div>

            {/* List of active tickets for this user if any */}
            {tickets.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-[#5865F2]/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Vaše aktivní tickety na Discordu ({tickets.length}):
                </span>
                <div className="space-y-2">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                            #{t.name}
                          </span>
                        </div>
                        {t.topic && (
                          <p className="text-[11px] text-neutral-500 truncate mt-0.5 max-w-[280px] sm:max-w-md">
                            {t.topic}
                          </p>
                        )}
                      </div>
                      <a
                        href={t.discordUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white transition text-xs font-bold shrink-0"
                      >
                        <span>Otevřít na Discordu</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-neutral-400 italic">
                Zatím nemáte žádný otevřený ticket. Nový dotaz můžete kdykoliv založit kliknutím na tlačítko výše.
              </p>
            )}
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
                Přihlaste se svým Discord účtem. Pokud máte na našem serveru roli <strong>VIP Customer</strong>, získáte automaticky status VIP na webu, slevy i prioritní Discord podporu.
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
                      onClick={() => testLogin("hokysek", "owner")}
                      className="py-2.5 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Crown className="h-3.5 w-3.5" />
                      <span>Test: Owner (@hokysek)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => testLogin("VIP_Zakaznik", "vip")}
                      className="py-2.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Crown className="h-3.5 w-3.5" />
                      <span>Test: VIP Zákazník</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => testLogin("Moderator_CZ", "mod")}
                      className="py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Test: Moderátor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => testLogin("Bezny_Uzivatel", "none")}
                      className="py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Test: Bez role</span>
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

      {/* Discord Support Ticket Creation Modal */}
      <DiscordTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onTicketCreated={() => fetchUserTickets()}
      />
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
