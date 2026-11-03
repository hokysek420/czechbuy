import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";

export function Footer() {
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
