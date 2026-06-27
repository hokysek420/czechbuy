"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Building2, Loader2 } from "lucide-react";
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
    country: "Česká republika",
  });
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/kosik");
    }
  }, [cart, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_name: address.full_name,
          customer_email: profile?.email || user?.email || "",
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
        throw orderError || new Error("Nepodařilo se vytvořit objednávku");
      }

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: getDiscountedPrice(item),
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of cart) {
        await supabase.rpc("decrement_stock", { product_id: item.id, qty: item.quantity });
      }

      // Generate variable symbol for bank transfer
      if (paymentMethod === "bank_transfer") {
        const variableSymbol = String(orderData.id).slice(0, 10).replace(/-/g, "");
        await supabase.from("orders").update({ variable_symbol: variableSymbol }).eq("id", orderData.id);
      }

      clearCart();
      router.push(`/objednavka/${orderData.id}/dekujeme`);
    } catch (err: any) {
      toast({ title: "Chyba", description: err.message || "Nepodařilo se dokončit objednávku.", variant: "destructive" });
    }

    setLoading(false);
  };

  if (cart.length === 0) return null;

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/kosik">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět do košíku
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Dokončení objednávky</h1>
        <p className="text-muted-foreground mb-8">Vyplňte údaje a zvolte způsob platby</p>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Doručovací údaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Jméno a příjmení *</Label>
                    <Input id="full_name" required value={address.full_name} onChange={(e) => setAddress({ ...address, full_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Ulice a číslo popisné *</Label>
                  <Input id="street" required value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Město *</Label>
                    <Input id="city" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">PSČ *</Label>
                    <Input id="zip" required value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Způsob platby</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === "bank_transfer" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
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
                    <Building2 className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold">Bankovní převod</p>
                      <p className="text-sm text-muted-foreground">Zaplaťte převodem na účet</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === "gopay" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
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
                    <CreditCard className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold">GoPay</p>
                      <p className="text-sm text-muted-foreground">Platba kartou nebo online bankou</p>
                    </div>
                  </label>
                </div>
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
                      <span className="font-medium">{(getDiscountedPrice(item) * item.quantity).toLocaleString("cs-CZ")} Kč</span>
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
                  <span className="font-bold text-xl">{cartTotal.toLocaleString("cs-CZ")} Kč</span>
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full py-6 text-lg">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Dokončit objednávku
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
