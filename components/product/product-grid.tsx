"use client";

import { ProductCard } from "./product-card";
import { useStore } from "@/lib/store-context";

export function ProductGrid() {
  const { products } = useStore();

  return (
    <section id="produkty" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Naše produkty
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Objevte široký výběr prémiového oblečení a doplňků. Všechny kousky
            vybíráme s důrazem na kvalitu a styl.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Načítání produktů...</p>
          </div>
        )}
      </div>
    </section>
  );
}
