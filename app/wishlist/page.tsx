"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store-context";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const { wishlist, removeFromWishlist, addToCart, isInCart, getDiscountedPrice } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/prihlaseni");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Načítání...</div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Oblíbené je prázdné</h1>
        <p className="text-muted-foreground mb-6">Přidejte produkty do oblíbených.</p>
        <Link href="/">
          <Button className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na nákup
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Oblíbené</h1>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Pokračovat v nákupu
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const price = getDiscountedPrice(product);
            const hasSale = product.sale_percentage > 0;
            const imageUrl = product.images && product.images.length > 0
              ? product.images[0]
              : "https://images.pexels.com/photos/297928/pexels-photo-297928.jpeg?auto=compress&cs=tinysrgb&w=600";

            return (
              <Card key={product.id} className="overflow-hidden">
                <Link href={`/produkt/${product.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image src={imageUrl} alt={product.name} fill className="object-cover" />
                    {hasSale && (
                      <span className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                        -{product.sale_percentage}%
                      </span>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/produkt/${product.id}`}>
                    <h3 className="font-semibold text-sm mb-1 hover:underline">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold">{price.toLocaleString("cs-CZ")} Kč</span>
                    {hasSale && (
                      <span className="text-xs text-muted-foreground line-through">
                        {product.price.toLocaleString("cs-CZ")} Kč
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addToCart(product)}
                      className="flex-1 rounded-full"
                      size="sm"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {isInCart(product.id) ? "V košíku" : "Do košíku"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromWishlist(product.id)}
                      className="rounded-full"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
