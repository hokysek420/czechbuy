"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Sparkles, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const router = useRouter();
  const { itemsCount, setIsOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/katalog");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Top micro-announcement bar */}
      <div className="bg-neutral-900 text-white dark:bg-neutral-900 dark:text-neutral-300 text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Doprava zdarma při nákupu nad 2 000 Kč</span>
          </span>
          <span className="hidden md:inline text-neutral-500">•</span>
          <span className="hidden md:flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>100% originální parfémy z ověřené evropské distribuce</span>
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
              aria-label="Otevřít menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-baseline gap-1 group focus:outline-none"
            >
              <span className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
                Czech<span className="text-neutral-500 dark:text-neutral-400 font-light">Buy</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white inline-block transition-transform group-hover:scale-125" />
            </Link>
          </div>

          {/* Primary Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/katalog"
              className="text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors uppercase tracking-wider text-xs font-semibold py-1 border-b-2 border-neutral-950 dark:border-white"
            >
              Parfémy
            </Link>
            <div className="relative group cursor-not-allowed">
              <span className="text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-xs font-medium flex items-center gap-1.5">
                Oblečení
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded tracking-normal normal-case">
                  Již brzy
                </span>
              </span>
            </div>
            <div className="relative group cursor-not-allowed">
              <span className="text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-xs font-medium flex items-center gap-1.5">
                Boty
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded tracking-normal normal-case">
                  Již brzy
                </span>
              </span>
            </div>
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-sm relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat značku, parfém nebo tóny..."
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs rounded-full py-2 pl-9 pr-4 focus:outline-none transition-colors"
            />
            <Search className="absolute left-3 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          </form>

          {/* Action icons */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Cart trigger button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
              aria-label={`Košík s ${itemsCount} položkami`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemsCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-neutral-950 dark:bg-white dark:text-neutral-950 rounded-full shadow-sm animate-in zoom-in-50">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat značku nebo parfém..."
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs rounded-full py-2 pl-9 pr-4 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          </form>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-3">
            <Link
              href="/katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-white py-1"
            >
              Parfémy (Aktivní katalog)
            </Link>
            <div className="flex items-center justify-between text-neutral-400 text-sm py-1">
              <span>Oblečení</span>
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-500">
                Již brzy
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400 text-sm py-1">
              <span>Boty</span>
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-500">
                Již brzy
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 space-y-2">
            <Link
              href="/ochrana-udaju"
              onClick={() => setMobileMenuOpen(false)}
              className="block hover:underline"
            >
              Ochrana osobních údajů (GDPR)
            </Link>
            <Link
              href="/obchodni-podminky"
              onClick={() => setMobileMenuOpen(false)}
              className="block hover:underline"
            >
              Obchodní podmínky
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block hover:underline"
            >
              Často kladené otázky (FAQ)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
