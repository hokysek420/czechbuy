"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, Product } from "@/lib/store-context";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart, addToWishlist, isInWishlist } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);

  return (
    <div
      className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sale Background Effect */}
      {product.sale && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-[-50%] opacity-20 dark:opacity-10 blur-2xl scale-150"
            style={{
              animation: "slowRotate 20s linear infinite",
            }}
          >
            <Image
              src={product.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/60" />
        </div>
      )}

      {/* Sale Badge */}
      {product.sale && (
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-lg">
            SLEVA
          </span>
        </div>
      )}

      {/* Wishlist Button */}
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

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <div
          className={`absolute inset-0 bg-muted animate-pulse ${
            imageLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } ${isHovered ? "scale-110" : "scale-100"}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Quick Add Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            onClick={() => addToCart(product)}
            className={`w-full rounded-xl ${
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

      {/* Info */}
      <div className="relative z-10 p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-card-foreground">
            {product.price.toLocaleString("cs-CZ")} Kč
          </span>
          {product.sale && (
            <span className="text-sm text-muted-foreground line-through">
              {Math.round(product.price * 1.3).toLocaleString("cs-CZ")} Kč
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slowRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
