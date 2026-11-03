"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  Heart,
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VolumeVariant } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const product = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);

  if (!product) {
    notFound();
  }

  const [selectedVariant, setSelectedVariant] = useState<VolumeVariant>(
    product.volumeVariants && product.volumeVariants.length > 0
      ? product.volumeVariants[0]
      : { volume: product.volume, price: product.price, inStock: product.stock }
  );

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const currentPrice = selectedVariant.price;
  const inStock = selectedVariant.inStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-400 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white">
          Domů
        </Link>
        <span>/</span>
        <Link
          href="/katalog"
          className="hover:text-neutral-900 dark:hover:text-white"
        >
          Parfémy
        </Link>
        <span>/</span>
        <span className="text-neutral-500 uppercase tracking-wider">
          {product.brand}
        </span>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-medium truncate">
          {product.name}
        </span>
      </nav>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left: Product Media */}
        <div className="space-y-4">
          <div className="relative aspect-4/5 w-full bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <Image
              src={product.image}
              alt={`${product.brand} ${product.name}`}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge variant="brand" className="text-xs py-1 px-2.5">
                {product.concentration}
              </Badge>
              {product.isNew && (
                <Badge variant="brand" className="text-xs py-1 px-2.5">
                  Novinka
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-1">
              {product.name}
            </h1>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              Koncentrace: {product.concentration} · Určení:{" "}
              {product.gender === "panske"
                ? "Pánské"
                : product.gender === "damske"
                ? "Dámské"
                : "Unisex"}
            </p>
          </div>

          {/* Price display */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
              {formatPrice(currentPrice)}
            </span>
            {product.originalPrice && (
              <span className="text-base text-neutral-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-xs text-neutral-500">včetně DPH</span>
          </div>

          {/* Volume selection */}
          {product.volumeVariants && product.volumeVariants.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2.5">
                Zvolte velikost flakonu
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.volumeVariants.map((variant) => {
                  const isSelected = selectedVariant.volume === variant.volume;
                  return (
                    <button
                      key={variant.volume}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`py-2 px-4 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950 shadow-xs"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                      }`}
                    >
                      <span>{variant.volume}</span>
                      <span className="ml-2 opacity-75">
                        ({formatPrice(variant.price)})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock availability */}
          <div className="flex items-center gap-2 text-xs">
            {inStock > 0 ? (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Skladem ({inStock} ks připraveno k expedici)
                </span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  Momentálně vyprodáno
                </span>
              </>
            )}
          </div>

          {/* Quantity and Add to Cart Button */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                aria-label="Snížit množství"
              >
                -
              </button>
              <span className="px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white min-w-[36px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(inStock, quantity + 1))}
                className="px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                aria-label="Zvýšit množství"
              >
                +
              </button>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={inStock <= 0}
              className="flex-1 flex items-center justify-center gap-2 uppercase tracking-wider text-xs font-bold"
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Přidáno do košíku</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Přidat do košíku ({formatPrice(currentPrice * quantity)})</span>
                </>
              )}
            </Button>
          </div>

          {/* Quick guarantees */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-neutral-900 dark:text-white shrink-0" />
              <span>Doručení do 48 hodin kurýrem nebo na výdejní místo</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-neutral-900 dark:text-white shrink-0" />
              <span>Garance 100% originálního balení z autorizované distribuce</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-neutral-900 dark:text-white shrink-0" />
              <span>Možnost vrácení neotevřeného parfému do 14 dnů</span>
            </div>
          </div>

          {/* Scent Pyramid (Pyramida vůně) */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                Složení a pyramida vůně
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-neutral-50 dark:bg-neutral-900 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Hlava (vrchní tóny)
                </span>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">
                  {product.scentNotes.head.join(", ")}
                </p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-900 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Srdce (střední tóny)
                </span>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">
                  {product.scentNotes.heart.join(", ")}
                </p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-900 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Základ (spodní tóny)
                </span>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">
                  {product.scentNotes.base.join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white mb-2">
              Popis produktu
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Technical specifications table */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Parametry a specifikace
            </h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-neutral-500">Značka</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {product.brand}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-500">Typ vůně / Koncentrace</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {product.concentration}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-500">Zvolený objem</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {selectedVariant.volume}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-500">Určení</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {product.gender === "panske"
                    ? "Pánská vůně"
                    : product.gender === "damske"
                    ? "Dámská vůně"
                    : "Unisex"}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-500">Původ distribuce</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Evropská unie (Ověřený certifikovaný dodavatel)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
