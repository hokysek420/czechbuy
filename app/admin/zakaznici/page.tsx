"use client";

import { useEffect, useState } from "react";
import { Search, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCustomers(data as Customer[]);
      }
      setLoading(false);
    };

    loadCustomers();
  }, []);

  const filtered = customers.filter((c) =>
    (c.full_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Zákazníci</h1>
        <p className="text-muted-foreground">Správa zákaznických účtů</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Hledat zákazníky..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Načítání zákazníků...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Žádní zákazníci nenalezeni.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{customer.full_name || "Neznámý uživatel"}</p>
                    {customer.is_admin && <Badge>Admin</Badge>}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{customer.email}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {new Date(customer.created_at).toLocaleDateString("cs-CZ")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
