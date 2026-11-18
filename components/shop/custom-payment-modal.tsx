"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Smartphone,
  X,
  Sparkles,
  QrCode,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { PaymentMethod, Order } from "@/types";
import { formatPrice } from "@/lib/utils";

interface CustomPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onPaymentSuccess: (paidOrder: Order) => void;
}

export function CustomPaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}: CustomPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentMethod>(order.paymentMethod || "karta");
  
  // Card input states
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState(
    `${order.customer.firstName} ${order.customer.lastName}`.trim().toUpperCase() || "JAN NOVÁK"
  );
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardError, setCardError] = useState("");

  // Processing & Simulation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<"idle" | "authorizing" | "3d_secure" | "complete">("idle");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (order.paymentMethod) {
      setActiveTab(order.paymentMethod);
    }
  }, [order.paymentMethod]);

  if (!isOpen) return null;

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    val = val.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(val);
    setCardError("");
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
    setCardError("");
  };

  // Handle Copy to clipboard helper
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Process Card or Apple Pay Payment
  const handleProcessPayment = async () => {
    if (activeTab === "karta") {
      const cleanNumber = cardNumber.replace(/\s/g, "");
      if (cleanNumber.length < 15) {
        setCardError("Zadejte prosím platné 16místné číslo platební karty.");
        return;
      }
      if (cardExpiry.length < 5) {
        setCardError("Zadejte platnou expiraci (MM/RR).");
        return;
      }
      if (cardCvv.length < 3) {
        setCardError("Zadejte platný 3místný CVC/CVV kód.");
        return;
      }
    }

    setIsProcessing(true);
    setProcessingStep("authorizing");

    // Realistic 3D Secure / Payment flow progression
    setTimeout(() => {
      setProcessingStep("3d_secure");
    }, 1100);

    setTimeout(() => {
      setProcessingStep("complete");
    }, 2400);

    setTimeout(() => {
      setIsProcessing(false);
      const paidOrder: Order = {
        ...order,
        status: "zpracovava_se",
        paymentMethod: activeTab,
      };
      onPaymentSuccess(paidOrder);
    }, 3200);
  };

  // Bank Account Info for QR / Transfer
  const bankAccount = "2401893452 / 2010"; // Fio banka
  const variableSymbol = order.id.replace(/\D/g, "") || "2026001";
  const qrString = `SPD*1.0*ACC:CZ3420100000002401893452*AM:${order.totalPrice}.00*CC:CZK*MSG:Objednavka ${order.id} CzechBuy*X-VS:${variableSymbol}`;
  const qrCodeUrl = `https://api.paylibo.com/paylibo/generator/czech/image?accountNumber=2401893452&bankCode=2010&amount=${order.totalPrice}&currency=CZK&vs=${variableSymbol}&message=CzechBuy%20${order.id}&size=260`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-black text-sm shadow-sm">
              CZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  CzechBuy Secure Pay
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Lock className="h-2.5 w-2.5" />
                  256-bit SSL
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono">
                Objednávka: {order.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-neutral-400 font-medium block">
                K úhradě
              </span>
              <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
            {!isProcessing && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab selection */}
        <div className="px-6 pt-4 border-b border-neutral-100 dark:border-neutral-800 flex gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => !isProcessing && setActiveTab("karta")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "karta"
                ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Platební karta</span>
          </button>

          <button
            type="button"
            onClick={() => !isProcessing && setActiveTab("apple_pay")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "apple_pay"
                ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Apple Pay / GPay</span>
          </button>

          <button
            type="button"
            onClick={() => !isProcessing && setActiveTab("prevod")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "prevod"
                ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Okamžitý QR kód</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Tab: CARD PAYMENT */}
          {activeTab === "karta" && (
            <div className="space-y-6">
              {/* 3D Glass Virtual Card Preview */}
              <div className="relative w-full aspect-[1.7/1] max-w-sm mx-auto rounded-2xl p-6 text-white bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-800 border border-neutral-700/60 shadow-xl overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 rounded bg-amber-400/80 border border-amber-300/40" />
                    <Sparkles className="h-4 w-4 text-neutral-400" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest text-neutral-300">
                    CzechBuy Virtual
                  </span>
                </div>

                <div className="my-2">
                  <span className="font-mono text-base sm:text-xl tracking-[0.2em] font-bold text-neutral-100 drop-shadow-sm">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </span>
                </div>

                <div className="flex items-end justify-between text-xs font-mono">
                  <div>
                    <span className="block text-[9px] uppercase text-neutral-400 tracking-wider font-sans">
                      Držitel karty
                    </span>
                    <span className="font-semibold text-neutral-200 uppercase truncate max-w-[180px] block">
                      {cardHolder || "JMÉNO PŘÍJMENÍ"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase text-neutral-400 tracking-wider font-sans">
                      Platnost
                    </span>
                    <span className="font-semibold text-neutral-200">
                      {cardExpiry || "MM/RR"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Číslo platební karty
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4111 2222 3333 4444"
                      disabled={isProcessing}
                      className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                    />
                    <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Platnost (MM/RR)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="12/28"
                      disabled={isProcessing}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      placeholder="•••"
                      disabled={isProcessing}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Jméno na kartě
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="JAN NOVÁK"
                    disabled={isProcessing}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                  />
                </div>

                {cardError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{cardError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Tab: APPLE PAY / GOOGLE PAY */}
          {activeTab === "apple_pay" && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-900 dark:text-white">
                <Smartphone className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Expresní biometrická platba
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                  Platba proběhne bezpečně přes vaši digitální peněženku Apple Wallet nebo Google Wallet ověřením Face ID či otiskem prstu.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-3">
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-black hover:bg-neutral-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 border border-neutral-800"
                >
                  <span className="text-xs uppercase font-light tracking-wide">Pay with</span>
                  <span className="font-bold">Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 border border-neutral-300"
                >
                  <span className="text-xs uppercase font-light tracking-wide">Pay with</span>
                  <span className="font-bold text-neutral-900">G Pay</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Tab: OKAMŽITÝ QR KÓD (SPAYD) */}
          {activeTab === "prevod" && (
            <div className="space-y-6 text-center">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Naskenujte QR kód ve svém bankovnictví
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Podporují všechny české banky (Air Bank, ČSOB, Spořitelna, KB, Moneta, Raiffeisen, Revolut).
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl border border-neutral-200 inline-block shadow-md mx-auto">
                <img
                  src={qrCodeUrl}
                  alt={`QR Platba ${formatPrice(order.totalPrice)}`}
                  className="w-48 h-48 object-contain mx-auto"
                />
                <span className="text-[10px] text-neutral-400 font-mono font-semibold block mt-1">
                  Standard SPAYD • Okamžitá platba
                </span>
              </div>

              {/* Copyable Payment details table */}
              <div className="bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Číslo účtu:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {bankAccount}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("2401893452/2010", "account")}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition"
                    >
                      {copiedField === "account" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Částka:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-neutral-900 dark:text-white">
                      {formatPrice(order.totalPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(order.totalPrice), "amount")}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition"
                    >
                      {copiedField === "amount" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Variabilní symbol:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {variableSymbol}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(variableSymbol, "vs")}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition"
                    >
                      {copiedField === "vs" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400">
                Po odeslání platby klikněte na tlačítko níže pro dokončení objednávky.
              </p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
          {activeTab !== "apple_pay" && (
            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Zpracovávám platbu...</span>
                </>
              ) : activeTab === "prevod" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Mám zaplaceno – dokončit objednávku</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Zaplatit {formatPrice(order.totalPrice)}</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Bezpečná 3D Secure autorizace
            </span>
            <span>•</span>
            <span>Okamžité potvrzení</span>
          </div>
        </div>

        {/* 3D Secure / Authorization Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-200">
            {processingStep === "authorizing" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-lg">
                  <RefreshCw className="h-8 w-8 animate-spin text-neutral-300" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Ověřování platební metody...
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Probíhá šifrovaná komunikace s bankovním centrem.
                </p>
              </>
            )}

            {processingStep === "3d_secure" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                  <ShieldCheck className="h-8 w-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  3D Secure 2.0 Ověření
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Platba byla úspěšně schválena vaší bankou.
                </p>
              </>
            )}

            {processingStep === "complete" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg animate-in zoom-in-75">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Platba byla úspěšná!
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Objednávka byla zaevidována a potvrzení odesláno.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
