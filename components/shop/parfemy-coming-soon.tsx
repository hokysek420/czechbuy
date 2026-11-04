"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Clock,
  Flame,
  Award,
} from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";
import { Button } from "@/components/ui/button";

export function ParfemyComingSoon() {
  const discordInvite =
    process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy";

  const upcomingFeatures = [
    {
      icon: Flame,
      title: "Niche Vůně & Extrakty",
      description: "Exkluzivní vonné esence (Baccarat Rouge 540, Aventus, Tobacco Vanille, Santal 33) s nejvyšší koncentrací vonných olejů.",
      badge: "Niche & Luxury",
    },
    {
      icon: Award,
      title: "Ikonické Designérské Flakony",
      description: "Originální balení z ověřené evropské distribuce od módních domů Christian Dior, Chanel, Yves Saint Laurent a Armani.",
      badge: "Ikonické klasiky",
    },
    {
      icon: Sparkles,
      title: "Discovery Sety & Vzorky",
      description: "Možnost vyzkoušet několik vzorků prémiových parfémů před zakoupením plného flakonu s kreditem na nákup.",
      badge: "Discovery Sety",
    },
    {
      icon: ShieldCheck,
      title: "100% Garance Autenticity",
      description: "Každý jednotlivý flakon prochází přísnou kontrolou šarže, batch kódu a celistvosti balení s garancí vrácení peněz.",
      badge: "100% Originál",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-400 mb-8 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Domů
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
          Parfémy (Coming Soon)
        </span>
      </nav>

      {/* Hero section matching user screenshot */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white border border-neutral-800 p-8 sm:p-14 lg:p-20 shadow-2xl mb-16">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Coming Soon • Již brzy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
            CzechBuy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400">Parfémy</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
            Připravujeme pro vás kurátorský výběr originálních niche i designérských vůní od předních světových parfumérů (Dior, Creed, Tom Ford, Chanel). Každý flakon prochází přísnou kontrolou autenticity s garancí 100% originality.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href={discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#5865F2]/20"
            >
              <DiscordIcon className="h-4 w-4" />
              <span>Oznámení dropů na Discordu</span>
            </a>

            <Link href="/">
              <Button
                variant="outline"
                className="border-neutral-700 text-white hover:bg-neutral-900 text-xs uppercase tracking-wider font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                <span>Zpět na hlavní stránku</span>
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-neutral-800 flex flex-wrap gap-6 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>100% originální flakony</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Zakázkový import (12–16 dní)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Spuštění: Sezóna 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature showcase grid */}
      <div className="mb-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">
            Co chystáme
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-1">
            Plánovaný sortiment sekce Parfémy
          </h2>
          <p className="text-xs text-neutral-500 mt-2">
            Pečlivě vybírané niche a designérské parfémy pro ženy i muže.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingFeatures.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 flex flex-col justify-between hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-colors shadow-xs"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {item.badge}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Stav:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Příprava kolekce
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Callout */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
            Sháníte konkrétní niche parfém nebo flakon?
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-lg">
            Napište nám na náš oficiální Discord. Rádi ověříme dostupnost u našich certifikovaných evropských dodavatelů.
          </p>
        </div>
        <a
          href={discordInvite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-wider hover:opacity-85 transition shrink-0"
        >
          <span>Navrhnout parfém</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
