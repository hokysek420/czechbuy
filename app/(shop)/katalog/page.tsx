"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Sparkles, PackageSearch } from "lucide-react";
import { useProducts } from "@/lib/use-products";
import { useCategoryStatus } from "@/lib/use-categories";
import { ParfemyComingSoon } from "@/components/shop/parfemy-coming-soon";
import { ProductCard } from "@/components/shop/product-card";
import { CatalogFilters, FilterState } from "@/components/shop/catalog-filters";
import { FragranceGender, FragranceConcentration } from "@/types";

function CatalogContent() {
  const { status } = useCategoryStatus();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialGender = (searchParams.get("gender") as FragranceGender) || "all";

  const { products, isLoaded } = useProducts();

  const maxPossiblePrice = useMemo(() => {
    return Math.max(...products.map((p) => p.price), 10000);
  }, [products]);

  const [filters, setFilters] = useState<FilterState>({
    search: initialQuery,
    brands: [],
    gender: initialGender,
    concentration: "all",
    maxPrice: maxPossiblePrice,
    inStockOnly: false,
    sortBy: "featured",
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    const g = searchParams.get("gender") as FragranceGender;
    if (q !== null || g !== null) {
      setFilters((prev) => ({
        ...prev,
        ...(q !== null ? { search: q } : {}),
        ...(g ? { gender: g } : {}),
      }));
    }
  }, [searchParams]);

  // Extract available brands
  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).sort();
  }, [products]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesNotes = product.scentNotes
          ? [
              ...(product.scentNotes.head || []),
              ...(product.scentNotes.heart || []),
              ...(product.scentNotes.base || []),
            ].some((note) => note.toLowerCase().includes(query))
          : false;

        if (!matchesName && !matchesBrand && !matchesNotes) {
          return false;
        }
      }

      // Brands
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }

      // Gender
      if (filters.gender !== "all" && product.gender !== filters.gender) {
        return false;
      }

      // Concentration
      if (
        filters.concentration !== "all" &&
        product.concentration !== filters.concentration
      ) {
        return false;
      }

      // Max price
      if (product.price > filters.maxPrice) {
        return false;
      }

      // In stock
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
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
  }, [filters, products]);

  // If Coming Soon is active for parfemy, display the teaser
  if (status.parfemy) {
    return <ParfemyComingSoon />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Heading */}
      <div className="mb-6">
        <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
          <span>Domů</span>
          <span>/</span>
          <span className="text-neutral-900 dark:text-neutral-100 font-medium">
            Katalog parfémů
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Parfémy & Vůně
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Kolekce originálních flakonů se zakázkovým importem (12–16 dní) a garancí pravosti.
            </p>
          </div>

          {/* Sort bar & Mobile filter button */}
          {products.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filtry ({filteredProducts.length})</span>
              </button>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-xs text-neutral-500 hidden sm:inline"
                >
                  Řadit:
                </label>
                <select
                  id="sort-select"
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      sortBy: e.target.value as FilterState["sortBy"],
                    })
                  }
                  className="text-xs py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="featured">Doporučené</option>
                  <option value="price-asc">Cena: Od nejlevnějšího</option>
                  <option value="price-desc">Cena: Od nejdražšího</option>
                  <option value="name">Název (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* When no products exist in the store (Empty Catalog State) */}
      {products.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 px-6 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 my-8">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-900 dark:text-white shadow-xs">
            <PackageSearch className="h-8 w-8 stroke-[1.5]" />
          </div>
          <h2 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
            Kolekce se připravuje
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            Momentálně připravujeme naskladnění nových originálních flakonů. Zkontrolujte nabídku brzy.
          </p>
        </div>
      ) : (
        /* Main Layout: Left Filters + Right Grid */
        <div className="flex gap-8 items-start">
          <CatalogFilters
            filters={filters}
            onChange={setFilters}
            availableBrands={availableBrands}
            maxPossiblePrice={maxPossiblePrice}
            totalFilteredCount={filteredProducts.length}
            isOpenMobile={mobileFilterOpen}
            onCloseMobile={() => setMobileFilterOpen(false)}
          />

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 px-4 bg-neutral-50 dark:bg-neutral-900/30 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <Sparkles className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                  Žádné parfémy neodpovídají zadaným filtrům
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Zkuste uvolnit cenový rozsah, vymazat vyhledávací dotaz nebo zrušit filtry značek.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      search: "",
                      brands: [],
                      gender: "all",
                      concentration: "all",
                      maxPrice: maxPossiblePrice,
                      inStockOnly: false,
                      sortBy: "featured",
                    })
                  }
                  className="mt-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-md"
                >
                  Zrušit všechny filtry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-neutral-500">
          Načítání katalogu...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
