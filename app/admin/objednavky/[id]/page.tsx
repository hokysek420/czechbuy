"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Order, OrderItem, OrderStatus, PaymentStatus } from "@/lib/types";

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Čeká",
  awaiting_payment: "Čeká na platbu",
  paid: "Zaplaceno",
  processing: "Zpracovává se",
  shipped: "Odesláno",
  delivered: "Doručeno",
  cancelled: "Zrušeno",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Čeká",
  awaiting_payment: "Čeká na platbu",
  paid: "Zaplaceno",
  failed: "Selhalo",
  refunded: "Vráceno",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      const { data: orderData } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      if (orderData) {
        setOrder(orderData as Order);
        setOrderStatus(orderData.order_status as OrderStatus);
        setPaymentStatus(orderData.payment_status as PaymentStatus);
      }

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*, products(name, images)")
        .eq("order_id", id);

      if (itemsData) {
        setItems(itemsData.map((i: any) => ({
          ...i,
          product_name: i.products?.name,
          product_image: i.products?.images?.[0],
        })));
      }
      setLoading(false);
    };

    loadOrder();
  }, [id]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);

    const { error } = await supabase
      .from("orders")
      .update({ order_status: orderStatus, payment_status: paymentStatus })
      .eq("id", order.id);

    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Uloženo", description: "Stav objednávky byl aktualizován." });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Načítání...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Objednávka nenalezena.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/objednavky">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na objednávky
          </Button>
        </Link>
        <Button onClick={handleSave} disabled={saving} className="rounded-full">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Uložit změny
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Objednávka #{order.id.slice(0, 8)}</h1>
        <p className="text-muted-foreground">
          {new Date(order.created_at).toLocaleDateString("cs-CZ")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stav objednávky</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={orderStatus} onValueChange={(v) => setOrderStatus(v as OrderStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stav platby</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zákazník</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-muted-foreground">{order.customer_email}</p>
          {order.phone && <p className="text-muted-foreground">{order.phone}</p>}
          {order.shipping_address && (
            <p className="text-muted-foreground text-sm mt-2">
              {order.shipping_address.street}, {order.shipping_address.zip} {order.shipping_address.city}, {order.shipping_address.country}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Položky objednávky</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.product_image && (
                    <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product_name || "Produkt"}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} ks x {item.unit_price.toLocaleString("cs-CZ")} Kč</p>
                </div>
                <span className="font-semibold">{(item.quantity * item.unit_price).toLocaleString("cs-CZ")} Kč</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t">
            <span className="font-bold">Celkem</span>
            <span className="font-bold text-xl">{order.total.toLocaleString("cs-CZ")} Kč</span>
          </div>
        </CardContent>
      </Card>

      {order.payment_method === "bank_transfer" && order.variable_symbol && (
        <Card>
          <CardHeader>
            <CardTitle>Platební údaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Variabilní symbol:</span>
              <span className="font-medium">{order.variable_symbol}</span>
              <span className="text-muted-foreground">Číslo účtu:</span>
              <span className="font-medium">123456789/0100</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
