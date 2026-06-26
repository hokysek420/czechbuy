"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, ArrowLeft, Check, Truck, RotateCcw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, Product } from "@/lib/store-context";
import { supabase } from "@/lib/supabase/client";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, isInCart, addToWishlist, isInWishlist, getDiscountedPrice } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (!error && data) {
        setProduct({
          ...data,
          category_name: data.categories?.name,
        } as Product);
      }
      setLoading(false);
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Načítání produktu...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Produkt nenalezen</h1>
        <p className="text-muted-foreground mb-6">Tento produkt již není dostupný.</p>
        <Link href="/">
          <Button className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na hlavní stránku
          </Button>
        </Link>
      </div>
    );
  }

  const discountedPrice = getDiscountedPrice(product);
  const hasSale = product.sale_percentage > 0;
  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.pexels.com/photos/297928/pexels-photo-297928.jpeg?auto=compress&cs=tinysrgb&w=600"];

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na nákup
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {hasSale && (
                <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-lg">
                  -{product.sale_percentage}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.category_name || "Oblečení"}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {discountedPrice.toLocaleString("cs-CZ")} Kč
              </span>
              {hasSale && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.price.toLocaleString("cs-CZ")} Kč
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>SKU: <strong className="text-foreground">{product.sku}</strong></span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>Skladem: <strong className="text-foreground">{product.stock_quantity} ks</strong></span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-4 py-2 hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
              <Button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) addToCart(product);
                }}
                className={`flex-1 rounded-full ${
                  inCart
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {inCart ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    V košíku
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Přidat do košíku
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => addToWishlist(product)}
                className="rounded-full"
              >
                <Heart
                  className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Doprava zdarma nad 5000 Kč</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">30 dní na vrácení</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">2 roky záruka</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
