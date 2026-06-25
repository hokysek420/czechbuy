"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  sale: boolean;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  isInCart: (productId: number) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to load products:", err));
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    const savedCart = localStorage.getItem("czechbuy-cart");
    const savedWishlist = localStorage.getItem("czechbuy-wishlist");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  const loadFromSupabase = useCallback(async (userId: string) => {
    const [cartResult, wishlistResult] = await Promise.all([
      supabase.from("cart_items").select("*").eq("user_id", userId),
      supabase.from("wishlist_items").select("*").eq("user_id", userId),
    ]);

    if (cartResult.data) {
      const cartItems = cartResult.data.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        return product ? { ...product, quantity: item.quantity } : null;
      }).filter(Boolean) as CartItem[];
      setCart(cartItems);
    }

    if (wishlistResult.data) {
      const wishlistItems = wishlistResult.data.map((item) => {
        return products.find((p) => p.id === item.product_id);
      }).filter(Boolean) as Product[];
      setWishlist(wishlistItems);
    }
  }, [products]);

  useEffect(() => {
    if (products.length === 0 || initialized) return;

    if (user) {
      loadFromSupabase(user.id);
    } else {
      loadFromLocalStorage();
    }
    setInitialized(true);
  }, [user, products, initialized, loadFromSupabase, loadFromLocalStorage]);

  useEffect(() => {
    if (!initialized || !user) return;
    localStorage.setItem("czechbuy-cart", JSON.stringify(cart));
  }, [cart, initialized, user]);

  useEffect(() => {
    if (!initialized || !user) return;
    localStorage.setItem("czechbuy-wishlist", JSON.stringify(wishlist));
  }, [wishlist, initialized, user]);

  const syncCartToSupabase = useCallback(async (cartItems: CartItem[]) => {
    if (!user) return;

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error clearing cart:", deleteError);
      return;
    }

    if (cartItems.length > 0) {
      const items = cartItems.map((item) => ({
        user_id: user.id,
        product_id: item.id,
        quantity: item.quantity,
      }));

      const { error: insertError } = await supabase
        .from("cart_items")
        .insert(items);

      if (insertError) {
        console.error("Error syncing cart:", insertError);
      }
    }
  }, [user]);

  const syncWishlistToSupabase = useCallback(async (wishlistItems: Product[]) => {
    if (!user) return;

    const { error: deleteError } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error clearing wishlist:", deleteError);
      return;
    }

    if (wishlistItems.length > 0) {
      const items = wishlistItems.map((item) => ({
        user_id: user.id,
        product_id: item.id,
      }));

      const { error: insertError } = await supabase
        .from("wishlist_items")
        .insert(items);

      if (insertError) {
        console.error("Error syncing wishlist:", insertError);
      }
    }
  }, [user]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newCart: CartItem[];
      if (existing) {
        newCart = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }
      syncCartToSupabase(newCart);
      return newCart;
    });
  }, [syncCartToSupabase]);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => {
      const newCart = prev.filter((item) => item.id !== productId);
      syncCartToSupabase(newCart);
      return newCart;
    });
  }, [syncCartToSupabase]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      const newCart = prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      syncCartToSupabase(newCart);
      return newCart;
    });
  }, [removeFromCart, syncCartToSupabase]);

  const isInCart = useCallback((productId: number) => {
    return cart.some((item) => item.id === productId);
  }, [cart]);

  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      let newWishlist: Product[];
      if (prev.some((item) => item.id === product.id)) {
        newWishlist = prev.filter((item) => item.id !== product.id);
      } else {
        newWishlist = [...prev, product];
      }
      syncWishlistToSupabase(newWishlist);
      return newWishlist;
    });
  }, [syncWishlistToSupabase]);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlist((prev) => {
      const newWishlist = prev.filter((item) => item.id !== productId);
      syncWishlistToSupabase(newWishlist);
      return newWishlist;
    });
  }, [syncWishlistToSupabase]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        isInCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        cartTotal,
        cartCount,
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
