"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useStore } from "@/lib/store-context";

const categoryNames: Record<string, string> = {
  "panske-obleceni": "Pánské oblečení",
  "damske-obleceni": "Dámské oblečení",
  "tenisky": "Tenisky",
  "bundy": "Bundy",
  "mikiny": "Mikiny",
  "tricka": "Trička",
  "kalhoty": "Kalhoty",
  "doplnky": "Doplňky",
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { products } = useStore();

  const categoryName = categoryNames[slug] || slug;
  const filteredProducts = products.filter(
    (p) => p.category.toLowerCase().replace(/\s+/g, "-") === slug
  );

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {categoryName}
          </h1>
          <p className="text-muted-foreground mt-2">
            {filteredProducts.length} produktů
          </p>
        </div>

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              V této kategorii momentálně nejsou žádné produkty.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
