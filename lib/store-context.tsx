"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Product, Category, Review, CartItem } from "@/lib/types";

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: Product[];
  reviews: Review[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
  getDiscountedPrice: (product: Product) => number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  filteredProducts: Product[];
  loadingProducts: boolean;
  loadReviews: (productId: string) => Promise<void>;
  addReview: (productId: string, rating: number, comment: string) => Promise<{ error: Error | null }>;
  getRelatedProducts: (productId: string, categoryId?: string) => Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: Product[] = data.map((p: any) => ({
        ...p,
        category_name: p.categories?.name,
      }));
      setProducts(mapped);
    }
    setLoadingProducts(false);
  }, []);

  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (!error && data) {
      setCategories(data as Category[]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  useEffect(() => {
    const savedCart = localStorage.getItem("czechbuy-cart");
    const savedWishlist = localStorage.getItem("czechbuy-wishlist");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  useEffect(() => {
    localStorage.setItem("czechbuy-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("czechbuy-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const getDiscountedPrice = (product: Product) => {
    if (product.sale_percentage > 0) {
      return Math.round(product.price * (1 - product.sale_percentage / 100));
    }
    return product.price;
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const isInCart = useCallback((productId: string) => {
    return cart.some((item) => item.id === productId);
  }, [cart]);

  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  const loadReviews = useCallback(async (productId: string) => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, user_profiles(full_name)")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data.map((r: any) => ({
        ...r,
        user_name: r.user_profiles?.full_name || "Uživatel",
      })));
    }
  }, []);

  const addReview = useCallback(async (productId: string, rating: number, comment: string) => {
    if (!user) return { error: new Error("Musíte být přihlášeni") };

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment || null,
    });

    if (!error) {
      await loadReviews(productId);
    }

    return { error };
  }, [user, loadReviews]);

  const getRelatedProducts = useCallback((productId: string, categoryId?: string) => {
    return products
      .filter((p) => p.id !== productId && (categoryId ? p.category_id === categoryId : true))
      .slice(0, 4);
  }, [products]);

  const cartTotal = cart.reduce(
    (total, item) => total + getDiscountedPrice(item) * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        wishlist,
        reviews,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        cartTotal,
        cartCount,
        getDiscountedPrice,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        filteredProducts,
        loadingProducts,
        loadReviews,
        addReview,
        getRelatedProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
