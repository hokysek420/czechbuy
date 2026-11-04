"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700">
      {/* Product Image */}
      <Link href={`/produkt/${product.id}`} className="relative aspect-4/5 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden block">
        <Image
          src={product.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80"}
          alt={`${product.brand} ${product.name}`}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent && (
            <Badge variant="danger" className="font-bold text-[10px] tracking-wide">
              -{discountPercent}%
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="brand" className="text-[9px]">
              Novinka
            </Badge>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white">
            {product.concentration || product.platform || (product.category === 'obleceni' ? 'Streetwear' : product.category === 'boty' ? 'Sneakers' : 'Digital')}
          </span>
        </div>

        {/* Quick add hover overlay on desktop */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full py-2.5 px-3 bg-white text-neutral-900 font-semibold text-xs rounded shadow hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            aria-label={`Rychle přidat ${product.name} do košíku`}
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Přidáno do košíku</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Přidat do košíku</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {product.brand}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {product.volume || product.platform || (product.clothingSizes ? product.clothingSizes.join(", ") : (product.shoeSizes ? product.shoeSizes.slice(0, 3).join(", ") : ''))}
            </span>
          </div>

          <Link href={`/produkt/${product.id}`} className="block group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
            {product.scentNotes?.head?.slice(0, 2).join(", ") ||
              product.material ||
              product.colorway ||
              product.platform ||
              product.description ||
              "Originální produkt CzechBuy"}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {product.stock > 0 ? "Dostupné (Na objednávku)" : "Momentálně nedostupné"}
          </span>
        </div>
      </div>
    </div>
  );
}
