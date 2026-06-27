"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { supabase } from "@/lib/supabase/client";
import { Product } from "@/lib/types";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      if (!slug) return;

      const { data: category } = await supabase
        .from("categories")
        .select("id, name")
        .eq("slug", slug)
        .maybeSingle();

      if (category) {
        setCategoryName(category.name);
        const { data } = await supabase
          .from("products")
          .select("*, categories(name)")
          .eq("category_id", category.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (data) {
          setProducts(data.map((p: any) => ({ ...p, category_name: p.categories?.name })));
        }
      }
      setLoading(false);
    };

    loadCategory();
  }, [slug]);

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na hlavní stránku
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">{categoryName || "Kategorie"}</h1>
        <p className="text-muted-foreground mb-8">
          {products.length} produktů v této kategorii
        </p>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Načítání...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            V této kategorii zatím nejsou žádné produkty.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
