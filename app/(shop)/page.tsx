"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle, Shield, Award } from "lucide-react";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { getInitialProducts } from "@/lib/admin-store";
import { ProductCard } from "@/components/shop/product-card";
import { CategoryTiles } from "@/components/shop/category-tiles";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  useEffect(() => {
    setProducts(getInitialProducts());
  }, []);

  const featuredProducts = products.filter((p) => p.featured);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner (Zalando High Fashion Editorial style) */}
      <section className="relative overflow-hidden bg-neutral-900 text-white min-h-[580px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=2000&q=85"
            alt="CzechBuy luxusní parfémy"
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-neutral-200 tracking-wide font-medium">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Nová sezónní selekce 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Vůně, která definuje <span className="underline decoration-neutral-500 underline-offset-8">váš styl</span>.
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 max-w-lg leading-relaxed font-light">
              Objevte kurátorskou kolekci originálních ikonických i niche vůní od renomovaných domů Christian Dior, Chanel, Tom Ford či Creed.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/katalog">
                <Button size="lg" className="bg-white text-neutral-950 hover:bg-neutral-200 font-semibold px-8">
                  Prozkoumat parfémy
                </Button>
              </Link>
              <Link href="/katalog?gender=unisex">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium">
                  Niche kolekce
                </Button>
              </Link>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-wrap gap-6 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>100% originální flakony</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Expedice v den objednání</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-400" />
                <span>Záruka vrácení 14 dnů</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid (Perfumes active, Clothing and Shoes 'Coming Soon') */}
      <CategoryTiles />

      {/* Featured Perfumes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">
              Bestsellery
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
              Nejžádanější parfémy
            </h2>
          </div>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white hover:opacity-75 transition-opacity"
          >
            <span>Celá nabídka ({INITIAL_PRODUCTS.length})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial Niche Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative rounded-2xl overflow-hidden bg-neutral-950 text-white p-8 sm:p-14">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full mb-4">
              Niche Parfumérství
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Maison Francis Kurkdjian & Tom Ford
            </h3>
            <p className="mt-3 text-neutral-300 text-sm leading-relaxed">
              Exkluzivní vonné esence pro ty, kteří hledají neopakovatelnou signaturu. Šafrán, ambra, vzácné dřeviny a madagaskarská vanilka v nejvyšší koncentraci.
            </p>
            <div className="mt-6">
              <Link href="/katalog?gender=unisex">
                <Button className="bg-white text-neutral-950 hover:bg-neutral-200 font-semibold text-xs">
                  Prohlédnout Niche parfémy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">
                Čerstvě naskladněno
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
                Novinky v nabídce
              </h2>
            </div>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white hover:opacity-75 transition-opacity"
            >
              <span>Všechny novinky</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Brand Logos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <p className="text-center text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-6">
          Zastoupené prémiové značky
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all">
          <span className="font-serif text-lg tracking-widest font-bold">DIOR</span>
          <span className="font-sans text-lg tracking-widest font-black">CHANEL</span>
          <span className="font-sans text-base tracking-widest font-semibold">TOM FORD</span>
          <span className="font-serif text-base tracking-wider italic">CREED</span>
          <span className="font-sans text-base tracking-widest font-medium">YVES SAINT LAURENT</span>
          <span className="font-serif text-base tracking-wider">GIORGIO ARMANI</span>
        </div>
      </section>
    </div>
  );
}
