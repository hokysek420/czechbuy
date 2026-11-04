"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Truck,
  CreditCard,
  ShieldCheck,
  Building,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShippingMethod, PaymentMethod, Order } from "@/types";
import { getInitialOrders, saveOrders } from "@/lib/admin-store";
import { z } from "zod";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "Zadejte platné křestní jméno"),
  lastName: z.string().min(2, "Zadejte platné příjmení"),
  email: z.string().email("Zadejte platnou e-mailovou adresu"),
  phone: z
    .string()
    .min(9, "Zadejte platné telefonní číslo")
    .regex(/^(\+420|\+421)?\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/, "Formát: +420 777 123 456"),
  address: z.string().min(4, "Zadejte ulici a číslo popisné"),
  city: z.string().min(2, "Zadejte město"),
  zip: z.string().min(5, "Zadejte PSČ (např. 110 00)"),
  note: z.string().optional(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "Musíte souhlasit s obchodními podmínkami" }),
  }),
  agreePreorder: z.literal(true, {
    errorMap: () => ({
      message:
        "Musíte potvrdit seznámení s předobjednávkovým režimem (12–16 dní)",
    }),
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    note: "",
    agreeTerms: undefined,
    agreePreorder: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("zasilkovna");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("karta");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Pricing calculations
  const FREE_SHIPPING_LIMIT = 2000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_LIMIT;

  const shippingPrices: Record<ShippingMethod, number> = {
    zasilkovna: isFreeShipping ? 0 : 79,
    ppl: isFreeShipping ? 0 : 99,
    dpd: isFreeShipping ? 0 : 99,
    osobni: 0,
  };

  const paymentPrices: Record<PaymentMethod, number> = {
    karta: 0,
    apple_pay: 0,
    prevod: 0,
    dobirka: 39,
  };

  const currentShippingPrice = shippingPrices[shippingMethod];
  const currentPaymentPrice = paymentPrices[paymentMethod];
  const grandTotal = subtotal + currentShippingPrice + currentPaymentPrice;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new Order object
      const orderId = `CZB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        customer: {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          email: result.data.email,
          phone: result.data.phone,
          address: result.data.address,
          city: result.data.city,
          zip: result.data.zip,
          country: "Česká republika",
          note: result.data.note,
        },
        items: [...items],
        shippingMethod,
        paymentMethod,
        shippingPrice: currentShippingPrice,
        paymentPrice: currentPaymentPrice,
        subtotal,
        totalPrice: grandTotal,
        status: "nova",
      };

      // Persist to admin orders store
      const currentOrders = getInitialOrders();
      saveOrders([newOrder, ...currentOrders]);

      // Dispatch Discord live order webhook via server API
      try {
        fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrder),
        }).catch((err) => console.warn("[Checkout] Discord webhook fetch error:", err));
      } catch (err) {
        console.warn("[Checkout] Discord webhook trigger error:", err);
      }

      // Set confirmed order and clear user's cart
      setConfirmedOrder(newOrder);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was placed successfully, render confirmation screen
  if (confirmedOrder) {
    const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/czechbuy";

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Objednávka úspěšně přijata
        </span>
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">
          Děkujeme za váš nákup!
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
          Číslo vaší objednávky je{" "}
          <strong className="text-neutral-900 dark:text-white">
            {confirmedOrder.id}
          </strong>
        </p>

        {/* Discord Community & VIP Drop Card */}
        <div className="mt-8 max-w-lg mx-auto bg-gradient-to-br from-[#5865F2]/10 via-neutral-50 to-[#5865F2]/5 dark:from-[#5865F2]/20 dark:via-neutral-900 dark:to-neutral-900/60 border border-[#5865F2]/30 dark:border-[#5865F2]/40 rounded-2xl p-6 text-left shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shrink-0 shadow-md">
              <DiscordIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5865F2] dark:text-[#7983F5]">
                  Oficiální komunita CzechBuy
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-[#5865F2]/15 text-[#5865F2] dark:text-[#7983F5] font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="h-2.5 w-2.5" />
                  VIP přístup
                </span>
              </div>
              <h3 className="text-sm font-bold text-neutral-950 dark:text-white leading-snug">
                Sleduj stav svého balíčku a získej VIP přístup k dalším dropům na našem Discordu!
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 pt-1 leading-relaxed">
                Připoj se k více než stovkám členů CzechBuy Fam. Získáš prioritní tracking balíčku, přímou podporu od adminů a přednostní přístup k limitovaným niche dropům a streetwear releasům.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#5865F2]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Komunita je online 24/7</span>
            </div>
            <a
              href={discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <DiscordIcon className="h-4 w-4" />
              <span>Připojit se na Discord</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          </div>
        </div>

        <div className="mt-8 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-left max-w-lg mx-auto space-y-4 text-xs">
          <h2 className="font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 text-xs pb-2 border-b border-neutral-200 dark:border-neutral-800">
            Detaily objednávky
          </h2>
          <div className="flex justify-between">
            <span className="text-neutral-500">Zákazník:</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {confirmedOrder.customer.firstName} {confirmedOrder.customer.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Doručovací adresa:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200 text-right">
              {confirmedOrder.customer.address}, {confirmedOrder.customer.city}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Způsob doručení:</span>
            <span className="font-semibold text-neutral-900 dark:text-white uppercase">
              {confirmedOrder.shippingMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Způsob platby:</span>
            <span className="font-semibold text-neutral-900 dark:text-white uppercase">
              {confirmedOrder.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-800 pt-3 text-sm">
            <span className="font-bold text-neutral-900 dark:text-white">
              Celkem k úhradě:
            </span>
            <span className="font-black text-neutral-900 dark:text-white">
              {formatPrice(confirmedOrder.totalPrice)}
            </span>
          </div>
        </div>

        <p className="text-xs text-neutral-500 mt-6 max-w-md mx-auto">
          Potvrzení objednávky spolu s rekapitulací jsme odeslali na e-mailovou adresu{" "}
          <strong className="text-neutral-800 dark:text-neutral-200">
            {confirmedOrder.customer.email}
          </strong>
          .
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/katalog">
            <Button size="lg" className="px-8 text-xs uppercase tracking-wider">
              Zpět do obchodu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If cart is empty and no confirmed order
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Váš košík je prázdný
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Před přechodem k pokladně vložte do košíku alespoň jeden parfém.
        </p>
        <Link href="/katalog" className="mt-6 inline-block">
          <Button size="md" className="text-xs">
            Přejít do nabídky
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
          Pokladna a dokončení objednávky
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Zadejte prosím své doručovací údaje a vyberte preferovaný způsob dopravy a platby.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left: Customer Data & Options (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Dodací údaje */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Doručovací a kontaktní údaje</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Jméno *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleInputChange}
                    placeholder="např. Jan"
                    className="w-full py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Příjmení *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleInputChange}
                    placeholder="např. Novák"
                    className="w-full py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    E-mailová adresa *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    placeholder="jan.novak@email.cz"
                    className="w-full py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Telefonní číslo *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="+420 777 123 456"
                    className="w-full py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Ulice a číslo popisné *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    placeholder="Václavské náměstí 1"
                    className="w-full py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Město *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    placeholder="Praha 1"
                    className="w-full py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    PSČ *
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip || ""}
                    onChange={handleInputChange}
                    placeholder="110 00"
                    className="w-full py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {errors.zip && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.zip}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Poznámka k doručení (volitelné)
                  </label>
                  <textarea
                    name="note"
                    rows={2}
                    value={formData.note || ""}
                    onChange={handleInputChange}
                    placeholder="např. kód ke zvonku, patro..."
                    className="w-full py-2 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Způsob dopravy */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Způsob doručení</span>
              </h2>

              <div className="space-y-3">
                {[
                  {
                    id: "zasilkovna" as ShippingMethod,
                    title: "Zásilkovna – Výdejní místa a Z-BOXy",
                    desc: "Tisíce výdejních míst a samoobslužných boxů po celé ČR",
                    price: shippingPrices.zasilkovna,
                  },
                  {
                    id: "ppl" as ShippingMethod,
                    title: "PPL Kurýr na adresu",
                    desc: "Doručení přímo do rukou na jakoukoliv adresu v ČR",
                    price: shippingPrices.ppl,
                  },
                  {
                    id: "dpd" as ShippingMethod,
                    title: "DPD Kurýr na adresu",
                    desc: "Spolehlivé doručení s přesným hodinovým oknem",
                    price: shippingPrices.dpd,
                  },
                  {
                    id: "osobni" as ShippingMethod,
                    title: "Osobní odběr – Centrální sklad Praha",
                    desc: "Expresní vyzvednutí do 2 hodin od objednávky",
                    price: shippingPrices.osobni,
                  },
                ].map((method) => {
                  const isChecked = shippingMethod === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? "border-neutral-900 dark:border-white bg-neutral-50/70 dark:bg-neutral-800/60"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={isChecked}
                          onChange={() => setShippingMethod(method.id)}
                          className="w-4 h-4 text-neutral-900 focus:ring-neutral-900 accent-neutral-900 dark:accent-white"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                            {method.title}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            {method.desc}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {method.price === 0 ? "ZDARMA" : formatPrice(method.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Způsob platby */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>Způsob platby</span>
              </h2>

              <div className="space-y-3">
                {[
                  {
                    id: "karta" as PaymentMethod,
                    title: "Platební karta online (Visa / Mastercard)",
                    desc: "Okamžitá bezpečná 3D Secure platba",
                    price: paymentPrices.karta,
                  },
                  {
                    id: "apple_pay" as PaymentMethod,
                    title: "Apple Pay / Google Pay",
                    desc: "Rychlá platba přes vaši digitální peněženku",
                    price: paymentPrices.apple_pay,
                  },
                  {
                    id: "dobirka" as PaymentMethod,
                    title: "Dobírka (Platba při převzetí)",
                    desc: "Zaplatíte hotově nebo kartou kurýrovi při doručení (+39 Kč)",
                    price: paymentPrices.dobirka,
                  },
                  {
                    id: "prevod" as PaymentMethod,
                    title: "Bankovní převod předem",
                    desc: "Pokyny k platbě obdržíte v potvrzovacím e-mailu",
                    price: paymentPrices.prevod,
                  },
                ].map((method) => {
                  const isChecked = paymentMethod === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? "border-neutral-900 dark:border-white bg-neutral-50/70 dark:bg-neutral-800/60"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={isChecked}
                          onChange={() => setPaymentMethod(method.id)}
                          className="w-4 h-4 text-neutral-900 focus:ring-neutral-900 accent-neutral-900 dark:accent-white"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                            {method.title}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            {method.desc}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {method.price === 0 ? "ZDARMA" : `+${formatPrice(method.price)}`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Order Summary & Confirmation CTA (1 col) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs sticky top-24 space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Položky v objednávce
              </h2>

              {/* Items mini list */}
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center gap-3">
                    <div className="relative h-12 w-10 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden shrink-0">
                      <Image
                        src={item.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {item.quantity}× {item.volume}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Mezisoučet zboží</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Doprava</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {currentShippingPrice === 0
                      ? "ZDARMA"
                      : formatPrice(currentShippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Platba</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {currentPaymentPrice === 0
                      ? "ZDARMA"
                      : formatPrice(currentPaymentPrice)}
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
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Pre-Order Confirmation Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <input
                    type="checkbox"
                    name="agreePreorder"
                    checked={formData.agreePreorder === true}
                    onChange={handleInputChange}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900 accent-neutral-900 dark:accent-white"
                  />
                  <span className="font-medium text-[11px] leading-snug">
                    Beru na vědomí, že veškeré položky jsou zajišťovány na individuální předobjednávku s garantovaným doručením do 12–16 pracovních dní.
                  </span>
                </label>
                {errors.agreePreorder && (
                  <p className="text-red-500 text-[11px] mt-1.5 font-medium">
                    {errors.agreePreorder}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms === true}
                    onChange={handleInputChange}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900 accent-neutral-900 dark:accent-white"
                  />
                  <span>
                    Odesláním objednávky souhlasím s{" "}
                    <Link
                      href="/obchodni-podminky"
                      target="_blank"
                      className="underline text-neutral-900 dark:text-white"
                    >
                      obchodními podmínkami
                    </Link>{" "}
                    a potvrzuji, že jsem se seznámil(a) se{" "}
                    <Link
                      href="/ochrana-udaju"
                      target="_blank"
                      className="underline text-neutral-900 dark:text-white"
                    >
                      zásadami zpracování osobních údajů (GDPR)
                    </Link>
                    .
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-[11px] mt-1.5 font-medium">
                    {errors.agreeTerms}
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                className="w-full uppercase tracking-wider text-xs font-bold py-3.5"
              >
                Dokončit a odeslat objednávku
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/kosik"
                  className="text-xs text-neutral-500 hover:underline"
                >
                  ← Zpět k úpravě košíku
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
