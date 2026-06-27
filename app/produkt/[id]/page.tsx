"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, ArrowLeft, Check, Truck, RotateCcw, Shield, Star, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Product, Review } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, isInCart, addToWishlist, isInWishlist, getDiscountedPrice, getRelatedProducts, loadReviews, addReview, reviews } = useStore();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

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
        const mapped: Product = {
          ...data,
          category_name: data.categories?.name,
        };
        setProduct(mapped);
        setRelatedProducts(getRelatedProducts(data.id, data.category_id));
        await loadReviews(data.id);
      }
      setLoading(false);
    };

    loadProduct();
  }, [id, getRelatedProducts, loadReviews]);

  const handleAddReview = async () => {
    if (!user) {
      toast({ title: "Přihlášení vyžadováno", description: "Pro napsání recenze se musíte přihlásit.", variant: "destructive" });
      return;
    }
    if (!product) return;
    setSubmittingReview(true);
    const { error } = await addReview(product.id, rating, comment);
    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Děkujeme", description: "Vaše recenze byla odeslána." });
      setComment("");
      setRating(5);
    }
    setSubmittingReview(false);
  };

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

  const averageRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

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
          {/* Images */}
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
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                      selectedImage === i ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.category_name || "Oblečení"}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{product.name}</h1>
            </div>

            {averageRating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-5 w-5 ${s <= Math.round(Number(averageRating)) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{averageRating} ({reviews.length} {reviews.length === 1 ? "recenze" : reviews.length < 5 ? "recenze" : "recenzí"})</span>
              </div>
            )}

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

            <div className="flex items-center gap-4 flex-wrap">
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
                onClick={() => addToCart(product, quantity)}
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
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
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

        {/* Reviews */}
        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">Hodnocení zákazníků</h2>

          {user && (
            <div className="bg-muted/50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Napsat recenzi</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">Hodnocení:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}>
                    <Star className={`h-6 w-6 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Napište svůj názor..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="mb-3"
              />
              <Button onClick={handleAddReview} disabled={submittingReview} className="rounded-full">
                <Send className="mr-2 h-4 w-4" />
                Odeslat recenzi
              </Button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-muted-foreground">Zatím žádné recenze.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-sm">{review.user_name}</span>
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.created_at).toLocaleDateString("cs-CZ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Související produkty</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
