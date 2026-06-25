"use client";

import Link from "next/link";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useStore } from "@/lib/store-context";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Žádné oblíbené položky
        </h1>
        <p className="text-muted-foreground mb-6">
          Přidejte produkty do oblíbených kliknutím na srdíčko.
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Prozkoumat produkty
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 fill-red-500 text-red-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Oblíbené
            </h1>
            <span className="text-muted-foreground">({wishlist.length})</span>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět k nákupu
            </Button>
          </Link>
        </div>

        {/* Clear All Button */}
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => wishlist.forEach((p) => removeFromWishlist(p.id))}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Vymazat vše
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
