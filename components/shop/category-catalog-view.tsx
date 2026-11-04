"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  PackageSearch,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Shirt,
  Footprints,
  Gamepad2,
  LucideIcon,
} from "lucide-react";
import { ProductCategory, Product } from "@/types";
import { useProducts } from "@/lib/use-products";
import { useCategoryStatus } from "@/lib/use-categories";
import { ProductCard } from "@/components/shop/product-card";
import { DiscordIcon } from "@/components/ui/social-icons";
import { Button } from "@/components/ui/button";

interface CategoryCatalogViewProps {
  category: ProductCategory;
  title: string;
  subtitle: string;
  badgeText: string;
  accentColor: string; // e.g. "rose", "cyan", "purple"
  emptyTitle: string;
  emptyDescription: string;
  comingSoonComponent: React.ReactNode;
}

export function CategoryCatalogView({
  category,
  title,
  subtitle,
  badgeText,
  accentColor,
  emptyTitle,
  emptyDescription,
  comingSoonComponent,
}: CategoryCatalogViewProps) {
  const { status, isLoaded: categoriesLoaded } = useCategoryStatus();
  const { products, isLoaded: productsLoaded } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");

  const isCategoryActive = status[category as keyof typeof status] ?? false;

  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === category);
  }, [products, category]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return categoryProducts;
    const q = searchQuery.toLowerCase();
    return categoryProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [categoryProducts, searchQuery]);

  // If not yet loaded or category is marked as Coming Soon, render the Coming Soon showcase
  if (!categoriesLoaded || !isCategoryActive) {
    return <>{comingSoonComponent}</>;
  }

  const categoryIconMap: Record<string, LucideIcon> = {
    obleceni: Shirt,
    boty: Footprints,
    digital: Gamepad2,
    parfemy: Sparkles,
  };

  const IconComponent = categoryIconMap[category] || PackageSearch;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Domů
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
          {title}
        </span>
      </nav>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white border border-neutral-800 p-8 sm:p-12 mb-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="h-3 w-3" />
            <span>Aktivní nabídka • {badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-sm text-neutral-300 leading-relaxed font-light">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-wrap gap-5 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>100% originální záruka</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>
                {category === "digital"
                  ? "Doručení do 30 sekund na e-mail"
                  : "Zásilkovna zakázkový import (12–16 dní)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and count bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Hledat v kategorii ${title.toLowerCase()}...`}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 text-xs rounded-full py-2 pl-9 pr-4 focus:outline-none transition-colors"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
        </div>

        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          Dostupných položek: <strong className="text-neutral-900 dark:text-white">{filteredProducts.length}</strong>
        </span>
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-12 text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mx-auto mb-4 text-neutral-400 shadow-xs">
            <IconComponent className="h-8 w-8 text-neutral-600 dark:text-neutral-300" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            {emptyTitle}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            {emptyDescription}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/katalog">
              <Button variant="outline" className="text-xs uppercase tracking-wider font-semibold">
                Prozkoumat parfémy
              </Button>
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold uppercase tracking-wider transition"
            >
              <DiscordIcon className="h-3.5 w-3.5" />
              <span>Oznámení na Discordu</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
