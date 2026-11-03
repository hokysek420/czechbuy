"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Clock,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    itemsCount,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (couponCode.trim().toUpperCase() === "CZECHBUY10") {
      setDiscountPercent(10);
      setCouponSuccess("Slevový kód byl úspěšně uplatněn (-10 %)");
    } else {
      setCouponError("Neplatný nebo expirovaný slevový kód.");
    }
  };

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalPrice = Math.max(0, subtotal - discountAmount);

  const FREE_SHIPPING_LIMIT = 2000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_LIMIT;
  const remainingForFree = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-neutral-400 stroke-1" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Váš nákupní košík je prázdný
        </h1>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed">
          Zatím jste do košíku nepřidali žádný parfém. Prohlédněte si naši aktuální nabídku originálních vůní.
        </p>
        <div className="mt-8">
          <Link href="/katalog">
            <Button size="lg" className="px-8 uppercase tracking-wider text-xs font-semibold">
              Přejít do katalogu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            Nákupní košík
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Máte v košíku {itemsCount} {itemsCount === 1 ? "položku" : itemsCount < 5 ? "položky" : "položek"}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-neutral-400 hover:text-red-500 underline underline-offset-2 transition-colors"
        >
          Vyprázdnit košík
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Items List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Shipping Alert */}
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
            {isFreeShipping ? (
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <Truck className="h-4 w-4" />
                <span>Máte nárok na dopravu ZDARMA!</span>
              </p>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400">
                Přidejte zboží ještě za{" "}
                <strong className="text-neutral-900 dark:text-white">
                  {formatPrice(remainingForFree)}
                </strong>{" "}
                a získejte <strong>dopravu zdarma</strong>.
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-xs">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      {item.brand}
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      <Link
                        href={`/produkt/${item.productId}`}
                        className="hover:underline"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {item.volume} · {item.concentration}
                    </p>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white mt-1 sm:hidden">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      aria-label="Snížit počet"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-xs font-semibold text-neutral-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      aria-label="Zvýšit počet"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-neutral-400">
                        {formatPrice(item.price)} / ks
                      </p>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                    aria-label="Odstranit položku z košíku"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/katalog"
              className="text-xs text-neutral-600 dark:text-neutral-400 hover:underline flex items-center gap-1.5"
            >
              ← Pokračovat ve výběru dalších parfémů
            </Link>
          </div>
        </div>

        {/* Order Summary (1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">
              Souhrn objednávky
            </h2>

            {/* Discount code form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label
                htmlFor="coupon"
                className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1"
              >
                <Tag className="h-3.5 w-3.5" />
                <span>Máte slevový kód? (např. CZECHBUY10)</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Kód kupónu"
                  className="flex-1 uppercase text-xs py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Uplatnit
                </Button>
              </div>
              {couponSuccess && (
                <p className="text-[11px] text-emerald-600">{couponSuccess}</p>
              )}
              {couponError && (
                <p className="text-[11px] text-red-500">{couponError}</p>
              )}
            </form>

            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Mezisoučet zboží</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Sleva ({discountPercent} %)</span>
                  <span className="font-semibold">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Doprava</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {isFreeShipping ? "ZDARMA" : "od 79 Kč"}
                </span>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    Celková cena
                  </span>
                  <p className="text-[10px] text-neutral-400">Včetně 21% DPH</p>
                </div>
                <span className="text-xl font-black text-neutral-900 dark:text-white">
                  {formatPrice(finalPrice)}
                </span>
              </div>
            </div>

            {/* Pre-Order Notice Banner */}
            <div className="rounded-lg bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 p-3 flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px]">
                <strong className="font-semibold text-neutral-900 dark:text-white">Upozornění k expedici:</strong>{" "}
                Vaše zboží je zadáno do zakázkového režimu. Předpokládané doručení je 12–16 pracovních dní.
              </p>
            </div>

            <Link href="/pokladna" className="block pt-1">
              <Button
                size="lg"
                className="w-full uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Přejít k pokladně</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-[11px] text-neutral-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
                <span>Bezpečné šifrované platby</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
                <span>Zákonná 14denní lhůta pro vrácení neotevřeného zboží</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
