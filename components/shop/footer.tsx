import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Award, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { DiscordIcon, InstagramIcon, TikTokIcon } from "@/components/ui/social-icons";

export function Footer() {
  const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy";
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/czech.buy/";
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs transition-colors">
      {/* Trust Badges Bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center p-3">
              <Award className="h-6 w-6 text-neutral-900 dark:text-white mb-2" />
              <h4 className="font-semibold text-neutral-900 dark:text-white text-xs">
                100% originální parfémy
              </h4>
              <p className="text-[11px] text-neutral-500 mt-1">
                Výhradně certifikovaná evropská distribuce
              </p>
            </div>
            <div className="flex flex-col items-center p-3">
              <Truck className="h-6 w-6 text-neutral-900 dark:text-white mb-2" />
              <h4 className="font-semibold text-neutral-900 dark:text-white text-xs">
                Zakázkový import (12–16 dní)
              </h4>
              <p className="text-[11px] text-neutral-500 mt-1">
                Doprava zdarma u objednávek nad 2 000 Kč
              </p>
            </div>
            <div className="flex flex-col items-center p-3">
              <RotateCcw className="h-6 w-6 text-neutral-900 dark:text-white mb-2" />
              <h4 className="font-semibold text-neutral-900 dark:text-white text-xs">
                14 dní na vrácení
              </h4>
              <p className="text-[11px] text-neutral-500 mt-1">
                Zákonná lhůta pro neporušené zboží
              </p>
            </div>
            <div className="flex flex-col items-center p-3">
              <ShieldCheck className="h-6 w-6 text-neutral-900 dark:text-white mb-2" />
              <h4 className="font-semibold text-neutral-900 dark:text-white text-xs">
                Bezpečné platby
              </h4>
              <p className="text-[11px] text-neutral-500 mt-1">
                Šifrované platby kartou, Apple Pay a dobírka
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xl font-black text-neutral-950 dark:text-white">
                Czech<span className="text-neutral-500 dark:text-neutral-400 font-light">Buy</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Prémiový český e-shop zaměřený na originální pánské, dámské a niche parfémy od renomovaných světových domů.
            </p>
            <div className="mt-4 text-[11px] text-neutral-500 space-y-1">
              <p>CzechBuy s.r.o.</p>
              <p>IČO: 19842511, DIČ: CZ19842511</p>
              <p>E-mail: podpora@czechbuy.cz</p>
              <p>Po–Pá: 9:00 – 17:00</p>
            </div>

            {/* Verified Social Channels */}
            <div className="mt-5 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2.5">
                Oficiální kanály
              </span>
              <div className="flex items-center gap-3">
                {/* Verified Instagram Link */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-white hover:text-[#E1306C] dark:hover:text-[#E1306C] hover:border-[#E1306C]/40 transition text-xs font-semibold shadow-2xs group"
                  title="Sledovat CzechBuy na Instagramu"
                >
                  <InstagramIcon className="h-4 w-4 text-[#E1306C] group-hover:scale-110 transition-transform" />
                  <span>czech.buy</span>
                  <CheckCircle2 className="h-3 w-3 text-sky-500 shrink-0 fill-sky-500/10" />
                </a>

                {/* TikTok - Inactive / Již brzy */}
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 text-xs cursor-not-allowed select-none"
                  title="TikTok profil CzechBuy připravujeme"
                >
                  <TikTokIcon className="h-3.5 w-3.5 opacity-40" />
                  <span className="text-[11px]">TikTok</span>
                  <span className="text-[9px] bg-neutral-300/60 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.2 rounded font-medium">
                    Již brzy
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-neutral-900 dark:text-white mb-4">
              Kategorie
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/katalog"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Všechny parfémy
                </Link>
              </li>
              <li>
                <Link
                  href="/katalog?gender=panske"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Pánské parfémy
                </Link>
              </li>
              <li>
                <Link
                  href="/katalog?gender=damske"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Dámské vůně
                </Link>
              </li>
              <li>
                <Link
                  href="/katalog?gender=unisex"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Unisex & Niche
                </Link>
              </li>
              <li className="pt-2 text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
                Oblečení (Připravujeme)
              </li>
              <li className="text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
                Obuv (Připravujeme)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-neutral-900 dark:text-white mb-4">
              Zákaznický servis
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Často kladené dotazy (FAQ)
                </Link>
              </li>
              <li>
                <Link
                  href="/faq#doprava"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Způsoby doručení a platby
                </Link>
              </li>
              <li>
                <Link
                  href="/faq#vraceni"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Vrácení zboží do 14 dnů
                </Link>
              </li>
              <li>
                <Link
                  href="/faq#reklamace"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Reklamační řád
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-neutral-900 dark:text-white mb-4">
              Právní ochrana & Podmínky
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/obchodni-podminky"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Obchodní podmínky
                </Link>
              </li>
              <li>
                <Link
                  href="/ochrana-udaju"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Zásady zpracování osobních údajů (GDPR)
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Informace o odstoupení od smlouvy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Community Banner: Připoj se k CzechBuy Fam na Discordu */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shrink-0 shadow-sm">
              <DiscordIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-bold text-neutral-900 dark:text-white text-xs">
                  Připoj se k CzechBuy Fam na Discordu
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                VIP přístup k limitovaným parfémům a streetwear dropům • Živý tracking objednávek • Komunitní chat
              </p>
            </div>
          </div>

          <a
            href={discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-sm hover:shadow-md transition active:scale-[0.98] shrink-0"
          >
            <DiscordIcon className="h-4 w-4" />
            <span>Připojit se na Discord</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500 text-[11px]">
          <p>© 2026 CzechBuy s.r.o. Všechna práva vyhrazena.</p>
          <p className="flex items-center gap-3">
            <span>Vyrobeno v České republice</span>
            <span>•</span>
            <span>Český občanský zákoník (č. 89/2012 Sb.)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
