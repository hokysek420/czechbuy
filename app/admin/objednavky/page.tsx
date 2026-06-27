"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    loadOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      (o.variable_symbol?.includes(search) ?? false);
    const matchesStatus = statusFilter === "all" || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Objednávky</h1>
        <p className="text-muted-foreground">Správa objednávek a plateb</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hledat objednávky..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Vše
          </Button>
          {Object.entries(orderStatusLabels).map(([status, label]) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status as OrderStatus)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Načítání objednávek...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Žádné objednávky nenalezeny.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">Objednávka #{order.id.slice(0, 8)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${orderStatusColors[order.order_status]}`}>
                        {orderStatusLabels[order.order_status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
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
                    <Link href={`/admin/objednavky/${order.id}`}>
                      <Button variant="ghost" size="icon" title="Detail">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
