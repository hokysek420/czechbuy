"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase/client";
import { Order } from "@/lib/types";

export default function OrderThankYouPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      if (data) setOrder(data as Order);
    };
    loadOrder();
  }, [id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Načítání objednávky...</div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Děkujeme za objednávku!</h1>
        <p className="text-muted-foreground mb-8">
          Vaše objednávka byla úspěšně přijata. Informace o stavu vám zašleme na e-mail.
        </p>

        <Card className="text-left">
          <CardHeader>
            <CardTitle>Detaily objednávky #{order.id.slice(0, 8)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Celkem</span>
              <span className="font-bold">{order.total.toLocaleString("cs-CZ")} Kč</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Způsob platby</span>
              <span className="font-medium">
                {order.payment_method === "bank_transfer" ? "Bankovní převod" : "GoPay"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stav</span>
              <span className="font-medium">{order.order_status === "awaiting_payment" ? "Čeká na platbu" : "Zpracovává se"}</span>
            </div>

            {order.payment_method === "bank_transfer" && (
              <>
                <Separator />
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Platební údaje</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Číslo účtu:</span>
                    <span className="font-medium">123456789/0100</span>
                    <span className="text-muted-foreground">Variabilní symbol:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.variable_symbol || "-"}</span>
                      {order.variable_symbol && (
                        <button onClick={() => copyToClipboard(order.variable_symbol!)} className="text-primary hover:underline text-xs">
                          {copied ? "Zkopírováno" : <Copy className="h-3 w-3 inline" />}
                        </button>
                      )}
                    </div>
                    <span className="text-muted-foreground">Částka:</span>
                    <span className="font-medium">{order.total.toLocaleString("cs-CZ")} Kč</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/">
            <Button className="rounded-full">Pokračovat v nákupu</Button>
          </Link>
          <Link href="/profil/objednavky">
            <Button variant="outline" className="rounded-full">Moje objednávky</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
