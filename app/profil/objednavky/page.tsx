"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Order, OrderStatus, PaymentStatus } from "@/lib/types";

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Čeká",
  awaiting_payment: "Čeká na platbu",
  paid: "Zaplaceno",
  processing: "Zpracovává se",
  shipped: "Odesláno",
  delivered: "Doručeno",
  cancelled: "Zrušeno",
};

const orderStatusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  awaiting_payment: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  paid: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  processing: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Čeká",
  awaiting_payment: "Čeká na platbu",
  paid: "Zaplaceno",
  failed: "Selhalo",
  refunded: "Vráceno",
};

export default function ProfileOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/prihlaseni");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }
      setOrdersLoading(false);
    };

    loadOrders();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/profil">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na profil
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Moje objednávky</h1>
        <p className="text-muted-foreground mb-8">Historie vašich objednávek</p>

        {ordersLoading ? (
          <div className="text-center py-16 text-muted-foreground">Načítání objednávek...</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Zatím nemáte žádné objednávky.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">Objednávka #{order.id.slice(0, 8)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${orderStatusColors[order.order_status]}`}>
                          {orderStatusLabels[order.order_status]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("cs-CZ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{order.total.toLocaleString("cs-CZ")} Kč</p>
                        <p className="text-xs text-muted-foreground">
                          {paymentStatusLabels[order.payment_status]}
                        </p>
                        {order.variable_symbol && (
                          <p className="text-xs text-muted-foreground">VS: {order.variable_symbol}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
