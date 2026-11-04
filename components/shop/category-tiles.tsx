import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, Sparkles } from "lucide-react";

export function CategoryTiles() {
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
          {/* Active Category: Parfémy */}
          <Link
            href="/katalog"
            className="group relative h-96 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block"
          >
            <Image
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80"
              alt="Katalog parfémů"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500 text-white shadow-sm">
                Aktivní katalog
              </span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-xs uppercase tracking-widest text-neutral-300 font-medium">
                Prémiová selekce
              </span>
              <h3 className="text-2xl font-bold mt-1">
                Parfémy
              </h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-xs leading-relaxed">
                Ikonické i niche vůně pro ženy a muže od renomovaných světových parfumérů.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white border-b border-white pb-0.5 group-hover:gap-3 transition-all">
                <span>Objevit nabídku</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>

          {/* Locked Category 1: Oblečení */}
          <div className="relative h-96 rounded-xl overflow-hidden shadow-sm select-none">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
              alt="Móda a oblečení"
              fill
              className="object-cover grayscale-50 filter contrast-90"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Elegant dark overlay */}
            <div className="absolute inset-0 bg-neutral-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                <Lock className="h-5 w-5 text-neutral-300" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-400 text-neutral-950 mb-2">
                Již brzy
              </span>
              <h3 className="text-2xl font-bold text-white">
                Oblečení
              </h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-xs leading-relaxed">
                Připravujeme pro vás kurátorský výběr evropských módních značek a streetwearu.
              </p>
              <div className="mt-4 text-[11px] uppercase tracking-wider text-neutral-400 font-medium border border-neutral-600/60 rounded px-3 py-1.5 bg-black/30">
                Spuštění sekce plánováno
              </div>
            </div>
          </div>

          {/* Locked Category 2: Boty */}
          <div className="relative h-96 rounded-xl overflow-hidden shadow-sm select-none">
            <Image
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
              alt="Obuv a tenisky"
              fill
              className="object-cover grayscale-50 filter contrast-90"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Elegant dark overlay */}
            <div className="absolute inset-0 bg-neutral-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                <Lock className="h-5 w-5 text-neutral-300" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-400 text-neutral-950 mb-2">
                Již brzy
              </span>
              <h3 className="text-2xl font-bold text-white">
                Boty & Tenisky
              </h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-xs leading-relaxed">
                Limitované edice tenisek a nadčasová obuv pro každou příležitost.
              </p>
              <div className="mt-4 text-[11px] uppercase tracking-wider text-neutral-400 font-medium border border-neutral-600/60 rounded px-3 py-1.5 bg-black/30">
                Spuštění sekce plánováno
              </div>
            </div>
          </div>

          {/* New Category: Digital (Coming Soon) */}
          <Link
            href="/digital"
            className="group relative h-96 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block"
          >
            <Image
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
              alt="CzechBuy Digital"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {/* Ambient cyber overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/40 to-neutral-950/20" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-600 text-white shadow-md border border-purple-400/30">
                <Sparkles className="h-2.5 w-2.5" />
                <span>Coming Soon</span>
              </span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-xs uppercase tracking-widest text-purple-300 font-medium">
                Digitální sekce
              </span>
              <h3 className="text-2xl font-bold mt-1 text-white">
                Digital
              </h3>
              <p className="text-xs text-neutral-300 mt-2 max-w-xs leading-relaxed">
                Herní klíče, licence, předplatné a vouchery s okamžitým doručením.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300 border-b border-purple-400/60 pb-0.5 group-hover:gap-3 transition-all">
                <span>Zobrazit podrobnosti</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
