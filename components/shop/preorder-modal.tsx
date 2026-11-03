"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PackageCheck, ShieldCheck, Clock, CheckCircle2, ArrowRight } from "lucide-react";

const COOKIE_NAME = "czechbuy_preorder_accepted";

export function PreorderModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Skip showing on internal admin portal
    if (pathname && pathname.startsWith("/interni-portal-8f2a9x")) {
      return;
    }

    try {
      // Check cookies
      const hasCookie = document.cookie
        .split("; ")
        .some((item) => item.startsWith(`${COOKIE_NAME}=`));

      // Fallback check localStorage
      const hasLocalStorage = localStorage.getItem(COOKIE_NAME) === "true";

      if (!hasCookie && !hasLocalStorage) {
        setIsOpen(true);
      }
    } catch {
      // If error accessing cookie/storage, fallback to open modal
      setIsOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleAccept = () => {
    try {
      const maxAge = 60 * 60 * 24 * 30; // 30 days
      document.cookie = `${COOKIE_NAME}=true; path=/; max-age=${maxAge}; SameSite=Lax`;
      localStorage.setItem(COOKIE_NAME, "true");
    } catch {
      // ignore storage error
    }
    setIsOpen(false);
  };

  // Prevent SSR hydration mismatch
  if (!isMounted || !isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preorder-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Dark backdrop with smooth blur */}
      <div
        className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Centered Modal Window */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Top Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <PackageCheck className="h-7 w-7 text-neutral-900 dark:text-neutral-100 stroke-[1.75]" />
        </div>

        {/* Micro Category Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-300 mb-3">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Informace o zakázkovém režimu</span>
        </div>

        {/* Heading */}
        <h2
          id="preorder-title"
          className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white"
        >
          Exkluzivní zakázkový servis CzechBuy
        </h2>

        {/* Informative Body Content */}
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 text-left bg-neutral-50 dark:bg-neutral-950/50 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80">
          <p>
            Vítejte na <strong>CzechBuy</strong>. Abychom vám garantovali 100% originalitu, nejnovější výrobní šarže a nejvýhodnější ceny, funguje náš e-shop na bázi <strong>zakázkového importu</strong> přímo z centrálních zahraničních skladů.
          </p>
          <p>
            Veškeré objednávky procházejí individuální expedicí a důkladnou výstupní kontrolou kvality. Předpokládaná doba doručení vaší zásilky je proto <strong>12–16 pracovních dní</strong>.
          </p>
        </div>

        {/* Key Guarantees List */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-700 dark:text-neutral-300 text-left">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>100% originální flakony</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Čerstvé výrobní šarže</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Doručení 12–16 prac. dní</span>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="mt-6 pt-2">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 py-3.5 px-6 rounded-md font-semibold text-xs tracking-wider uppercase hover:opacity-90 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
          >
            <span>Rozumím a vstoupit na e-shop</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-[10px] text-neutral-400 dark:text-neutral-500">
          Potvrzením berete na vědomí specifický režim individuálního dovozu. Volbu si pamatujeme 30 dní.
        </p>
      </div>
    </div>
  );
}
