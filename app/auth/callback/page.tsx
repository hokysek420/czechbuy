"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/prihlaseni");
        return;
      }

      const { data: existing } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from("user_profiles").insert({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
        });
      }

      router.push("/profil");
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Dokončování přihlášení...</div>
    </div>
  );
}
