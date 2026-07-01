"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, Building2, Mail, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Order, OrderItem } from "@/lib/types";

interface OrderWithItems extends Order {
  items?: OrderItem[];
}

export default function OrderThankYouPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (orderData) {
        // Load order items
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderData.id);

        setOrder({ ...orderData, items } as OrderWithItems);
      }
    };
    loadOrder();
  }, [id]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // Bank account details (these would typically come from settings)
  const bankDetails = {
    account_number: "1234567890/2010",
    account_name: "CzechBuy s.r.o.",
    iban: "CZ6520100000001234567890",
    swift_bic: "FIOBCZPP",
  };

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Nacítání objednávky...</div>
      </div>
    );
  }

  const isPaid = order.payment_status === "paid";
  const isAwaitingPayment = order.payment_status === "awaiting_payment";

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Dkujeme za objednávku!</h1>
        <p className="text-muted-foreground mb-8">
          {isPaid
            ? "Vase platba byla úspesne prijata. Zacneme zpracovávat objednávku."
            : isAwaitingPayment && order.payment_method === "bank_transfer"
            ? "Vase objednávka byla prijata. Cesím platbu bankovním prevodem."
            : "Vase objednávka byla úspesne prijata."}
        </p>

        <div className="space-y-4">
          {/* Order Summary */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Detaily objednávky #{order.id.slice(0, 8)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Celkem</span>
                <span className="font-bold text-lg">{order.total.toLocaleString("cs-CZ")} Kc</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zpsob platby</span>
                <span className="font-medium flex items-center gap-2">
                  {order.payment_method === "bank_transfer" ? (
                    <>
                      <Building2 className="h-4 w-4" />
                      Bankovní prevod
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      GoPay {isPaid && "(zaplaceno)"}
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stav platby</span>
                <span
                  className={`font-medium ${
                    isPaid
                      ? "text-green-600 dark:text-green-500"
                      : isAwaitingPayment
                      ? "text-yellow-600 dark:text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {isPaid
                    ? "Zaplaceno"
                    : isAwaitingPayment
                    ? "Ceká na úhradu"
                    : "Zpracovávan"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stav objednávky</span>
                <span className="font-medium">
                  {order.order_status === "awaiting_payment"
                    ? "Ceká na platbu"
                    : order.order_status === "paid"
                    ? "Zaplaceno"
                    : order.order_status === "processing"
                    ? "Zpracovávan"
                    : order.order_status === "shipped"
                    ? "Odesláno"
                    : "Zpracovávan"}
                </span>
              </div>

              {/* Bank Transfer Details */}
              {order.payment_method === "bank_transfer" && isAwaitingPayment && (
                <>
                  <Separator />
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Platební údaje pro prevod</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pro úhradu objednávky prosím proveáte bankovní prevod na následující úcet.
                      Jako variabilní symbol uvete vase císlo objednávky.
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <span className="text-muted-foreground">Císlo úctu:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono">{bankDetails.account_number}</span>
                        <button
                          onClick={() => copyToClipboard(bankDetails.account_number, "account")}
                          className="text-primary hover:underline text-xs"
                        >
                          {copied === "account" ? "Zkopírováno" : <Copy className="h-3 w-3" />}
                        </button>
                      </div>

                      <span className="text-muted-foreground">IBAN:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono text-xs">{bankDetails.iban}</span>
                        <button
                          onClick={() => copyToClipboard(bankDetails.iban, "iban")}
                          className="text-primary hover:underline text-xs"
                        >
                          {copied === "iban" ? "Zkopírováno" : <Copy className="h-3 w-3" />}
                        </button>
                      </div>

                      <span className="text-muted-foreground">SWIFT/BIC:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono">{bankDetails.swift_bic}</span>
                        <button
                          onClick={() => copyToClipboard(bankDetails.swift_bic, "swift")}
                          className="text-primary hover:underline text-xs"
                        >
                          {copied === "swift" ? "Zkopírováno" : <Copy className="h-3 w-3" />}
                        </button>
                      </div>

                      <span className="text-muted-foreground">Variabilní symbol:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary font-mono">
                          {order.variable_symbol || order.id.slice(0, 8)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(order.variable_symbol || order.id.slice(0, 8), "vs")}
                          className="text-primary hover:underline text-xs"
                        >
                          {copied === "vs" ? "Zkopírováno" : <Copy className="h-3 w-3" />}
                        </button>
                      </div>

                      <span className="text-muted-foreground">Cástka k úhrade:</span>
                      <span className="font-bold text-lg">{order.total.toLocaleString("cs-CZ")} Kc</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Platební údaje vám také zasíláme na e-mail: {order.customer_email && (
                        <span className="text-foreground font-medium">{order.customer_email}</span>
                      )}
                    </p>
                  </div>
                </>
              )}

              {/* GoPay Payment Confirmation */}
              {order.payment_method === "gopay" && isPaid && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Platba úspesne zpracována</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vase platba byla zaevidována pod ID: {order.payment_reference}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email notification */}
          <Card className="text-left bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Potvrzení zasíláme na e-mail</p>
                  <p className="text-muted-foreground">
                    Detaily objednávky jsme odeslali na{" "}
                    <span className="text-foreground font-medium">{order.customer_email}</span>.
                    Overte prosím i slozku SPAM.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto rounded-full">
                Pokracovat v nákupu
              </Button>
            </Link>
            {user ? (
              <Link href="/profil/objednavky">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full">
                  Mé objednávky
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
