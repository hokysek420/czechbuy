"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-context";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart, addToWishlist, isInWishlist, getDiscountedPrice } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const discountedPrice = getDiscountedPrice(product);
  const hasSale = product.sale_percentage > 0;

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : "https://images.pexels.com/photos/297928/pexels-photo-297928.jpeg?auto=compress&cs=tinysrgb&w=600";

  return (
    <div
      className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasSale && (
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-lg">
            -{product.sale_percentage}%
          </span>
        </div>
      )}

      <button
        onClick={() => addToWishlist(product)}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-card hover:scale-110 transition-all duration-300 border border-border"
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            inWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
          }`}
        />
      </button>

      <Link href={`/produkt/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <div
            className={`absolute inset-0 bg-muted animate-pulse ${
              imageLoaded ? "opacity-0" : "opacity-100"
            }`}
          />
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } ${isHovered ? "scale-110" : "scale-100"}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </Link>

      <div className="relative z-10 p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {product.category_name || "Oblečení"}
        </p>
        <Link href={`/produkt/${product.id}`}>
          <h3 className="font-semibold text-card-foreground mb-2 line-clamp-1 hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-card-foreground">
            {discountedPrice.toLocaleString("cs-CZ")} Kč
          </span>
          {hasSale && (
            <span className="text-sm text-muted-foreground line-through">
              {product.price.toLocaleString("cs-CZ")} Kč
            </span>
          )}
        </div>

        <Button
          onClick={() => addToCart(product)}
          className={`w-full mt-3 rounded-xl ${
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
      </div>
    </div>
  );
}
