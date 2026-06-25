"use client";

import { useState } from "react";
import { Mail, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="h-12 w-12 mx-auto mb-6 text-primary-foreground/70" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Odebírejte novinky
          </h2>
          <p className="text-primary-foreground/70 mb-8">
            Získejte 10% slevu na první nákup a buďte první, kdo se dozví o
            nových kolekcích a výhodných nabídkách.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Check className="h-5 w-5" />
              <span className="text-lg">Děkujeme za přihlášení!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground rounded-full"
                required
              />
              <Button
                type="submit"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-8"
              >
                <Send className="h-4 w-4 mr-2" />
                Odeslat
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
