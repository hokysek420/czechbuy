"use client";

import { useState } from "react";
import { Briefcase, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

const positions = [
  {
    title: "Frontend vývojář",
    location: "Praha / Remote",
    type: "Plný úvazek",
    description: "Hledáme zkušeného frontend vývojáře se znalostí React a Next.js.",
  },
  {
    title: "Zákaznický specialista",
    location: "Praha",
    type: "Plný úvazek",
    description: "Hledáme komunikativního člověka pro zákaznickou podporu.",
  },
  {
    title: "Skladový pracovník",
    location: "Praha",
    type: "Plný úvazek",
    description: "Hledáme spolehlivého pracovníka pro skladové operace.",
  },
];

export default function CareersPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", position: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("contact_messages").insert({
      name: form.name,
      email: form.email,
      subject: `Kariéra: ${form.position}`,
      message: form.message,
    });

    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      setForm({ name: "", email: "", position: "", message: "" });
    }

    setLoading(false);
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Kariéra</h1>
        <p className="text-muted-foreground mb-12">Přidejte se k týmu CzechBuy a tvořte budoucnost e-commerce.</p>

        <div className="space-y-4 mb-12">
          {positions.map((pos) => (
            <Card key={pos.title}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{pos.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{pos.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{pos.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{pos.type}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Poslat žádost</h2>
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">Děkujeme za váš zájem. Ozveme se vám.</p>
                <Button onClick={() => setSent(false)} variant="outline" className="mt-4 rounded-full">
                  Odeslat další žádost
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Jméno *</Label>
                    <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Pozice</Label>
                  <Input id="position" placeholder="Název pozice" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Motivační dopis *</Label>
                  <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <Button type="submit" disabled={loading} className="rounded-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Odeslat žádost
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
