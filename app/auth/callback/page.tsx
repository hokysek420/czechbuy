"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle, Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange code for session if present (for OAuth flow)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Code exchange error:", exchangeError);
            // Continue anyway, the session might already be established
          }
        }

        // Wait a moment for the session to be established
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setStatus("error");
          setErrorMessage(sessionError.message);
          setTimeout(() => router.push("/prihlaseni"), 3000);
          return;
        }

        if (!session) {
          console.error("No session found");
          setStatus("error");
          setErrorMessage("No se podarilo overit prihlásení.");
          setTimeout(() => router.push("/prihlaseni"), 3000);
          return;
        }

        // Check if user profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileCheckError) {
          console.error("Profile check error:", profileCheckError);
        }

        // Create profile if it doesn't exist (for OAuth users)
        if (!existingProfile) {
          const metaData = session.user.user_metadata || {};
          const profileData = {
            id: session.user.id,
            email: session.user.email!,
            full_name: metaData.full_name || metaData.name || null,
            avatar_url: metaData.avatar_url || metaData.picture || null,
          };

          const { error: insertError } = await supabase.from("user_profiles").insert(profileData);

          if (insertError) {
            console.error("Profile insert error:", insertError);
            // Continue anyway, the profile might already exist due to trigger
          }
        }

        setStatus("success");

        // Get the redirect URL from metadata or default to profile page
        const redirectTo = session.user.user_metadata?.redirect_to || "/profil";
        setTimeout(() => router.push(redirectTo), 1500);
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Neznámá chyba");
        setTimeout(() => router.push("/prihlaseni"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h1 className="text-xl font-semibold">Dokoncování prihlásení...</h1>
          <p className="text-muted-foreground">Prosim vyckejte, overujeme vá ucet.</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h1 className="text-xl font-semibold">Prihlásení úspesné!</h1>
          <p className="text-muted-foreground">Presmerováváme vás...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 text-destructive">
          <h1 className="text-xl font-semibold">Chyba prihlásení</h1>
          <p className="text-muted-foreground">
            {errorMessage || "Nepodarilo se dokoncit prihlásení."}
          </p>
          <p className="text-sm text-muted-foreground">Presmerováváme na stránku pro prihlásení...</p>
        </div>
      )}
    </div>
  );
}
