"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCategoryStatus } from "@/lib/use-categories";

export function CategoryTiles() {
  const { status } = useCategoryStatus();

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">
              Kolekce CzechBuy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
              Vyberte si kategorii
            </h2>
          </div>
          <Link
            href="/katalog"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white hover:opacity-70 transition-opacity"
          >
            <span>Všechny parfémy</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category 1: Parfémy */}
          <Link
            href="/katalog"
            className="group relative h-[390px] sm:h-[420px] rounded-3xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-b from-emerald-950/70 via-neutral-950 to-neutral-950 border border-emerald-500/25 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-500 block"
          >
            {/* Ambient luxury lighting */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/35 transition-all duration-700" />
            <div className="absolute top-1/3 -left-20 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-end">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md border ${
                status.parfemy
                  ? "bg-emerald-600 text-white border-emerald-400/30"
                  : "bg-amber-600 text-white border-amber-400/30"
              }`}>
                <Sparkles className="h-2.5 w-2.5" />
                <span>{status.parfemy ? "Aktivní katalog" : "Coming Soon"}</span>
              </span>
            </div>

            <div className="relative z-10 text-white">
              <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-semibold">
                Prémiová selekce
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white tracking-tight">
                Parfémy
              </h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-xs leading-relaxed font-light">
                Ikonické i niche vůně pro ženy a muže od renomovaných světových parfumérů.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 border-b border-emerald-400/60 pb-0.5 group-hover:gap-3 transition-all">
                <span>{status.parfemy ? "Objevit nabídku" : "Zobrazit podrobnosti"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>

          {/* Category 2: Oblečení */}
          <Link
            href="/obleceni"
            className="group relative h-[390px] sm:h-[420px] rounded-3xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-b from-rose-950/70 via-neutral-950 to-neutral-950 border border-rose-500/25 shadow-xl hover:shadow-2xl hover:border-rose-500/50 transition-all duration-500 block"
          >
            {/* Ambient street/fashion lighting */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/25 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/35 transition-all duration-700" />
            <div className="absolute top-1/3 -left-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-end">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md border ${
                status.obleceni
                  ? "bg-emerald-600 text-white border-emerald-400/30"
                  : "bg-rose-600 text-white border-rose-400/30"
              }`}>
                <Sparkles className="h-2.5 w-2.5" />
                <span>{status.obleceni ? "Aktivní katalog" : "Coming Soon"}</span>
              </span>
            </div>

            <div className="relative z-10 text-white">
              <span className="text-[11px] uppercase tracking-widest text-rose-400 font-semibold">
                Móda & Streetwear
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white tracking-tight">
                Oblečení
              </h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-xs leading-relaxed font-light">
                Limitované dropy, prémiový streetwear a kurátorský výběr evropských módních značek.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300 border-b border-rose-400/60 pb-0.5 group-hover:gap-3 transition-all">
                <span>{status.obleceni ? "Objevit nabídku" : "Zobrazit podrobnosti"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>

          {/* Category 3: Boty */}
          <Link
            href="/boty"
            className="group relative h-[390px] sm:h-[420px] rounded-3xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-b from-cyan-950/70 via-neutral-950 to-neutral-950 border border-cyan-500/25 shadow-xl hover:shadow-2xl hover:border-cyan-500/50 transition-all duration-500 block"
          >
            {/* Ambient sneakerhead lighting */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/35 transition-all duration-700" />
            <div className="absolute top-1/3 -left-20 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/30 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-end">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md border ${
                status.boty
                  ? "bg-emerald-600 text-white border-emerald-400/30"
                  : "bg-cyan-600 text-white border-cyan-400/30"
              }`}>
                <Sparkles className="h-2.5 w-2.5" />
                <span>{status.boty ? "Aktivní katalog" : "Coming Soon"}</span>
              </span>
            </div>

            <div className="relative z-10 text-white">
              <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-semibold">
                Sneakers & Obuv
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white tracking-tight">
                Boty & Tenisky
              </h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-xs leading-relaxed font-light">
                Limitované edice tenisek, deadstock releasy a nadčasová obuv pro každou příležitost.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300 border-b border-cyan-400/60 pb-0.5 group-hover:gap-3 transition-all">
                <span>{status.boty ? "Objevit nabídku" : "Zobrazit podrobnosti"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>

          {/* Category 4: Digital */}
          <Link
            href="/digital"
            className="group relative h-[390px] sm:h-[420px] rounded-3xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-b from-purple-950/70 via-neutral-950 to-neutral-950 border border-purple-500/25 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all duration-500 block"
          >
            {/* Ambient cyber lighting matching user screenshot */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/25 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/35 transition-all duration-700" />
            <div className="absolute top-1/3 -left-20 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/30 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-end">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md border ${
                status.digital
                  ? "bg-emerald-600 text-white border-emerald-400/30"
                  : "bg-purple-600 text-white border-purple-400/30"
              }`}>
                <Sparkles className="h-2.5 w-2.5" />
                <span>{status.digital ? "Aktivní katalog" : "Coming Soon"}</span>
              </span>
            </div>

            <div className="relative z-10 text-white">
              <span className="text-[11px] uppercase tracking-widest text-purple-300 font-semibold">
                Digitální sekce
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white tracking-tight">
                Digital
              </h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-xs leading-relaxed font-light">
                Herní klíče, licence, předplatné a vouchery s okamžitým doručením.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300 border-b border-purple-400/60 pb-0.5 group-hover:gap-3 transition-all">
                <span>{status.digital ? "Objevit nabídku" : "Zobrazit podrobnosti"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
