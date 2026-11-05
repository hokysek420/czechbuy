"use client";

import React, { useState } from "react";
import { MessageSquarePlus, ExternalLink, Loader2, CheckCircle2, AlertCircle, Crown, Package, RotateCcw, HelpCircle, X } from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";
import { useDiscordAuth } from "@/lib/discord-auth-context";

interface DiscordTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: any) => void;
  defaultOrderNumber?: string;
}

export function DiscordTicketModal({
  isOpen,
  onClose,
  onTicketCreated,
  defaultOrderNumber = "",
}: DiscordTicketModalProps) {
  const { user, isLoggedIn, login } = useDiscordAuth();
  const [category, setCategory] = useState<"order" | "exchange" | "vip" | "general">("order");
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<{
    channelName: string;
    discordUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  const isOwner = Boolean(
    user?.isOwner ||
    user?.id === "1492628172611518504" ||
    user?.username === "hokysek" ||
    user?.roles?.includes("1567522100523040914")
  );
  const isVip = Boolean(isOwner || user?.isVip || user?.roles?.includes("1567522107393581176"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!message.trim()) {
      setError("Zadejte prosím stručný popis vašeho dotazu či požadavku.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/discord/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          userRole: isOwner ? "Owner" : isVip ? "VIP Customer" : user.roleName || "Člen",
          category,
          orderNumber: orderNumber.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Nepodařilo se vytvořit ticket na Discordu.");
      }

      setCreatedTicket({
        channelName: data.channelName,
        discordUrl: data.discordUrl,
      });

      if (onTicketCreated) {
        onTicketCreated(data);
      }
    } catch (err: any) {
      setError(err.message || "Chyba při komunikaci se serverem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCreatedTicket(null);
    setMessage("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2] shrink-0">
            <DiscordIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-neutral-950 dark:text-white">
                Zákaznický Discord Ticket
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Live Support
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Vytvoří soukromý kanál na serveru <strong>CzechBuy Fam</strong> pro přímou komunikaci s podporou.
            </p>
          </div>
        </div>

        {!isLoggedIn || !user ? (
          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-center space-y-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Pro otevření ticketu je nutné se přihlásit Discordem, aby se pro vás mohl vytvořit privátní kanál.
            </p>
            <button
              type="button"
              onClick={login}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-wider shadow-md transition"
            >
              <DiscordIcon className="h-4 w-4" />
              <span>Přihlásit se přes Discord</span>
            </button>
          </div>
        ) : createdTicket ? (
          /* Success Screen */
          <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                Váš ticket byl úspěšně založen!
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                Na Discordu byl vytvořen váš privátní kanál <strong>#{createdTicket.channelName}</strong>. Náš tým byl notifikován.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={createdTicket.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-wider shadow-md transition"
              >
                <span>Otevřít ticket na Discordu</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-3 px-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-xs transition hover:bg-neutral-300 dark:hover:bg-neutral-700"
              >
                Hotovo
              </button>
            </div>
          </div>
        ) : (
          /* Ticket Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Kategorie požadavku
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory("order")}
                  className={`p-3 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition ${
                    category === "order"
                      ? "border-[#5865F2] bg-[#5865F2]/10 text-[#5865F2]"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <Package className="h-4 w-4 shrink-0" />
                  <span className="truncate">Objednávka</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory("exchange")}
                  className={`p-3 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition ${
                    category === "exchange"
                      ? "border-[#5865F2] bg-[#5865F2]/10 text-[#5865F2]"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span className="truncate">Reklamace / Výměna</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory("vip")}
                  className={`p-3 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition ${
                    category === "vip"
                      ? "border-amber-500 bg-amber-500/10 text-amber-500"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <Crown className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="truncate">VIP Prioritní dotaz</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory("general")}
                  className={`p-3 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition ${
                    category === "general"
                      ? "border-[#5865F2] bg-[#5865F2]/10 text-[#5865F2]"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate">Všeobecný dotaz</span>
                </button>
              </div>
            </div>

            {/* Order Number (if order or exchange) */}
            {(category === "order" || category === "exchange") && (
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Číslo objednávky (volitelné)
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="např. CZB-2024-XXXX"
                  className="w-full text-xs py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                />
              </div>
            )}

            {/* Message Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Popis vašeho dotazu *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Napište nám, s čím vám můžeme pomoci..."
                className="w-full text-xs p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5865F2] resize-none"
              />
            </div>

            {/* User Pill */}
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-bold text-neutral-900 dark:text-white">
                  @{user.username}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isOwner ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" : isVip ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              }`}>
                {isOwner ? "Owner" : isVip ? "VIP Customer" : user.roleName || "Člen"}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Vytvářím ticket na Discordu...</span>
                </>
              ) : (
                <>
                  <MessageSquarePlus className="h-4 w-4" />
                  <span>Odeslat & Založit Discord Ticket</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
