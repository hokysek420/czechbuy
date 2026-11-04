"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, subtotal, itemsCount } = useCart();

  const FREE_SHIPPING_THRESHOLD = 2000;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Nákupní košík ({itemsCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Zavřít košík"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-950/50 border-b border-neutral-200 dark:border-neutral-800 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-neutral-600 dark:text-neutral-300">
                Nakupte ještě za{" "}
                <strong className="text-neutral-900 dark:text-neutral-100">
                  {formatPrice(remainingForFreeShipping)}
                </strong>{" "}
                a máte <span className="text-emerald-600 dark:text-emerald-400 font-semibold">dopravu zdarma</span>!
              </p>
            ) : (
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Gratulujeme! Máte dopravu ZDARMA.
              </p>
            )}
            <div className="mt-2 w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="h-12 w-12 text-neutral-300 dark:text-neutral-700 stroke-1 mb-3" />
                <p className="text-base font-medium text-neutral-800 dark:text-neutral-200">
                  Váš košík je prázdný
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
                  Prozkoumejte naši nabídku originálních parfémů a vyberte si svou novou signaturní vůni.
                </p>
                <Link
                  href="/katalog"
                  onClick={() => setIsOpen(false)}
                  className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white underline underline-offset-4 hover:opacity-80"
                >
                  Prohlédnout parfémy
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="relative h-20 w-16 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden shrink-0">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      {item.brand}
                    </p>
                    <h3 className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.volume} · {item.concentration}
                    </p>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                          aria-label="Snížit počet kusů"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                          aria-label="Zvýšit počet kusů"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                        aria-label="Odstranit z košíku"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Mezisoučet
                </span>
                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Včetně DPH. Doprava a platba budou dopočítány v pokladně.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/kosik"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full text-xs">
                    Zobrazit košík
                  </Button>
                </Link>
                <Link
                  href="/pokladna"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" className="w-full text-xs flex items-center justify-center gap-1.5">
                    <span>Pokladna</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
