"use client";

import React from "react";
import { useCategoryStatus } from "@/lib/use-categories";
import { ParfemyComingSoon } from "@/components/shop/parfemy-coming-soon";
import CatalogPage from "../katalog/page";

export default function ParfemyPage() {
  const { status } = useCategoryStatus();

  // If Coming Soon is active for parfemy, display the Coming Soon teaser
  if (status.parfemy) {
    return <ParfemyComingSoon />;
  }

  // Otherwise, render the normal full perfume catalog
  return <CatalogPage />;
}
