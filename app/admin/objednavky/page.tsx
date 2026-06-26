"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
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

  const filtered = orders.filter((o) =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(search.toLowerCase())
  );

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Zaplaceno</Badge>;
      case "pending": return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Čeká</Badge>;
      case "failed": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Selhalo</Badge>;
      case "refunded": return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Vráceno</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getOrderBadge = (status: string) => {
    switch (status) {
      case "processing": return <Badge variant="outline">Zpracovává se</Badge>;
      case "shipped": return <Badge variant="outline" className="border-blue-300 text-blue-600">Odesláno</Badge>;
      case "delivered": return <Badge variant="outline" className="border-green-300 text-green-600">Doručeno</Badge>;
      case "cancelled": return <Badge variant="outline" className="border-red-300 text-red-600">Zrušeno</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Objednávky</h1>
        <p className="text-muted-foreground">Správa objednávek a plateb</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Hledat objednávky..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
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
                  <div>
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString("cs-CZ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{order.total.toLocaleString("cs-CZ")} Kč</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {getPaymentBadge(order.payment_status)}
                      {getOrderBadge(order.order_status)}
                    </div>
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
