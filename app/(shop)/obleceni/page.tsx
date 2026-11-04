"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Shirt,
  Crown,
  Layers,
  Zap,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  Tag,
} from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";
import { Button } from "@/components/ui/button";
import { CategoryCatalogView } from "@/components/shop/category-catalog-view";

function ObleceniComingSoon() {
  const discordInvite =
    process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy";

  const upcomingFeatures = [
    {
      icon: Shirt,
      title: "Streetwear Dropy",
      description: "Limitované kolekce, hoodies, graphic tee a mikiny od předních evropských a světových streetwearových značek.",
      badge: "Street & Hype",
    },
    {
      icon: Crown,
      title: "Designérská Móda",
      description: "Nadčasové minimalistické střihy z prémiových materiálů od renomovaných módních domů s certifikátem pravosti.",
      badge: "High-End",
    },
    {
      icon: Layers,
      title: "Sezónní Outerwear",
      description: "Kurátorský výběr bund, vest a vrstveného oblečení pro podzimní i jarní sezónu s důrazem na kvalitu.",
      badge: "Sezóna 2026",
    },
    {
      icon: Tag,
      title: "Doplňky & Essentials",
      description: "Čepice, kšiltovky, designové tašky, pásky a šperky, které dokonale podtrhnou váš osobní styl.",
      badge: "Accessories",
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
          Oblečení (Coming Soon)
        </span>
      </nav>

      {/* Hero section */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white border border-neutral-800 p-8 sm:p-14 lg:p-20 shadow-2xl mb-16">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            <span>Coming Soon • Již brzy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
            CzechBuy <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-400">Oblečení</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
            Připravujeme pro vás kurátorský výběr evropského streetwearu, limitovaných dropů a prémiové módy. Každý kus bude procházet pečlivou kontrolou autenticity s garancí 100% originality.
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

            <Link href="/katalog">
              <Button
                variant="outline"
                className="border-neutral-700 text-white hover:bg-neutral-900 text-xs uppercase tracking-wider font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                <span>Zpět do nabídky parfémů</span>
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-neutral-800 flex flex-wrap gap-6 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>100% originální móda</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-rose-400" />
              <span>Ověřená evropská distribuce</span>
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
            Plánovaný sortiment sekce Oblečení
          </h2>
          <p className="text-xs text-neutral-500 mt-2">
            Pečlivě vybírané kousky pro váš každodenní i prémiový styl.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingFeatures.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 flex flex-col justify-between hover:border-rose-500/50 dark:hover:border-rose-500/50 transition-colors shadow-xs"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
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
            Máte oblíbenou značku nebo konkrétní drop?
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-lg">
            Napište nám do našeho Discordu v sekci námětů na oblečení. Hlasujte o značkách, které naskladníme jako první.
          </p>
        </div>
        <a
          href={discordInvite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-wider hover:opacity-85 transition shrink-0"
        >
          <span>Navrhnout značku</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export default function ObleceniPage() {
  return (
    <CategoryCatalogView
      category="obleceni"
      title="CzechBuy Oblečení"
      subtitle="Kurátorský výběr evropského streetwearu, limitovaných dropů a prémiové módy s garancí 100% originality."
      badgeText="Streetwear & Móda"
      accentColor="rose"
      emptyTitle="Kolekce oblečení se připravuje"
      emptyDescription="Momentálně připravujeme naskladnění nového streetwearu. Přidejte kousky v administraci nebo zkontrolujte nabídku brzy."
      comingSoonComponent={<ObleceniComingSoon />}
    />
  );
}
