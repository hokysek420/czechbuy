"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";

export function AdminPreviewBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const hasAdminCookie = document.cookie
        .split("; ")
        .some((item) => item.startsWith("czechbuy_admin_active=true"));
      setIsAdmin(hasAdminCookie);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  if (!mounted || !isAdmin) {
    return null;
  }

  return (
    <div className="bg-neutral-950 text-white dark:bg-neutral-900 border-b border-neutral-800 text-xs py-2 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold text-amber-400">Režim správce:</span>
          <span className="text-neutral-300">
            Veřejný web je uzamčen za stránkou s odpočtem. Prohlížíte odemčený obchod.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/interni-portal-8f2a9x/sprava"
            className="inline-flex items-center gap-1 font-semibold text-xs text-white hover:text-amber-400 underline underline-offset-4 transition"
          >
            <span>Správa portálu</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <span className="text-neutral-600">|</span>
          <Link
            href="/brzy-otevirame"
            className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition"
          >
            <span>Náhled odpočtu</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
