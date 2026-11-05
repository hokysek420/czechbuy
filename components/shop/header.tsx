"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Sparkles, ShieldCheck, ExternalLink, User } from "lucide-react";
import { DiscordIcon, InstagramIcon } from "@/components/ui/social-icons";
import { useCart } from "@/lib/cart-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCategoryStatus } from "@/lib/use-categories";
import { useDiscordAuth } from "@/lib/discord-auth-context";

export function Header() {
  const router = useRouter();
  const { itemsCount, setIsOpen } = useCart();
  const { status: categoryStatus } = useCategoryStatus();
  const { user, isLoggedIn } = useDiscordAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOwner = Boolean(
    user?.isOwner ||
    user?.id === "1492628172611518504"
  );
  const isAdmin = Boolean(
    isOwner ||
    user?.isAdmin ||
    user?.roles?.includes("1567522100523040914")
  );
  const isMod = Boolean(isOwner || user?.isMod || user?.roles?.includes("1567522104293855253"));
  const isVip = Boolean(isOwner || user?.isVip || user?.roles?.includes("1567522107393581176"));

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
          <span className="hidden lg:inline text-neutral-500">•</span>
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors group"
          >
            <DiscordIcon className="h-3 w-3 text-[#5865F2] group-hover:scale-110 transition-transform" />
            <span className="underline decoration-neutral-600 underline-offset-2">Discord Komunita</span>
          </a>
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
              href="/parfemy"
              className="text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider text-xs font-semibold py-1 flex items-center gap-1.5 transition-colors"
            >
              Parfémy
              {categoryStatus.parfemy && (
                <span className="text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold px-1.5 py-0.5 rounded tracking-normal normal-case border border-purple-200 dark:border-purple-800/60">
                  Coming Soon
                </span>
              )}
            </Link>
            <Link
              href="/obleceni"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              Oblečení
              {categoryStatus.obleceni && (
                <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-semibold px-1.5 py-0.5 rounded tracking-normal normal-case border border-rose-200 dark:border-rose-800/60">
                  Coming Soon
                </span>
              )}
            </Link>
            <Link
              href="/boty"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              Boty
              {categoryStatus.boty && (
                <span className="text-[10px] bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-semibold px-1.5 py-0.5 rounded tracking-normal normal-case border border-cyan-200 dark:border-cyan-800/60">
                  Coming Soon
                </span>
              )}
            </Link>
            <Link
              href="/digital"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              Digital
              {categoryStatus.digital && (
                <span className="text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold px-1.5 py-0.5 rounded tracking-normal normal-case border border-purple-200 dark:border-purple-800/60">
                  Coming Soon
                </span>
              )}
            </Link>
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
              placeholder="Hledat značku, parfém nebo produkt..."
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs rounded-full py-2 pl-9 pr-4 focus:outline-none transition-colors"
            />
            <Search className="absolute left-3 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          </form>

          {/* Action icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Panel Quick Access for Owner / Admin */}
            {isLoggedIn && user && (isOwner || isAdmin) && (
              <Link
                href="/interni-portal-8f2a9x/sprava"
                className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold transition shadow-xs"
                title="Vstoupit do administrace e-shopu (přístup jako Owner)"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* Discord Login / User Profile Button */}
            {isLoggedIn && user ? (
              <Link
                href="/prihlaseni"
                className="inline-flex items-center gap-2.5 py-1 px-3 rounded-full bg-neutral-900 dark:bg-neutral-950 text-white border border-neutral-800 hover:border-neutral-700 transition shadow-sm group"
                title={`Přihlášen jako ${user.username} (${isOwner ? "Owner" : isAdmin ? "Admin" : isMod ? "Moderátor" : isVip ? "VIP" : user.roleName || "Bez role"})`}
              >
                <div className="relative shrink-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-neutral-700"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#23a55a] border-2 border-neutral-900 dark:border-neutral-950" />
                </div>
                <div className="flex flex-col text-left leading-tight min-w-0 pr-0.5">
                  <span className="font-bold text-xs sm:text-[13px] text-white max-w-[120px] truncate tracking-tight">
                    {user.username || user.global_name}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium leading-none mt-0.5 truncate ${
                      isOwner
                        ? "text-rose-400 font-bold"
                        : isAdmin
                        ? "text-indigo-400 font-bold"
                        : isMod
                        ? "text-cyan-400 font-semibold"
                        : isVip
                        ? "text-amber-400 font-semibold"
                        : user.roleName
                        ? "text-purple-400 font-medium"
                        : "text-neutral-400 font-normal"
                    }`}
                  >
                    {isOwner ? "Owner" : isAdmin ? "Admin" : isMod ? "Moderátor" : isVip ? "VIP" : user.roleName || "Bez role"}
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href="/prihlaseni"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white transition-all text-xs font-bold uppercase tracking-wider group border border-[#5865F2]/20 shadow-xs"
                title="Přihlásit se přes Discord"
              >
                <DiscordIcon className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold">Discord</span>
              </Link>
            )}

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
              placeholder="Hledat značku nebo produkt..."
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs rounded-full py-2 pl-9 pr-4 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          </form>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-3 pb-6 space-y-4">
          {/* Mobile User Profile or Login CTA */}
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            {isLoggedIn && user ? (
              <Link
                href="/prihlaseni"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white"
              >
                <div className="relative shrink-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#23a55a] border-2 border-neutral-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {user.username || user.global_name}
                  </p>
                  <p
                    className={`text-xs font-medium mt-0.5 ${
                      isOwner
                        ? "text-rose-400 font-bold"
                        : isAdmin
                        ? "text-indigo-400 font-bold"
                        : isMod
                        ? "text-cyan-400 font-semibold"
                        : isVip
                        ? "text-amber-400 font-semibold"
                        : user.roleName
                        ? "text-purple-400 font-medium"
                        : "text-neutral-400 font-normal"
                    }`}
                  >
                    {isOwner ? "Owner" : isAdmin ? "Admin" : isMod ? "Moderátor" : isVip ? "VIP" : user.roleName || "Bez role"}
                  </p>
                </div>
                <span className="text-xs font-semibold text-neutral-400">Můj profil →</span>
              </Link>
            ) : (
              <Link
                href="/prihlaseni"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-[#5865F2] text-white font-bold text-xs uppercase tracking-wider shadow-md"
              >
                <DiscordIcon className="h-4 w-4" />
                <span>Přihlásit se přes Discord</span>
              </Link>
            )}
          </div>

          {/* Mobile Admin Link if Owner/Admin */}
          {isLoggedIn && user && (isOwner || isAdmin) && (
            <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Link
                href="/interni-portal-8f2a9x/sprava"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 font-bold text-xs uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-rose-500" />
                  <span>Správa e-shopu (Admin Panel)</span>
                </div>
                <span>→</span>
              </Link>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Link
              href="/parfemy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-neutral-900 dark:text-white text-sm font-semibold uppercase tracking-wider py-1"
            >
              <span>Parfémy</span>
              {categoryStatus.parfemy && (
                <span className="text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/60">
                  Coming Soon
                </span>
              )}
            </Link>
            <Link
              href="/obleceni"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-neutral-700 dark:text-neutral-200 text-sm py-1 hover:text-neutral-900 dark:hover:text-white"
            >
              <span>Oblečení</span>
              {categoryStatus.obleceni && (
                <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-semibold px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/60">
                  Coming Soon
                </span>
              )}
            </Link>
            <Link
              href="/boty"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-neutral-700 dark:text-neutral-200 text-sm py-1 hover:text-neutral-900 dark:hover:text-white"
            >
              <span>Boty</span>
              {categoryStatus.boty && (
                <span className="text-[10px] bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-semibold px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/60">
                  Coming Soon
                </span>
              )}
            </Link>
            <Link
              href="/digital"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-neutral-700 dark:text-neutral-200 text-sm py-1 hover:text-neutral-900 dark:hover:text-white"
            >
              <span>Digital</span>
              {categoryStatus.digital && (
                <span className="text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/60">
                  Coming Soon
                </span>
              )}
            </Link>

            {/* Mobile Discord & Instagram Community Links */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#5865F2]/10 text-[#5865F2] font-semibold text-xs hover:bg-[#5865F2]/20 transition"
              >
                <div className="flex items-center gap-2">
                  <DiscordIcon className="h-4 w-4" />
                  <span>Připoj se na CzechBuy Discord</span>
                </div>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/czech.buy/"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold text-xs hover:text-[#E1306C] transition"
              >
                <div className="flex items-center gap-2">
                  <InstagramIcon className="h-4 w-4 text-[#E1306C]" />
                  <span>Sledovat Instagram @czech.buy</span>
                </div>
                <ExternalLink className="h-3 w-3" />
              </a>
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
