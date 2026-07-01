"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Building2, Loader2, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { ShippingAddress, PaymentMethod } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { cart, cartTotal, getDiscountedPrice, clearCart } = useStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [address, setAddress] = useState<ShippingAddress>({
    full_name: profile?.full_name || "",
    street: "",
    city: "",
    zip: "",
    country: "Ceska republika",
  });
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/kosik");
    }
  }, [cart, router]);

  // Handle GoPay return callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");
    const orderId = params.get("order_id");
    const status = params.get("status");

    if (paymentId && orderId && status && verifyingPayment) {
      verifyGoPayPayment(orderId, paymentId, status);
    }
  }, [verifyingPayment]);

  const verifyGoPayPayment = async (orderId: string, paymentId: string, status: string) => {
    setVerifyingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("gopay-verify", {
        body: { order_id: orderId, payment_id: paymentId, status: status },
      });

      if (error) throw error;

      if (data?.payment_status === "paid") {
        toast({
          title: "Platba uspesna",
          description: "Vase platba byla uspesne zpracovana.",
        });
        clearCart();
        router.push(`/objednavka/${orderId}/dekujeme`);
      } else {
        toast({
          title: "Platba zamitnuta",
          description: "Platba se nepodarila. Zkuste to prosim znovu.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Chyba",
        description: err.message || "Nepodarilo se overit platbu.",
        variant: "destructive",
      });
    } finally {
      setVerifyingPayment(false);
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const createGoPayPayment = async (orderId: string) => {
    try {
      const returnUrl = `${window.location.origin}/pokladna`;

      const { data, error } = await supabase.functions.invoke("gopay-payment", {
        body: {
          order_id: orderId,
          amount: cartTotal,
          currency: "CZK",
          description: `Objednavka ${orderId.slice(0, 8)}`,
          return_url: returnUrl,
          customer_email: email || profile?.email || user?.email || "",
        },
      });

      if (error) throw error;

      if (data?.payment_url) {
        setVerifyingPayment(true);
        window.location.href = data.payment_url;
      }
    } catch (err: any) {
      toast({
        title: "Chyba",
        description: err.message || "Nepodarilo se vytvorit platbu.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);

    try {
      const emailToUse = email || profile?.email || user?.email || "";
      if (!emailToUse) {
        toast({
          title: "Chyba",
          description: "Prosim zadejte e-mail pro potvrzeni objednavky.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_name: address.full_name,
          customer_email: emailToUse,
          total: cartTotal,
          payment_status: paymentMethod === "bank_transfer" ? "awaiting_payment" : "pending",
          order_status: paymentMethod === "bank_transfer" ? "awaiting_payment" : "pending",
          payment_method: paymentMethod,
          shipping_address: address,
          phone: phone || null,
        })
        .select()
        .single();

      if (orderError || !orderData) {
        throw orderError || new Error("Nepodarilo se vytvorit objednavku");
      }

      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: getDiscountedPrice(item),
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      for (const item of cart) {
        await supabase.rpc("decrement_stock", { product_id: item.id, qty: item.quantity });
      }

      if (paymentMethod === "bank_transfer") {
        const variableSymbol = String(orderData.id).slice(0, 10).replace(/-/g, "");
        await supabase.from("orders").update({ variable_symbol: variableSymbol }).eq("id", orderData.id);

        clearCart();
        router.push(`/objednavka/${orderData.id}/dekujeme`);
      } else if (paymentMethod === "gopay") {
        await createGoPayPayment(orderData.id);
      }
    } catch (err: any) {
      toast({
        title: "Chyba",
        description: err.message || "Nepodarilo se dokoncit objednavku.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/kosik">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpet do kosiku
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Dokonceni objednavky</h1>
        <p className="text-muted-foreground mb-8">Vyplnte udaje a zvolte zpusob platby</p>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dorucovaci udaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email field - especially important for guests */}
                {!(user || profile) && (
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        placeholder="vas@email.cz"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Potvrzeni objednavky vam zasleme na tento e-mail.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Jmeno a prijmeni *</Label>
                    <Input
                      id="full_name"
                      required
                      value={address.full_name}
                      onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Ulice a cislo popisne *</Label>
                  <Input
                    id="street"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Mesto *</Label>
                    <Input
                      id="city"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">PSC *</Label>
                    <Input
                      id="zip"
                      required
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zpusob platby</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === "bank_transfer"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={() => setPaymentMethod("bank_transfer")}
                      className="sr-only"
                    />
                    <Building2 className="h-6 w-6 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">Bankovni prevod</p>
                      <p className="text-sm text-muted-foreground">Zaplatte prevodem na ucet, zpracujeme po prijeti platby</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === "gopay"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="gopay"
                      checked={paymentMethod === "gopay"}
                      onChange={() => setPaymentMethod("gopay")}
                      className="sr-only"
                    />
                    <CreditCard className="h-6 w-6 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold flex items-center gap-2">
                        GoPay
                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded">
                          Okamzite
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">Platba kartou, online bankou nebo platebni branou GoPay</p>
                    </div>
                  </label>
                </div>

                {paymentMethod === "gopay" && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Po potvrzeni objednavky budete presmerovani na platebni branu GoPay,
                      kde muzete zaplatit kartou (Visa, Mastercard), online bankovnictvim
                      nebo dalsimi dostupnymi metodami.
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.1/flags/4x3/cz.svg" alt="CZ" className="h-4 w-6 rounded" />
                      <span className="text-xs text-muted-foreground">VISA, Mastercard, Apple Pay, Google Pay</span>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank_transfer" && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Po odeslani objednavky obdrzite bankovni udaje pro platbu.
                      Zpracujeme objednavku po prijeti platby (zpravidla do 1-2 pracovnich dnu).
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Souhrn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                      <span className="font-medium">{(getDiscountedPrice(item) * item.quantity).toLocaleString("cs-CZ")} Kc</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doprava</span>
                  <span className="text-green-600 dark:text-green-500">Zdarma</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold text-lg">Celkem</span>
                  <span className="font-bold text-xl">{cartTotal.toLocaleString("cs-CZ")} Kc</span>
                </div>
                <Button
                  type="submit"
                  disabled={loading || verifyingPayment}
                  className="w-full rounded-full py-6 text-lg"
                >
                  {loading || verifyingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {verifyingPayment ? "Overovani platby..." : "Zpracovani..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Dokoncit objednavku
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Odeslanim objednavky souhlasite s{" "}
                  <Link href="/obchodni-podminky" className="text-primary hover:underline">
                    obchodnimi podminkami
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
