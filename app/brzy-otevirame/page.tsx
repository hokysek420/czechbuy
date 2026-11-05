"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  PackageCheck,
  Crown,
  Bell,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { DiscordIcon, InstagramIcon } from "@/components/ui/social-icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useDiscordAuth } from "@/lib/discord-auth-context";
import {
  getCountdownConfig,
  CountdownConfig,
  DEFAULT_COUNTDOWN_CONFIG,
} from "@/lib/countdown-settings";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export default function ComingSoonCountdownPage() {
  const [config, setConfig] = useState<CountdownConfig>(DEFAULT_COUNTDOWN_CONFIG);
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 17,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false,
  });
  const [mounted, setMounted] = useState(false);
  const { user: discordUser, isLoggedIn: isDiscordLoggedIn } = useDiscordAuth();

  // Newsletter state
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    const activeConfig = getCountdownConfig();
    setConfig(activeConfig);

    const calculateTime = () => {
      const targetTime = new Date(activeConfig.targetDate).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isComplete: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isComplete: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Zadejte prosím platnou e-mailovou adresu.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMessage(data.error || "Došlo k chybě při registraci e-mailu.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Spojení se nezdařilo. Zkuste to prosím za chvíli.");
    }
  };

  const padZero = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
      {/* Top Header */}
      <header className="w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
              Czech<span className="font-light text-neutral-400">Buy</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 ml-2">
              Privátní přístup
            </span>
          </div>

          <div className="flex items-center gap-3">
            {mounted && isDiscordLoggedIn && discordUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/prihlaseni"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-xs font-semibold text-[#5865F2] dark:text-[#7983F5] transition"
                >
                  <img
                    src={discordUser.avatarUrl}
                    alt={discordUser.username}
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="hidden sm:inline">@{discordUser.username}</span>
                  {discordUser.isVip && (
                    <span className="text-[10px] bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 px-1.5 py-0.2 rounded-full font-bold">
                      VIP
                    </span>
                  )}
                </Link>
                {discordUser.isVip && (
                  <Link
                    href="/parfemy"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-bold shadow-xs transition"
                  >
                    <span>Vstoupit</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/prihlaseni"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold shadow-xs transition active:scale-95"
              >
                <DiscordIcon className="h-3.5 w-3.5" />
                <span>Discord Login</span>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Countdown & Hero Content */}
      <main className="flex-1 flex items-center justify-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full mx-auto text-center space-y-10">
          {/* Micro Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">{config.badgeText}</span>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-[11px] font-mono text-neutral-500">
              {config.targetDate.replace("T", " ")}
            </span>
          </div>

          {/* Main Titles */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.1]">
              {config.headline}
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
              {config.subtext}
            </p>
          </div>

          {/* Live Countdown Display */}
          <div className="pt-2">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto">
              {/* Days */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center shadow-xs">
                <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-neutral-950 dark:text-white">
                  {mounted ? padZero(timeLeft.days) : "18"}
                </span>
                <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Dní
                </span>
              </div>

              {/* Hours */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center shadow-xs">
                <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-neutral-950 dark:text-white">
                  {mounted ? padZero(timeLeft.hours) : "00"}
                </span>
                <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Hodin
                </span>
              </div>

              {/* Minutes */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center shadow-xs">
                <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-neutral-950 dark:text-white">
                  {mounted ? padZero(timeLeft.minutes) : "00"}
                </span>
                <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Minut
                </span>
              </div>

              {/* Seconds */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center shadow-xs">
                <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-neutral-950 dark:text-white">
                  {mounted ? padZero(timeLeft.seconds) : "00"}
                </span>
                <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Sekund
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Stanovený termín zahájení: <strong>21. listopadu 2026 ve 20:00 SEČ</strong>
            </p>

            {/* Prominent VIP Discord Login Action */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              {mounted && isDiscordLoggedIn && discordUser ? (
                discordUser.isVip ? (
                  <Link
                    href="/parfemy"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition active:scale-[0.98]"
                  >
                    <span>Vstoupit do obchodu (VIP Přístup)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                    <span>Přihlášen jako <strong>@{discordUser.username}</strong> (bez VIP role)</span>
                    <Link href="/prihlaseni" className="text-[#5865F2] font-semibold hover:underline">
                      Zkontrolovat profil →
                    </Link>
                  </div>
                )
              ) : (
                <Link
                  href="/prihlaseni"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <DiscordIcon className="h-4 w-4" />
                  <span>Přihlásit se přes Discord</span>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full ml-1">VIP</span>
                </Link>
              )}
            </div>
          </div>

          {/* Email Notification Subscription (Upozornit na spuštění) */}
          <div className="max-w-md mx-auto pt-4 space-y-3">
            <div className="text-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Upozornit na spuštění
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Získejte okamžité upozornění v okamžiku spuštění e-shopu a přednostní přístup ke skladovým zásobám.
              </p>
            </div>

            {status === "success" ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Děkujeme! Jakmile CzechBuy spustíme, budete mezi prvními.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Zadejte váš e-mail..."
                    disabled={status === "loading"}
                    className="flex-1 text-xs py-3 px-4 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 py-3 px-6 rounded-md font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>{status === "loading" ? "Ukládám..." : "Odebírat"}</span>
                  </button>
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-600 dark:text-red-400 text-left pl-1">
                    {errorMessage}
                  </p>
                )}
              </form>
            )}

            
            {/* VIP Discord Access Card */}
            <div className="pt-2">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#5865F2]/10 via-[#5865F2]/5 to-transparent border border-[#5865F2]/25 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shrink-0 shadow-md">
                    <DiscordIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                        VIP Přednostní přístup pro CzechBuy Fam
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5865F2] text-white font-bold">
                        Early Access
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {mounted && isDiscordLoggedIn && discordUser
                        ? discordUser.isVip
                          ? `Jsi přihlášen jako @${discordUser.username} s aktivní VIP rolí. Máš přednostní přístup.`
                          : `Jsi přihlášen jako @${discordUser.username}. Pro přednostní vstup před otevřením je potřeba mít VIP roli na Discordu.`
                        : "Přihlas se svým Discord účtem. Pokud máš na serveru VIP roli, odemkne se ti přednostní vstup."}
                    </p>
                  </div>
                </div>

                {mounted && isDiscordLoggedIn ? (
                  discordUser?.isVip ? (
                    <Link
                      href="/parfemy"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs shadow-md hover:opacity-90 transition shrink-0"
                    >
                      <span>Vstoupit do obchodu</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/prihlaseni"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs transition shrink-0"
                    >
                      <span>Můj profil</span>
                    </Link>
                  )
                ) : (
                  <Link
                    href="/prihlaseni"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-md hover:shadow-lg transition shrink-0"
                  >
                    <DiscordIcon className="h-3.5 w-3.5" />
                    <span>Přihlásit přes Discord</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Discord & Instagram Community CTA under newsletter */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] text-xs font-semibold transition group"
              >
                <DiscordIcon className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span>Připoj se k CzechBuy Fam na Discordu</span>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </a>

              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/czech.buy/"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#E1306C] text-xs font-medium transition"
              >
                <InstagramIcon className="h-3.5 w-3.5 text-[#E1306C]" />
                <span>@czech.buy</span>
              </a>
            </div>
          </div>

          {/* 3 Core Trust Pillars */}
          <div className="pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                100% Originální šarže
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Veškeré flakony pocházejí výhradně z certifikované evropské sítě oficiálních dodavatelů.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                <PackageCheck className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Zakázkový import
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Garantujeme maximální čerstvost skladových šarží díky přímé návaznosti na centrální sklady.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Prémiový výběr
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Vybrané portfolio vůní od Dior, Creed, Tom Ford, Maison Margiela a niche ikon.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-200/80 dark:border-neutral-800/80 py-6 bg-white dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>CzechBuy © 2026. Všechna práva vyhrazena.</p>

          <div className="flex items-center gap-4">
            <Link
              href="/interni-portal-8f2a9x/login"
              className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              <Lock className="h-3 w-3" />
              <span>Vstup pro správce</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
