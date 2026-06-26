"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Product } from "@/lib/store-context";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data.map((p: any) => ({ ...p, category_name: p.categories?.name })));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento produkt?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({ title: "Chyba", description: "Nepodařilo se smazat produkt.", variant: "destructive" });
    } else {
      toast({ title: "Produkt smazán", description: "Produkt byl úspěšně odstraněn." });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const toggleVisibility = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (error) {
      toast({ title: "Chyba", description: "Nepodařilo se změnit viditelnost.", variant: "destructive" });
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      );
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produkty</h1>
          <p className="text-muted-foreground">Správa produktového katalogu</p>
        </div>
        <Link href="/admin/produkty/novy">
          <Button className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Nový produkt
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Hledat produkty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Načítání produktů...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Žádné produkty nenalezeny.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((product) => (
            <Card key={product.id} className={!product.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={product.images?.[0] || "https://images.pexels.com/photos/297928/pexels-photo-297928.jpeg?auto=compress&cs=tinysrgb&w=600"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {product.sku} | Skladem: {product.stock_quantity} ks</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold">{product.price.toLocaleString("cs-CZ")} Kč</span>
                    {product.sale_percentage > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded-full">
                        -{product.sale_percentage}%
                      </span>
                    )}
                    {!product.is_active && (
                      <span className="text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        Skrytý
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleVisibility(product)} title={product.is_active ? "Skrýt" : "Zobrazit"}>
                    {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Link href={`/admin/produkty/${product.id}`}>
                    <Button variant="ghost" size="icon" title="Upravit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} title="Smazat" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
