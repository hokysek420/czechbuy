"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDiscordAuth } from "@/lib/discord-auth-context";
import { getDiscordAvatarUrl } from "@/lib/discord-auth";
import { DiscordUser } from "@/types";
import { Loader2, CheckCircle2 } from "lucide-react";
import { DiscordIcon } from "@/components/ui/social-icons";

export default function DiscordAuthCallbackPage() {
  const router = useRouter();
  const { setSession } = useDiscordAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function processHash() {
      if (typeof window === "undefined") return;

      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const error = params.get("error");
      const errorDesc = params.get("error_description");

      if (error) {
        setStatus("error");
        setErrorMessage(errorDesc || error);
        return;
      }

      if (!accessToken) {
        // Check if there is an error in query params instead
        const searchParams = new URLSearchParams(window.location.search);
        const queryError = searchParams.get("error");
        if (queryError) {
          setStatus("error");
          setErrorMessage(queryError);
          return;
        }

        setStatus("error");
        setErrorMessage("Nebyl nalezen žádný přístupový token.");
        return;
      }

      try {
        // 1. Fetch user from Discord API
        const userRes = await fetch("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userRes.ok) {
          throw new Error("Nepodařilo se ověřit Discord uživatele.");
        }

        const rawUser = await userRes.json();

        // 2. Fetch Guild Member & all server roles status from server API
        const isHardcodedOwner = rawUser.id === "1492628172611518504";

        let isMember = isHardcodedOwner;
        let isOwner = isHardcodedOwner;
        let isAdmin = isHardcodedOwner;
        let isMod = isHardcodedOwner;
        let isVip = isHardcodedOwner;
        let roleName: string | null = isHardcodedOwner ? "Owner" : null;
        let roleColor: string | null = isHardcodedOwner ? "#f43f5e" : null;
        let roles: string[] = isHardcodedOwner
          ? ["1567522100523040914", "1567522107393581176", "1567522110648221797"]
          : [];
        let roleBadges: { id: string; name: string; color: string }[] = isHardcodedOwner
          ? [
              { id: "owner", name: "Owner", color: "#f43f5e" },
              { id: "1567522100523040914", name: "Founder / Admin", color: "#6366f1" },
              { id: "1567522107393581176", name: "VIP Customer", color: "#f59e0b" },
              { id: "1567522110648221797", name: "CzechBuy Fam", color: "#a855f7" },
            ]
          : [];

        try {
          const roleRes = await fetch(`/api/auth/discord/member-vip?userId=${rawUser.id}`);
          if (roleRes.ok) {
            const roleData = await roleRes.json();
            const rs = roleData?.roleStatus || roleData?.vipStatus;
            if (rs) {
              isMember = Boolean(rs.isMember || rs.isCzechBuyFam || isHardcodedOwner);
              isOwner = Boolean(rs.isOwner || isHardcodedOwner);
              isAdmin = Boolean(rs.isAdmin || isOwner);
              isMod = Boolean(rs.isMod || isOwner);
              isVip = Boolean(rs.isVip || isOwner);
              roleName = isOwner ? "Owner" : (rs.roleName || null);
              roleColor = isOwner ? "#f43f5e" : (rs.roleColor || null);
              roles = rs.roles && rs.roles.length > 0 ? rs.roles : roles;
              if (rs.roleBadges && rs.roleBadges.length > 0) {
                roleBadges = rs.roleBadges;
              }
            }
          }
        } catch {
          // fallback
        }

        const discordUser: DiscordUser = {
          id: rawUser.id,
          username: rawUser.username,
          global_name: rawUser.global_name,
          discriminator: rawUser.discriminator,
          avatar: rawUser.avatar,
          avatarUrl: getDiscordAvatarUrl({
            id: rawUser.id,
            avatar: rawUser.avatar,
            discriminator: rawUser.discriminator,
          }),
          email: rawUser.email || null,
          verified: Boolean(rawUser.verified),
          isCzechBuyFam: isMember,
          isVip,
          isOwner,
          isAdmin,
          isMod,
          roleName,
          roleColor,
          roles,
          roleBadges,
          joinedAt: new Date().toISOString(),
        };

        // If Owner or Admin, issue admin cookies immediately for seamless 1-click access
        if (isOwner || isAdmin) {
          try {
            document.cookie = "czechbuy_admin_session=authenticated_session_token; path=/; max-age=2592000; SameSite=Lax";
            document.cookie = "czechbuy_admin_token=authenticated_session_token; path=/; max-age=2592000; SameSite=Lax";
            document.cookie = "czechbuy_admin_active=true; path=/; max-age=2592000; SameSite=Lax";
          } catch {}
        }

        setSession(discordUser);
        setStatus("success");

        setTimeout(() => {
          if (isOwner || isAdmin) {
            router.push("/interni-portal-8f2a9x/sprava");
          } else {
            router.push("/brzy-otevirame?logged=1");
          }
        }, 1200);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Chyba při komunikaci s Discordem.");
      }
    }

    processHash();
  }, [router, setSession]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center mx-auto text-[#5865F2]">
          <DiscordIcon className="h-8 w-8" />
        </div>

        {status === "loading" && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#5865F2]" />
              <span>Ověřování přes Discord...</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Připojujeme váš účet a ověřujeme VIP roli na serveru CzechBuy.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Přihlášení úspěšné!</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Vítejte zpět! Přesměrováváme vás do e-shopu...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400">
              Přihlášení se nezdařilo
            </h2>
            <p className="text-xs text-neutral-500">
              {errorMessage || "Zkuste to prosím znovu nebo využijte testovací přihlášení."}
            </p>
            <button
              onClick={() => router.push("/prihlaseni")}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
            >
              Zpět na přihlášení
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
