"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Boxes,
  LogOut,
  ExternalLink,
  Plus,
  Save,
  Trash2,
  Check,
  Search,
  Filter,
  Eye,
  Pencil,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Send,
  Radio,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DiscordIcon, InstagramIcon } from "@/components/ui/social-icons";
import { Product, Order, OrderStatus, FragranceConcentration, FragranceGender } from "@/types";
import {
  getInitialProducts,
  saveProducts,
  getInitialOrders,
  saveOrders,
} from "@/lib/admin-store";
import {
  getCountdownConfig,
  saveCountdownConfig,
  CountdownConfig,
  DEFAULT_COUNTDOWN_CONFIG,
} from "@/lib/countdown-settings";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "countdown" | "orders" | "discord">("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Discord webhook status & test state
  const [discordInfo, setDiscordInfo] = useState<{
    configured: boolean;
    inviteUrl: string;
    instagramUrl: string;
    channelName: string;
    message?: string;
  } | null>(null);
  const [isTestingDiscord, setIsTestingDiscord] = useState(false);
  const [discordTestResult, setDiscordTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Search & filter
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Product inline edit state: map of productId -> { price, stock }
  const [editingProducts, setEditingProducts] = useState<
    Record<string, { price: number; stock: number }>
  >({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Selected order modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Countdown settings state
  const [countdownConfig, setCountdownConfig] = useState<CountdownConfig>(DEFAULT_COUNTDOWN_CONFIG);
  const [countdownSavedSuccess, setCountdownSavedSuccess] = useState(false);

  // Edit product modal state
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProductData, setEditingProductData] = useState<{
    id: string;
    name: string;
    brand: string;
    price: number;
    volume: string;
    stock: number;
    concentration: FragranceConcentration;
    gender: FragranceGender;
    headNotes: string;
    heartNotes: string;
    baseNotes: string;
    description: string;
    image: string;
    featured: boolean;
    isNew: boolean;
  }>({
    id: "",
    name: "",
    brand: "",
    price: 2490,
    volume: "100 ml",
    stock: 20,
    concentration: "EdP",
    gender: "unisex",
    headNotes: "",
    heartNotes: "",
    baseNotes: "",
    description: "",
    image: "",
    featured: false,
    isNew: false,
  });

  // New product modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: "",
    brand: "",
    price: 2490,
    volume: "100 ml",
    stock: 20,
    concentration: "EdP" as FragranceConcentration,
    gender: "unisex" as FragranceGender,
    headNotes: "Bergamot, Citrusy",
    heartNotes: "Levandule, Koření",
    baseNotes: "Cedr, Ambroxan",
    description: "",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80",
  });

  useEffect(() => {
    const loadedOrders = getInitialOrders();
    const loadedProducts = getInitialProducts();
    const loadedCountdown = getCountdownConfig();
    setOrders(loadedOrders);
    setProducts(loadedProducts);
    setCountdownConfig(loadedCountdown);

    const initialEdits: Record<string, { price: number; stock: number }> = {};
    loadedProducts.forEach((p) => {
      initialEdits[p.id] = { price: p.price, stock: p.stock };
    });
    setEditingProducts(initialEdits);
    setIsLoaded(true);

    // Fetch products from server API to ensure cross-session synchronization
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (Array.isArray(serverData) && serverData.length > 0) {
          setProducts(serverData);
          const edits: Record<string, { price: number; stock: number }> = {};
          serverData.forEach((p) => {
            edits[p.id] = { price: p.price, stock: p.stock };
          });
          setEditingProducts(edits);
        }
      })
      .catch(() => {});

    // Fetch Discord webhook configuration status
    fetch("/api/admin/discord-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDiscordInfo(data);
      })
      .catch(() => {});
  }, []);

  const handleTestDiscordWebhook = async () => {
    setIsTestingDiscord(true);
    setDiscordTestResult(null);

    try {
      const res = await fetch("/api/admin/discord-test", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setDiscordTestResult({
          success: true,
          message: data.message || "Testovací embed byl úspěšně odeslán do Discord kanálu!",
        });
      } else {
        setDiscordTestResult({
          success: false,
          message: data.error || "Odeslání testovací zprávy selhalo. Zkontrolujte URL webhooku.",
        });
      }
    } catch {
      setDiscordTestResult({
        success: false,
        message: "Chyba při komunikaci se serverem.",
      });
    } finally {
      setIsTestingDiscord(false);
    }
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductData({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      volume: p.volume,
      stock: p.stock,
      concentration: p.concentration,
      gender: p.gender,
      headNotes: p.scentNotes.head.join(", "),
      heartNotes: p.scentNotes.heart.join(", "),
      baseNotes: p.scentNotes.base.join(", "),
      description: p.description,
      image: p.image,
      featured: Boolean(p.featured),
      isNew: Boolean(p.isNew),
    });
    setIsEditProductOpen(true);
  };

  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = products.map((p) => {
      if (p.id === editingProductData.id) {
        return {
          ...p,
          name: editingProductData.name,
          brand: editingProductData.brand,
          price: Number(editingProductData.price),
          volume: editingProductData.volume,
          stock: Number(editingProductData.stock),
          concentration: editingProductData.concentration,
          gender: editingProductData.gender,
          description: editingProductData.description,
          image: editingProductData.image,
          featured: editingProductData.featured,
          isNew: editingProductData.isNew,
          scentNotes: {
            head: editingProductData.headNotes.split(",").map((s) => s.trim()),
            heart: editingProductData.heartNotes.split(",").map((s) => s.trim()),
            base: editingProductData.baseNotes.split(",").map((s) => s.trim()),
          },
          volumeVariants: p.volumeVariants.map((v, idx) =>
            idx === 0
              ? {
                  ...v,
                  volume: editingProductData.volume,
                  price: Number(editingProductData.price),
                  inStock: Number(editingProductData.stock),
                }
              : v
          ),
        };
      }
      return p;
    });

    setProducts(updated);
    saveProducts(updated);
    setEditingProducts((prev) => ({
      ...prev,
      [editingProductData.id]: {
        price: Number(editingProductData.price),
        stock: Number(editingProductData.stock),
      },
    }));
    setIsEditProductOpen(false);
  };

  const handleSaveCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    saveCountdownConfig(countdownConfig);
    setCountdownSavedSuccess(true);
    setTimeout(() => setCountdownSavedSuccess(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/interni-portal-8f2a9x/login");
      router.refresh();
    } catch {
      router.push("/interni-portal-8f2a9x/login");
    }
  };

  // Orders logic
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    saveOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // Products logic
  const handleProductInputChange = (
    id: string,
    field: "price" | "stock",
    value: number
  ) => {
    setEditingProducts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveProduct = (id: string) => {
    const changes = editingProducts[id];
    if (!changes) return;

    const updated = products.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          price: changes.price,
          stock: changes.stock,
          volumeVariants: p.volumeVariants.map((v, idx) =>
            idx === 0 ? { ...v, price: changes.price, inStock: changes.stock } : v
          ),
        };
      }
      return p;
    });

    setProducts(updated);
    saveProducts(updated);
    setSavedSuccessId(id);
    setTimeout(() => setSavedSuccessId(null), 2000);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Opravdu si přejete tento produkt z katalogu smazat?")) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveProducts(updated);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.brand) {
      alert("Vyplňte prosím název a značku parfému.");
      return;
    }

    const newId = `${newProductData.brand.toLowerCase().replace(/\s+/g, "-")}-${newProductData.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const createdProduct: Product = {
      id: newId,
      slug: newId,
      name: newProductData.name,
      brand: newProductData.brand,
      category: "parfemy",
      price: Number(newProductData.price),
      volume: newProductData.volume,
      volumeVariants: [
        {
          volume: newProductData.volume,
          price: Number(newProductData.price),
          inStock: Number(newProductData.stock),
        },
      ],
      stock: Number(newProductData.stock),
      concentration: newProductData.concentration,
      gender: newProductData.gender,
      scentNotes: {
        head: newProductData.headNotes.split(",").map((s) => s.trim()),
        heart: newProductData.heartNotes.split(",").map((s) => s.trim()),
        base: newProductData.baseNotes.split(",").map((s) => s.trim()),
      },
      description:
        newProductData.description ||
        "Autentický originální parfém z oficiální evropské distribuce.",
      image: newProductData.image,
      featured: false,
      isNew: true,
    };

    const updated = [createdProduct, ...products];
    setProducts(updated);
    saveProducts(updated);

    setEditingProducts((prev) => ({
      ...prev,
      [newId]: { price: createdProduct.price, stock: createdProduct.stock },
    }));

    setIsAddProductOpen(false);
    // Reset form
    setNewProductData({
      name: "",
      brand: "",
      price: 2490,
      volume: "100 ml",
      stock: 20,
      concentration: "EdP",
      gender: "unisex",
      headNotes: "Bergamot, Citrusy",
      heartNotes: "Levandule, Koření",
      baseNotes: "Cedr, Ambroxan",
      description: "",
      image:
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80",
    });
  };

  // KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue =
    totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);

  // Status badge helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "nova":
        return <Badge variant="warning">Nová</Badge>;
      case "zpracovava_se":
        return <Badge variant="secondary">Zpracovává se</Badge>;
      case "odeslano":
        return <Badge variant="brand">Odesláno</Badge>;
      case "doruceno":
        return <Badge variant="success">Doručeno</Badge>;
      case "stornovano":
        return <Badge variant="danger">Stornováno</Badge>;
    }
  };

  // Filtered lists
  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.firstName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.lastName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-sm text-neutral-500 animate-pulse">
          Načítání administrátorských dat...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tight text-neutral-950 dark:text-white">
              Czech<span className="text-neutral-500 font-light">Buy</span>
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
              Správa Portálu
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono text-neutral-500">
              /interni-portal-8f2a9x/sprava
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <span>Zobrazit obchod</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <ThemeToggle />

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 py-1.5 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Odhlásit se</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
              <span>Celkový obrat</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
              {formatPrice(totalRevenue)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Ze všech přijatých objednávek
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
              <span>Počet objednávek</span>
              <ShoppingBag className="h-4 w-4 text-neutral-900 dark:text-white" />
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
              {totalOrdersCount}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Aktivní objednávky v systému
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
              <span>Průměrný nákup (AOV)</span>
              <Package className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
              {formatPrice(avgOrderValue)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Průměrná hodnota košíku
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
              <span>Celkem skladem</span>
              <Boxes className="h-4 w-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
              {totalStockUnits} ks
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              V {products.length} položkách katalogu
            </p>
          </div>
        </section>

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "products"
                ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Boxes className="h-4 w-4" />
            <span>Katalog produktů & Sklad ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("countdown")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "countdown"
                ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Nastavení odpočtu a spuštění</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Správa objednávek ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("discord")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "discord"
                ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <DiscordIcon className="h-4 w-4" />
            <span>Discord Webhook</span>
            {discordInfo?.configured ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Webhook aktivní" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Webhook nenastaven v .env" />
            )}
          </button>
        </div>

        {/* Tab 1: Orders Management */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Search filter bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Vyhledat dle čísla objednávky nebo jména..."
                  className="w-full text-xs py-2 pl-9 pr-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              </div>
              <span className="text-xs text-neutral-500">
                Zobrazeno {filteredOrders.length} z {orders.length} objednávek
              </span>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
                  <thead className="bg-neutral-50 dark:bg-neutral-950/60 uppercase tracking-wider text-[10px] text-neutral-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Objednávka</th>
                      <th className="py-3 px-4">Datum</th>
                      <th className="py-3 px-4">Zákazník</th>
                      <th className="py-3 px-4">Doprava / Platba</th>
                      <th className="py-3 px-4">Částka</th>
                      <th className="py-3 px-4">Stav objednávky</th>
                      <th className="py-3 px-4 text-right">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-500">
                          Nenalezena žádná odpovídající objednávka.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                            {order.id}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-neutral-900 dark:text-white">
                              {order.customer.firstName} {order.customer.lastName}
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              {order.customer.city} · {order.customer.email}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="uppercase font-semibold text-neutral-700 dark:text-neutral-300">
                              {order.shippingMethod}
                            </span>
                            <span className="text-neutral-400"> / </span>
                            <span className="uppercase text-neutral-500">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                            {formatPrice(order.totalPrice)}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleOrderStatusChange(
                                  order.id,
                                  e.target.value as OrderStatus
                                )
                              }
                              className="text-xs py-1 px-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
                            >
                              <option value="nova">Nová</option>
                              <option value="zpracovava_se">Zpracovává se</option>
                              <option value="odeslano">Odesláno</option>
                              <option value="doruceno">Doručeno</option>
                              <option value="stornovano">Stornováno</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              title="Zobrazit detail objednávky"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products & Stock Management */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Vyhledat parfém nebo značku..."
                  className="w-full text-xs py-2 pl-9 pr-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              </div>

              <Button
                onClick={() => setIsAddProductOpen(true)}
                size="sm"
                className="inline-flex items-center gap-1.5 uppercase tracking-wider text-xs font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Přidat nový parfém</span>
              </Button>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
                  <thead className="bg-neutral-50 dark:bg-neutral-950/60 uppercase tracking-wider text-[10px] text-neutral-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4 w-14">Foto</th>
                      <th className="py-3 px-4">Název & Značka</th>
                      <th className="py-3 px-4">Objem</th>
                      <th className="py-3 px-4">Koncentrace</th>
                      <th className="py-3 px-4 w-32">Cena (Kč)</th>
                      <th className="py-3 px-4 w-28">Sklad (ks)</th>
                      <th className="py-3 px-4 text-right">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 px-4 text-center">
                          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            Žádné produkty v katalogu
                          </p>
                          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                            Zatím jste nepřidali žádný parfém. Klikněte výše na „Přidat nový parfém“ pro vložení první položky do nabídky.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                      const editState = editingProducts[product.id] || {
                        price: product.price,
                        stock: product.stock,
                      };
                      const hasChanges =
                        editState.price !== product.price ||
                        editState.stock !== product.stock;
                      const isJustSaved = savedSuccessId === product.id;

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="relative h-12 w-10 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              {product.brand}
                            </span>
                            <p className="font-semibold text-neutral-900 dark:text-white">
                              {product.name}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 font-medium">
                            {product.volume}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">
                              {product.concentration}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min={0}
                              step={10}
                              value={editState.price}
                              onChange={(e) =>
                                handleProductInputChange(
                                  product.id,
                                  "price",
                                  Number(e.target.value)
                                )
                              }
                              className="w-24 text-xs py-1 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-semibold text-neutral-900 dark:text-white focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min={0}
                              value={editState.stock}
                              onChange={(e) =>
                                handleProductInputChange(
                                  product.id,
                                  "stock",
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 text-xs py-1 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-semibold text-neutral-900 dark:text-white focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(product)}
                                className="p-1.5 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                title="Upravit kompletní parametry parfému (popis, objem, foto...)"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              {isJustSaved ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold px-2 py-1">
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Uloženo</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSaveProduct(product.id)}
                                  disabled={!hasChanges}
                                  className={`p-1.5 rounded transition-colors ${
                                    hasChanges
                                      ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                      : "text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
                                  }`}
                                  title="Uložit změny ceny a skladu"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                title="Smazat produkt z nabídky"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Countdown Settings */}
        {activeTab === "countdown" && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span>Správa odpočtu a textů spuštění (Coming Soon)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Upravte cílové datum otevření a textaci, kterou vidí neautorizovaní návštěvníci.
                </p>
              </div>

              <Link
                href="/brzy-otevirame"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium text-xs transition"
              >
                <span>Otevřít náhled odpočtu</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <form onSubmit={handleSaveCountdown} className="space-y-5 max-w-2xl text-xs">
              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Cílové datum a čas otevření (Target Launch Date & Time) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={countdownConfig.targetDate}
                  onChange={(e) =>
                    setCountdownConfig({ ...countdownConfig, targetDate: e.target.value })
                  }
                  className="w-full sm:w-80 text-xs py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Na toto datum je navázán živý odpočet dní, hodin, minut a sekund na veřejném webu.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Hlavní nadpis stránky odpočtu *
                </label>
                <input
                  type="text"
                  required
                  value={countdownConfig.headline}
                  onChange={(e) =>
                    setCountdownConfig({ ...countdownConfig, headline: e.target.value })
                  }
                  placeholder="Připravujeme pro vás nový zážitek z nakupování"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Doprovodný podtext *
                </label>
                <textarea
                  rows={3}
                  required
                  value={countdownConfig.subtext}
                  onChange={(e) =>
                    setCountdownConfig({ ...countdownConfig, subtext: e.target.value })
                  }
                  placeholder="CzechBuy brzy spustí exkluzivní nabídku prémiových vůní a zakázkového importu. Otevření proběhne za:"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Text horního stavového odznaku
                </label>
                <input
                  type="text"
                  value={countdownConfig.badgeText}
                  onChange={(e) =>
                    setCountdownConfig({ ...countdownConfig, badgeText: e.target.value })
                  }
                  placeholder="Připravujeme otevření e-shopu"
                  className="w-full sm:w-80 text-xs py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="pt-3 flex items-center gap-3">
                <Button type="submit" size="sm" className="inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Uložit nastavení odpočtu</span>
                </Button>

                {countdownSavedSuccess && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold animate-in fade-in">
                    <Check className="h-4 w-4" />
                    <span>Nastavení odpočtu bylo úspěšně uloženo a je okamžitě aktivní.</span>
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Discord Bot & Live Order Webhook Integration */}
        {activeTab === "discord" && (
          <div className="space-y-6">
            {/* Header info card */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shadow-md shrink-0">
                    <DiscordIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                        Discord Bot & Webhook Integrace
                      </h2>
                      {discordInfo?.configured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          Aktivní
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                          <AlertCircle className="h-3 w-3" />
                          Vyžaduje konfiguraci
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Automatické odesílání bohatých embed zpráv o nových objednávkách do privátního kanálu <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono text-neutral-800 dark:text-neutral-200">#live-objednávky</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={discordInfo?.inviteUrl || "https://discord.gg/czechbuy"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-xs transition shadow-xs"
                  >
                    <DiscordIcon className="h-4 w-4" />
                    <span>Otevřít Discord Server</span>
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>

                  <a
                    href={discordInfo?.instagramUrl || "https://www.instagram.com/czech.buy/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold text-xs transition border border-neutral-200 dark:border-neutral-700"
                  >
                    <InstagramIcon className="h-4 w-4 text-[#E1306C]" />
                    <span>Instagram</span>
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>
                </div>
              </div>

              {/* Status details grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs">
                <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold block">
                    Cílový kanál na Discordu
                  </span>
                  <p className="font-mono font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-[#5865F2]" />
                    <span>#live-objednávky</span>
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Privátní kanál pro administrátory a expediční tým
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold block">
                    Vzhled Embed notifikace
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E11D48] inline-block shadow-xs" />
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      CzechBuy Sleek Red (#E11D48)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Rozpis položek, cena v Kč, Zásilkovna bod, jméno & kontakt
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
                  <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold block">
                    Stav Webhook URL
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        discordInfo?.configured ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                      }`}
                    />
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {discordInfo?.configured
                        ? "DISCORD_ORDER_WEBHOOK_URL nastaven"
                        : "Proměnná prostředí chybí"}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {discordInfo?.configured
                      ? "Systém je připraven pro ostrý provoz"
                      : "Doplňte do .env.local nebo nastavení Vercelu"}
                  </p>
                </div>
              </div>

              {/* Interactive Webhook Test Section */}
              <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Otestovat živý Discord webhook
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Odešle ukázkovou objednávku přímo do kanálu <code className="font-mono">#live-objednávky</code> pro ověření spojení.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleTestDiscordWebhook}
                    disabled={isTestingDiscord}
                    className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-xs shadow-sm shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isTestingDiscord ? "Odesílám test..." : "Odeslat testovací embed"}</span>
                  </Button>
                </div>

                {discordTestResult && (
                  <div
                    className={`p-3.5 rounded-lg text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
                      discordTestResult.success
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    {discordTestResult.success ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                    )}
                    <span>{discordTestResult.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration instructions card */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Návod na propojení Discord Webhooku (Checklist proměnných prostředí)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <li>
                  Na vašem Discord serveru klikněte na kanál <strong>#live-objednávky</strong> → <em>Nastavení kanálu (Ozubené kolečko)</em> → <strong>Integrace</strong> → <strong>Webhooky</strong>.
                </li>
                <li>
                  Vytvořte nový webhook, pojmenujte ho např. <strong>CzechBuy Live Sync</strong> a zkopírujte jeho URL adresu.
                </li>
                <li>
                  Vložte získanou URL do souboru <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono text-neutral-900 dark:text-white">.env.local</code> nebo do <em>Environment Variables</em> v administraci Vercelu:
                </li>
              </ol>

              <div className="bg-neutral-950 text-neutral-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto border border-neutral-800">
                <p className="text-neutral-500"># Discord Webhook & Social Environment Variables</p>
                <p><span className="text-pink-400">DISCORD_ORDER_WEBHOOK_URL</span>=https://discord.com/api/webhooks/131.../...</p>
                <p><span className="text-sky-400">NEXT_PUBLIC_DISCORD_INVITE_URL</span>=https://discord.gg/czechbuy</p>
                <p><span className="text-amber-400">NEXT_PUBLIC_INSTAGRAM_URL</span>=https://www.instagram.com/czech.buy/</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Order Details */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Detail objednávky ${selectedOrder.id}` : ""}
        description={
          selectedOrder ? `Vytvořeno: ${formatDate(selectedOrder.createdAt)}` : ""
        }
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <p className="font-semibold text-neutral-900 dark:text-white">
                {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
              </p>
              <p className="text-neutral-500">
                {selectedOrder.customer.address}, {selectedOrder.customer.zip}{" "}
                {selectedOrder.customer.city}
              </p>
              <p className="text-neutral-500">
                E-mail: {selectedOrder.customer.email} · Tel:{" "}
                {selectedOrder.customer.phone}
              </p>
              {selectedOrder.customer.note && (
                <p className="text-neutral-600 dark:text-neutral-300 pt-1 border-t border-neutral-200 dark:border-neutral-700 italic">
                  Poznámka: „{selectedOrder.customer.note}“
                </p>
              )}
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-neutral-500 mb-2">
                Položky v objednávce
              </h4>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-2 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {item.brand} {item.name}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {item.quantity}× {item.volume} ({formatPrice(item.price)} / ks)
                      </p>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1 text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Doprava ({selectedOrder.shippingMethod.toUpperCase()}):</span>
                <span>{formatPrice(selectedOrder.shippingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platba ({selectedOrder.paymentMethod.toUpperCase()}):</span>
                <span>{formatPrice(selectedOrder.paymentPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span>Celkem k úhradě:</span>
                <span>{formatPrice(selectedOrder.totalPrice)}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Stav:
              </span>
              <select
                value={selectedOrder.status}
                onChange={(e) =>
                  handleOrderStatusChange(
                    selectedOrder.id,
                    e.target.value as OrderStatus
                  )
                }
                className="text-xs py-1 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-semibold"
              >
                <option value="nova">Nová</option>
                <option value="zpracovava_se">Zpracovává se</option>
                <option value="odeslano">Odesláno</option>
                <option value="doruceno">Doručeno</option>
                <option value="stornovano">Stornováno</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Add New Product */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        title="Přidat nový originální parfém"
        description="Vložte autentické údaje o parfému z evropské distribuce."
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Značka (Brand) *
              </label>
              <input
                type="text"
                required
                value={newProductData.brand}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, brand: e.target.value })
                }
                placeholder="např. Tom Ford"
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Název parfému *
              </label>
              <input
                type="text"
                required
                value={newProductData.name}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, name: e.target.value })
                }
                placeholder="např. Ombré Leather"
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Cena (Kč) *
              </label>
              <input
                type="number"
                required
                min={100}
                value={newProductData.price}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    price: Number(e.target.value),
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Objem *
              </label>
              <input
                type="text"
                required
                value={newProductData.volume}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, volume: e.target.value })
                }
                placeholder="100 ml"
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Sklad (ks) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={newProductData.stock}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    stock: Number(e.target.value),
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Koncentrace
              </label>
              <select
                value={newProductData.concentration}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    concentration: e.target.value as FragranceConcentration,
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              >
                <option value="EdP">EdP (Parfémovaná voda)</option>
                <option value="EdT">EdT (Toaletní voda)</option>
                <option value="Parfum">Parfum</option>
                <option value="Extrait">Extrait de Parfum</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Určení
              </label>
              <select
                value={newProductData.gender}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    gender: e.target.value as FragranceGender,
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              >
                <option value="panske">Pánské</option>
                <option value="damske">Dámské</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Složení (Hlava / Srdce / Základ)
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={newProductData.headNotes}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    headNotes: e.target.value,
                  })
                }
                placeholder="Hlava: např. Bergamot, Šafrán"
                className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
              />
              <input
                type="text"
                value={newProductData.heartNotes}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    heartNotes: e.target.value,
                  })
                }
                placeholder="Srdce: např. Kůže, Pačuli"
                className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
              />
              <input
                type="text"
                value={newProductData.baseNotes}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    baseNotes: e.target.value,
                  })
                }
                placeholder="Základ: např. Ambroxan, Mech"
                className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Popis parfému
            </label>
            <textarea
              rows={2}
              value={newProductData.description}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  description: e.target.value,
                })
              }
              placeholder="Charakter vůně, vonné akordy..."
              className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              URL obrázku
            </label>
            <input
              type="url"
              value={newProductData.image}
              onChange={(e) =>
                setNewProductData({ ...newProductData, image: e.target.value })
              }
              placeholder="https://images.unsplash.com/..."
              className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddProductOpen(false)}
            >
              Zrušit
            </Button>
            <Button type="submit" size="sm">
              Uložit a naskladnit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Existing Product */}
      <Modal
        isOpen={isEditProductOpen}
        onClose={() => setIsEditProductOpen(false)}
        title={`Upravit parfém: ${editingProductData.name || ""}`}
        description="Upravte veškeré specifikace, cenu, sklad či fotografii parfému."
      >
        <form onSubmit={handleSaveEditedProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Značka (Brand) *
              </label>
              <input
                type="text"
                required
                value={editingProductData.brand}
                onChange={(e) =>
                  setEditingProductData({ ...editingProductData, brand: e.target.value })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Název parfému *
              </label>
              <input
                type="text"
                required
                value={editingProductData.name}
                onChange={(e) =>
                  setEditingProductData({ ...editingProductData, name: e.target.value })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Cena (Kč) *
              </label>
              <input
                type="number"
                required
                min={100}
                value={editingProductData.price}
                onChange={(e) =>
                  setEditingProductData({
                    ...editingProductData,
                    price: Number(e.target.value),
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Objem *
              </label>
              <input
                type="text"
                required
                value={editingProductData.volume}
                onChange={(e) =>
                  setEditingProductData({ ...editingProductData, volume: e.target.value })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Sklad (ks) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={editingProductData.stock}
                onChange={(e) =>
                  setEditingProductData({
                    ...editingProductData,
                    stock: Number(e.target.value),
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Koncentrace
              </label>
              <select
                value={editingProductData.concentration}
                onChange={(e) =>
                  setEditingProductData({
                    ...editingProductData,
                    concentration: e.target.value as FragranceConcentration,
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              >
                <option value="EdP">EdP (Parfémovaná voda)</option>
                <option value="EdT">EdT (Toaletní voda)</option>
                <option value="Parfum">Parfum</option>
                <option value="Extrait">Extrait de Parfum</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Určení
              </label>
              <select
                value={editingProductData.gender}
                onChange={(e) =>
                  setEditingProductData({
                    ...editingProductData,
                    gender: e.target.value as FragranceGender,
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              >
                <option value="panske">Pánské</option>
                <option value="damske">Dámské</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Složení (Hlava / Srdce / Základ)
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={editingProductData.headNotes}
                onChange={(e) =>
                  setEditingProductData({
                    ...editingProductData,
                    headNotes: e.target.value,
                  })
                }
                placeholder="Hlava: např. Bergamot, Šafrán"
                className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
              />
              <input
                type="text"
                value={editingProductData.heartNotes}
                onChange={(e) =>
                  setEditingProductData({
                    ...editingProductData,
                    heartNotes: e.target.value,
                  })
                }
                placeholder="Srdce: např. Kůže, Pačuli"
                className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
              />
              <input
                type="text"
                value={editingProductData.baseNotes}
                onChange={(e) =>
                  setEditingProductData({
                    ...editingProductData,
                    baseNotes: e.target.value,
                  })
                }
                placeholder="Základ: např. Ambroxan, Mech"
                className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Popis parfému
            </label>
            <textarea
              rows={3}
              value={editingProductData.description}
              onChange={(e) =>
                setEditingProductData({
                  ...editingProductData,
                  description: e.target.value,
                })
              }
              placeholder="Charakter vůně, vonné akordy..."
              className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              URL obrázku
            </label>
            <input
              type="url"
              value={editingProductData.image}
              onChange={(e) =>
                setEditingProductData({ ...editingProductData, image: e.target.value })
              }
              placeholder="https://images.unsplash.com/..."
              className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProductData.featured}
                onChange={(e) =>
                  setEditingProductData({ ...editingProductData, featured: e.target.checked })
                }
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>Doporučený produkt (Featured)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProductData.isNew}
                onChange={(e) =>
                  setEditingProductData({ ...editingProductData, isNew: e.target.checked })
                }
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>Označit jako novinku</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditProductOpen(false)}
            >
              Zrušit
            </Button>
            <Button type="submit" size="sm">
              Uložit změny
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
