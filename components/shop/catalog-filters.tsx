"use client";

import React from "react";
import { X, RotateCcw } from "lucide-react";
import { FragranceGender, FragranceConcentration } from "@/types";
import { formatPrice } from "@/lib/utils";

export interface FilterState {
  search: string;
  brands: string[];
  gender: FragranceGender | "all";
  concentration: FragranceConcentration | "all";
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: "featured" | "price-asc" | "price-desc" | "name";
}

interface CatalogFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableBrands: string[];
  maxPossiblePrice: number;
  totalFilteredCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function CatalogFilters({
  filters,
  onChange,
  availableBrands,
  maxPossiblePrice,
  totalFilteredCount,
  isOpenMobile,
  onCloseMobile,
}: CatalogFiltersProps) {
  const toggleBrand = (brand: string) => {
    const nextBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ ...filters, brands: nextBrands });
  };

  const resetFilters = () => {
    onChange({
      search: "",
      brands: [],
      gender: "all",
      concentration: "all",
      maxPrice: maxPossiblePrice,
      inStockOnly: false,
      sortBy: "featured",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.brands.length > 0 ||
    filters.gender !== "all" ||
    filters.concentration !== "all" ||
    filters.maxPrice < maxPossiblePrice ||
    filters.inStockOnly;

  const content = (
    <div className="space-y-6 text-sm">
      {/* Header with active count & reset */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">
            Filtrovat parfémy
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Nalezeno {totalFilteredCount} produktů
          </p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
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
            checked={filters.inStockOnly}
            onChange={(e) =>
              onChange({ ...filters, inStockOnly: e.target.checked })
            }
            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900"
          />
          <span>Pouze dostupné položky (na objednávku)</span>
        </label>
      </div>

      {/* Pohlaví / Určení */}
      <div>
        <h4 className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-2.5">
          Určení vůně
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Vše", value: "all" },
            { label: "Pánské", value: "panske" },
            { label: "Dámské", value: "damske" },
            { label: "Unisex", value: "unisex" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  gender: item.value as FragranceGender | "all",
                })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.gender === item.value
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Koncentrace */}
      <div>
        <h4 className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-2.5">
          Koncentrace
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Vše", value: "all" },
            { label: "EdP (Parfémovaná voda)", value: "EdP" },
            { label: "EdT (Toaletní voda)", value: "EdT" },
            { label: "Parfum", value: "Parfum" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  concentration: item.value as FragranceConcentration | "all",
                })
              }
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filters.concentration === item.value
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-medium"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cenový rozsah */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
            Maximální cena
          </h4>
          <span className="text-xs font-bold text-neutral-900 dark:text-white">
            {formatPrice(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={maxPossiblePrice}
          step={100}
          value={filters.maxPrice}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
          <span>{formatPrice(1000)}</span>
          <span>{formatPrice(maxPossiblePrice)}</span>
        </div>
      </div>

      {/* Značky */}
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
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900"
                />
                <span>{brand}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-neutral-900/40 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 self-start sticky top-24">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-xs bg-white dark:bg-neutral-900 p-6 overflow-y-auto">
              <div className="flex justify-end pb-3">
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
