"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store-context";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, getDiscountedPrice } = useStore();

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Košík je prázdný
        </h1>
        <p className="text-muted-foreground mb-6">
          Přidejte nějaké produkty do košíku a vraťte se zpět.
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět k nákupu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Nákupní košík
          </h1>
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Pokračovat v nákupu
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const price = getDiscountedPrice(item);
              const hasSale = item.sale_percentage > 0;
              const imageUrl = item.images && item.images.length > 0
                ? item.images[0]
                : "https://images.pexels.com/photos/297928/pexels-photo-297928.jpeg?auto=compress&cs=tinysrgb&w=600";

              return (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-40 h-48 sm:h-40 flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 160px"
                      />
                      {hasSale && (
                        <span className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                          -{item.sale_percentage}%
                        </span>
                      )}
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {item.category_name || "Oblečení"}
                          </p>
                          <h3 className="font-semibold text-card-foreground">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-lg font-bold text-card-foreground">
                              {price.toLocaleString("cs-CZ")} Kč
                            </p>
                            {hasSale && (
                              <span className="text-sm text-muted-foreground line-through">
                                {item.price.toLocaleString("cs-CZ")} Kč
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="h-8 w-8 rounded-full"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="h-8 w-8 rounded-full"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <p className="font-semibold text-foreground">
                          {(price * item.quantity).toLocaleString("cs-CZ")} Kč
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Odebrat
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Souhrn objednávky</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mezisoučet</span>
                  <span className="text-foreground">{cartTotal.toLocaleString("cs-CZ")} Kč</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Doprava</span>
                  <span className="text-green-600 dark:text-green-500">Zdarma</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg text-foreground">Celkem</span>
                  <span className="font-bold text-xl text-foreground">
                    {cartTotal.toLocaleString("cs-CZ")} Kč
                  </span>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg">
                  Přejít k pokladně
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Doprava zdarma při nákupu nad 5000 Kč
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
