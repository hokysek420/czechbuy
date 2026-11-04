import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Footprints,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkle,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Boty & Tenisky (Coming Soon) | CzechBuy",
  description: "Připravujeme nabídku limitovaných tenisek, ikonických siluet a prémiové obuvi s garancí 100% originality a autenticity.",
};

export default function BotyPage() {
  const discordInvite =
    process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy";

  const upcomingFeatures = [
    {
      icon: Flame,
      title: "Limitované Tenisky",
      description: "Deadstock releasy, exkluzivní kolaborace a vyhledávané siluety, které v běžných obchodech neseženete.",
      badge: "Hype & Deadstock",
    },
    {
      icon: Footprints,
      title: "Klasické & Lifestyle Siluety",
      description: "Nadčasové retro ikony a moderní tenisky pro každodenní nošení s maximálním komfortem.",
      badge: "Everyday Classics",
    },
    {
      icon: ShieldCheck,
      title: "100% Kontrola Autenticity",
      description: "Každý jednotlivý pár prochází důkladnou manuální kontrolou materiálů, švů, krabice a detailů před odesláním.",
      badge: "Verified Authentic",
    },
    {
      icon: Sparkles,
      title: "Péče & Doplňky pro Tenisky",
      description: "Profesionální čistící pěny, prémiové kartáče, ochranné impregnace a napínáky pro dokonalou kondici vaší obuvi.",
      badge: "Sneaker Care",
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
          Boty & Tenisky (Coming Soon)
        </span>
      </nav>

      {/* Hero section with sneakerhead cyan/blue ambient lighting */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white border border-neutral-800 p-8 sm:p-14 lg:p-20 shadow-2xl mb-16">
        {/* Background ambient lighting */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Coming Soon • Již brzy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
            CzechBuy <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400">Sneakers</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
            Připravujeme pro vás nabídku originálních tenisek a prémiové obuvi. Každý pár v novém, nezkoušeném stavu (Deadstock) s dvojitým ověřením pravosti přímo do vašich rukou.
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
              <span>Dvojitá kontrola autenticity</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Pouze 100% Deadstock (DS) stav</span>
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
            Plánovaný sortiment sekce Boty & Sneakers
          </h2>
          <p className="text-xs text-neutral-500 mt-2">
            Vybrané siluety pro sběratele i každodenní nošení.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingFeatures.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 flex flex-col justify-between hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-colors shadow-xs"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
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
                    Příprava nabídky
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
            Sháníte konkrétní model tenisek ve své velikosti?
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-lg">
            Napište nám do našeho Discord serveru v sekci pro sneakers. Sledujeme vaše přání a naskladňujeme siluety podle poptávky komunity.
          </p>
        </div>
        <a
          href={discordInvite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-wider hover:opacity-85 transition shrink-0"
        >
          <span>Navrhnout siluetu</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
