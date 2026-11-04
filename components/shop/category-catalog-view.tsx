"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  RotateCcw,
  SlidersHorizontal,
  X,
  PackageSearch,
  ShieldCheck,
  Zap,
  Shirt,
  Footprints,
  Gamepad2,
  LucideIcon,
  CheckCircle2,
} from "lucide-react";
import { ProductCategory, Product, FragranceGender, FragranceConcentration } from "@/types";
import { useProducts } from "@/lib/use-products";
import { useCategoryStatus } from "@/lib/use-categories";
import { ProductCard } from "@/components/shop/product-card";
import { DiscordIcon } from "@/components/ui/social-icons";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface CategoryCatalogViewProps {
  category: ProductCategory;
  title: string;
  subtitle: string;
  badgeText: string;
  accentColor: string; // e.g. "rose", "cyan", "purple", "emerald"
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
  const { products } = useProducts();

  // Coming Soon flag: true = Coming Soon is ON (show teaser), false = Normal Catalog
  const isComingSoonActive = status[category] ?? false;

  // Filter state for normal catalog
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Category-specific filter states
  const [clothingSize, setClothingSize] = useState<string>("all");
  const [shoeSize, setShoeSize] = useState<string>("all");
  const [digitalPlatform, setDigitalPlatform] = useState<string>("all");
  const [fragranceGender, setFragranceGender] = useState<FragranceGender | "all">("all");
  const [fragranceConcentration, setFragranceConcentration] = useState<FragranceConcentration | "all">("all");

  // Get all products in this specific category
  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === category);
  }, [products, category]);

  // Max price for slider
  const maxPossiblePrice = useMemo(() => {
    if (categoryProducts.length === 0) return 10000;
    return Math.max(...categoryProducts.map((p) => p.price), 5000);
  }, [categoryProducts]);

  const [maxPrice, setMaxPrice] = useState<number>(10000);

  // Available brands in this category
  const availableBrands = useMemo(() => {
    return Array.from(new Set(categoryProducts.map((p) => p.brand))).sort();
  }, [categoryProducts]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return categoryProducts
      .filter((p) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchDesc) return false;
        }

        // Brands
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
          return false;
        }

        // Skladem
        if (inStockOnly && p.stock <= 0) {
          return false;
        }

        // Cena
        if (p.price > maxPrice) {
          return false;
        }

        // Specific filters
        if (category === "obleceni" && clothingSize !== "all") {
          if (!p.clothingSizes?.includes(clothingSize)) return false;
        }

        if (category === "boty" && shoeSize !== "all") {
          if (!p.shoeSizes?.includes(shoeSize)) return false;
        }

        if (category === "digital" && digitalPlatform !== "all") {
          if (p.platform?.toLowerCase() !== digitalPlatform.toLowerCase()) return false;
        }

        if (category === "parfemy") {
          if (fragranceGender !== "all" && p.gender !== fragranceGender) return false;
          if (fragranceConcentration !== "all" && p.concentration !== fragranceConcentration) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "name":
            return a.name.localeCompare(b.name, "cs");
          case "featured":
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [
    categoryProducts,
    searchQuery,
    selectedBrands,
    inStockOnly,
    maxPrice,
    clothingSize,
    shoeSize,
    digitalPlatform,
    fragranceGender,
    fragranceConcentration,
    category,
    sortBy,
  ]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedBrands([]);
    setInStockOnly(false);
    setMaxPrice(maxPossiblePrice);
    setClothingSize("all");
    setShoeSize("all");
    setDigitalPlatform("all");
    setFragranceGender("all");
    setFragranceConcentration("all");
    setSortBy("featured");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedBrands.length > 0 ||
    inStockOnly ||
    maxPrice < maxPossiblePrice ||
    clothingSize !== "all" ||
    shoeSize !== "all" ||
    digitalPlatform !== "all" ||
    fragranceGender !== "all" ||
    fragranceConcentration !== "all";

  // 1. If Coming Soon is active, render the Coming Soon teaser showcase (image 2)
  if (isComingSoonActive) {
    return <>{comingSoonComponent}</>;
  }

  // 2. Normal Catalog rendering
  const categoryIconMap: Record<string, LucideIcon> = {
    obleceni: Shirt,
    boty: Footprints,
    digital: Gamepad2,
    parfemy: Sparkles,
  };

  const IconComponent = categoryIconMap[category] || PackageSearch;

  const sidebarFilterContent = (
    <div className="space-y-6 text-sm">
      {/* Header with active count & reset */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">
            Filtry nabídky
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Zobrazeno {filteredProducts.length} z {categoryProducts.length}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Skladová dostupnost */}
      <div className="pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-neutral-800 dark:text-neutral-200">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900"
          />
          <span>Pouze dostupné skladem</span>
        </label>
      </div>

      {/* Category-specific filter: OBLEČENÍ Velikost */}
      {category === "obleceni" && (
        <div>
          <h4 className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-2.5">
            Velikost oblečení
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {["all", "XS", "S", "M", "L", "XL", "XXL"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setClothingSize(size)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  clothingSize === size
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {size === "all" ? "Všechny" : size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category-specific filter: BOTY Velikost */}
      {category === "boty" && (
        <div>
          <h4 className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-2.5">
            Velikost obuvi (EU)
          </h4>
          <div className="grid grid-cols-4 gap-1.5">
            {["all", "39", "40", "41", "42", "43", "44", "45", "46"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setShoeSize(size)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition ${
                  shoeSize === size
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {size === "all" ? "Vše" : size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category-specific filter: DIGITAL Platforma */}
      {category === "digital" && (
        <div>
          <h4 className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-2.5">
            Platforma
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Všechny", val: "all" },
              { label: "Steam / PC", val: "Steam (PC)" },
              { label: "PlayStation", val: "PlayStation (PS5/PS4)" },
              { label: "Xbox", val: "Xbox Series / One" },
              { label: "Předplatné", val: "Předplatné" },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setDigitalPlatform(p.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  digitalPlatform === p.val
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category-specific filter: PARFÉMY Určení */}
      {category === "parfemy" && (
        <div>
          <h4 className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-2.5">
            Určení vůně
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Vše", val: "all" },
              { label: "Pánské", val: "panske" },
              { label: "Dámské", val: "damske" },
              { label: "Unisex", val: "unisex" },
            ].map((g) => (
              <button
                key={g.val}
                type="button"
                onClick={() => setFragranceGender(g.val as FragranceGender | "all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  fragranceGender === g.val
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cenový rozsah */}
      {categoryProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
              Maximální cena
            </h4>
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              {formatPrice(maxPrice)}
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={maxPossiblePrice}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
            <span>{formatPrice(500)}</span>
            <span>{formatPrice(maxPossiblePrice)}</span>
          </div>
        </div>
      )}

      {/* Značky */}
      {availableBrands.length > 0 && (
        <div>
          <h4 className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-2.5">
            Značka
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer py-0.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => {
                      setSelectedBrands((prev) =>
                        prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
                      );
                    }}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>{brand}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white border border-neutral-800 p-8 sm:p-12 mb-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Aktivní katalog • {badgeText}</span>
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
                  ? "Okamžité doručení do 30 sekund na e-mail"
                  : "Zásilkovna zakázkový import (12–16 dní)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* Search input */}
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Hledat v nabídce ${title.toLowerCase()}...`}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600 text-neutral-900 dark:text-white placeholder-neutral-400 text-xs rounded-full py-2.5 pl-9 pr-4 focus:outline-none transition-colors"
          />
          <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Mobile filter button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 shadow-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filtry ({filteredProducts.length})</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="cat-sort" className="text-xs text-neutral-500 hidden sm:inline font-medium">
              Řadit:
            </label>
            <select
              id="cat-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
            >
              <option value="featured">Doporučené</option>
              <option value="price-asc">Cena: Od nejlevnějšího</option>
              <option value="price-desc">Cena: Od nejdražšího</option>
              <option value="name">Název (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout: Left Filters + Right Product Grid */}
      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-neutral-900/40 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 self-start sticky top-24 shadow-xs">
          {sidebarFilterContent}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
              <div className="w-screen max-w-xs bg-white dark:bg-neutral-900 p-6 overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
                    Filtry
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {sidebarFilterContent}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid / Empty State */}
        <div className="flex-1 min-w-0">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : categoryProducts.length === 0 ? (
            /* Empty catalog state when no products in store yet */
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 p-8 sm:p-14 text-center max-w-xl mx-auto my-6 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mx-auto mb-4 text-neutral-500 shadow-xs">
                <IconComponent className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
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
          ) : (
            /* No products matching current filters */
            <div className="text-center py-20 px-4 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <Sparkles className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                Žádné položky neodpovídají zadaným filtrům
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Zkuste zrušit filtry velikostí, uvolnit cenový posuvník nebo vymazat vyhledávací dotaz.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-xl hover:opacity-90 transition"
              >
                Resetovat všechny filtry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
