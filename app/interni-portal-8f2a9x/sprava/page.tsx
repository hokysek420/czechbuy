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
  Shirt,
  Footprints,
  Gamepad2,
  Tag,
  Layers,
} from "lucide-react";
import { DiscordIcon, InstagramIcon } from "@/components/ui/social-icons";
import { Product, Order, OrderStatus, ProductCategory, FragranceConcentration, FragranceGender } from "@/types";
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
import {
  getCategoryStatus,
  saveCategoryStatus,
  CategoryStatusConfig,
  DEFAULT_CATEGORY_STATUS,
} from "@/lib/category-settings";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "countdown" | "orders" | "discord">("products");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<"all" | ProductCategory>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Category launch & coming soon toggles state
  const [categoryStatus, setCategoryStatus] = useState<CategoryStatusConfig>(DEFAULT_CATEGORY_STATUS);
  const [categorySavedSuccess, setCategorySavedSuccess] = useState(false);

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
    category: ProductCategory;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    stock: number;
    description: string;
    image: string;
    featured: boolean;
    isNew: boolean;

    // Parfémy
    volume: string;
    concentration: FragranceConcentration;
    gender: FragranceGender;
    headNotes: string;
    heartNotes: string;
    baseNotes: string;

    // Oblečení
    clothingSizes: string[];
    material: string;
    fit: string;
    color: string;

    // Boty
    shoeSizes: string[];
    colorway: string;
    sku: string;
    condition: string;

    // Digital
    platform: string;
    licenseType: string;
    region: string;
    deliveryTime: string;
  }>({
    id: "",
    category: "parfemy",
    name: "",
    brand: "",
    price: 2490,
    originalPrice: 0,
    stock: 20,
    description: "",
    image: "",
    featured: false,
    isNew: false,

    volume: "100 ml",
    concentration: "EdP",
    gender: "unisex",
    headNotes: "",
    heartNotes: "",
    baseNotes: "",

    clothingSizes: ["M", "L", "XL"],
    material: "100% bavlna",
    fit: "Regular fit",
    color: "Černá",

    shoeSizes: ["EU 41", "EU 42", "EU 43", "EU 44"],
    colorway: "Black / White",
    sku: "",
    condition: "Deadstock (Nové v krabici)",

    platform: "Steam",
    licenseType: "Trvalá licence",
    region: "Global / Region Free",
    deliveryTime: "Okamžitě e-mailem (do 30s)",
  });

  // New product modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductData, setNewProductData] = useState<{
    category: ProductCategory;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    stock: number;
    description: string;
    image: string;
    featured: boolean;
    isNew: boolean;

    // Parfémy
    volume: string;
    concentration: FragranceConcentration;
    gender: FragranceGender;
    headNotes: string;
    heartNotes: string;
    baseNotes: string;

    // Oblečení
    clothingSizes: string[];
    material: string;
    fit: string;
    color: string;

    // Boty
    shoeSizes: string[];
    colorway: string;
    sku: string;
    condition: string;

    // Digital
    platform: string;
    licenseType: string;
    region: string;
    deliveryTime: string;
  }>({
    category: "parfemy",
    name: "",
    brand: "",
    price: 2490,
    originalPrice: 0,
    stock: 20,
    description: "",
    image: "",
    featured: false,
    isNew: true,

    volume: "100 ml",
    concentration: "EdP",
    gender: "unisex",
    headNotes: "Bergamot, Citrusy",
    heartNotes: "Levandule, Koření",
    baseNotes: "Cedr, Ambroxan",

    clothingSizes: ["S", "M", "L", "XL"],
    material: "100% organická bavlna",
    fit: "Oversized fit",
    color: "Černá (Black)",

    shoeSizes: ["EU 41", "EU 42", "EU 43", "EU 44"],
    colorway: "Black / White",
    sku: "",
    condition: "Deadstock (Nové v krabici)",

    platform: "Steam",
    licenseType: "Trvalá digitální licence",
    region: "Global / Region Free",
    deliveryTime: "Okamžitě e-mailem (do 30s)",
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

    // Load category statuses
    const loadedCategories = getCategoryStatus();
    setCategoryStatus(loadedCategories);

    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((catData) => {
        if (catData && typeof catData === "object") {
          setCategoryStatus(catData);
        }
      })
      .catch(() => {});

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

  const handleToggleCategory = (cat: keyof CategoryStatusConfig) => {
    const updated: CategoryStatusConfig = {
      ...categoryStatus,
      [cat]: !categoryStatus[cat],
    };
    setCategoryStatus(updated);
    saveCategoryStatus(updated);
    setCategorySavedSuccess(true);
    setTimeout(() => setCategorySavedSuccess(false), 3000);
  };

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
      category: p.category || "parfemy",
      name: p.name,
      brand: p.brand,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      volume: p.volume || "100 ml",
      stock: p.stock,
      concentration: p.concentration || "EdP",
      gender: p.gender || "unisex",
      headNotes: p.scentNotes?.head ? p.scentNotes.head.join(", ") : "",
      heartNotes: p.scentNotes?.heart ? p.scentNotes.heart.join(", ") : "",
      baseNotes: p.scentNotes?.base ? p.scentNotes.base.join(", ") : "",
      description: p.description || "",
      image: p.image || "",
      featured: Boolean(p.featured),
      isNew: Boolean(p.isNew),
      clothingSizes: p.clothingSizes || ["S", "M", "L", "XL"],
      material: p.material || "",
      fit: p.fit || "Regular fit",
      color: p.color || "",
      shoeSizes: p.shoeSizes || ["EU 41", "EU 42", "EU 43"],
      colorway: p.colorway || "",
      sku: p.sku || "",
      condition: p.condition || "Deadstock (Nové v krabici)",
      platform: p.platform || "Steam",
      licenseType: p.licenseType || "Trvalá licence",
      region: p.region || "Global / Region Free",
      deliveryTime: p.deliveryTime || "Okamžitě e-mailem (do 30s)",
    });
    setIsEditProductOpen(true);
  };

  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = products.map((p) => {
      if (p.id === editingProductData.id) {
        return {
          ...p,
          category: editingProductData.category,
          name: editingProductData.name,
          brand: editingProductData.brand,
          price: Number(editingProductData.price),
          originalPrice: editingProductData.originalPrice ? Number(editingProductData.originalPrice) : undefined,
          stock: Number(editingProductData.stock),
          description: editingProductData.description,
          image: editingProductData.image,
          featured: editingProductData.featured,
          isNew: editingProductData.isNew,

          // Parfémy
          ...(editingProductData.category === "parfemy" && {
            volume: editingProductData.volume,
            concentration: editingProductData.concentration,
            gender: editingProductData.gender,
            scentNotes: {
              head: editingProductData.headNotes.split(",").map((s) => s.trim()).filter(Boolean),
              heart: editingProductData.heartNotes.split(",").map((s) => s.trim()).filter(Boolean),
              base: editingProductData.baseNotes.split(",").map((s) => s.trim()).filter(Boolean),
            },
            volumeVariants: (p.volumeVariants || []).map((v, idx) =>
              idx === 0
                ? {
                    ...v,
                    volume: editingProductData.volume,
                    price: Number(editingProductData.price),
                    inStock: Number(editingProductData.stock),
                  }
                : v
            ),
          }),

          // Oblečení
          ...(editingProductData.category === "obleceni" && {
            clothingSizes: editingProductData.clothingSizes,
            material: editingProductData.material,
            fit: editingProductData.fit,
            color: editingProductData.color,
          }),

          // Boty
          ...(editingProductData.category === "boty" && {
            shoeSizes: editingProductData.shoeSizes,
            colorway: editingProductData.colorway,
            sku: editingProductData.sku,
            condition: editingProductData.condition,
          }),

          // Digital
          ...(editingProductData.category === "digital" && {
            platform: editingProductData.platform,
            licenseType: editingProductData.licenseType,
            region: editingProductData.region,
            deliveryTime: editingProductData.deliveryTime,
          }),
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
          volumeVariants: (p.volumeVariants || []).map((v, idx) =>
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
    if (confirm("Opravdu si přejete tento produkt z nabídky smazat?")) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveProducts(updated);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.brand) {
      alert("Vyplňte prosím název a značku produktu.");
      return;
    }

    const newId = `${newProductData.brand.toLowerCase().replace(/\s+/g, "-")}-${newProductData.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const fallbackImages: Record<ProductCategory, string> = {
      parfemy: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80",
      obleceni: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
      boty: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
      digital: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    };

    const createdProduct: Product = {
      id: newId,
      slug: newId,
      name: newProductData.name,
      brand: newProductData.brand,
      category: newProductData.category,
      price: Number(newProductData.price),
      originalPrice: newProductData.originalPrice ? Number(newProductData.originalPrice) : undefined,
      stock: Number(newProductData.stock),
      description:
        newProductData.description ||
        `Originální ${newProductData.brand} ${newProductData.name} z ověřené distribuce.`,
      image: newProductData.image || fallbackImages[newProductData.category],
      featured: newProductData.featured,
      isNew: newProductData.isNew,

      // Parfémy
      ...(newProductData.category === "parfemy" && {
        volume: newProductData.volume,
        concentration: newProductData.concentration,
        gender: newProductData.gender,
        volumeVariants: [
          {
            volume: newProductData.volume,
            price: Number(newProductData.price),
            inStock: Number(newProductData.stock),
          },
        ],
        scentNotes: {
          head: newProductData.headNotes.split(",").map((s) => s.trim()).filter(Boolean),
          heart: newProductData.heartNotes.split(",").map((s) => s.trim()).filter(Boolean),
          base: newProductData.baseNotes.split(",").map((s) => s.trim()).filter(Boolean),
        },
      }),

      // Oblečení
      ...(newProductData.category === "obleceni" && {
        clothingSizes: newProductData.clothingSizes,
        material: newProductData.material,
        fit: newProductData.fit,
        color: newProductData.color,
      }),

      // Boty
      ...(newProductData.category === "boty" && {
        shoeSizes: newProductData.shoeSizes,
        colorway: newProductData.colorway,
        sku: newProductData.sku,
        condition: newProductData.condition,
      }),

      // Digital
      ...(newProductData.category === "digital" && {
        platform: newProductData.platform,
        licenseType: newProductData.licenseType,
        region: newProductData.region,
        deliveryTime: newProductData.deliveryTime,
      }),
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
      category: "parfemy",
      name: "",
      brand: "",
      price: 2490,
      originalPrice: 0,
      stock: 20,
      description: "",
      image: "",
      featured: false,
      isNew: true,
      volume: "100 ml",
      concentration: "EdP",
      gender: "unisex",
      headNotes: "Bergamot, Citrusy",
      heartNotes: "Levandule, Koření",
      baseNotes: "Cedr, Ambroxan",
      clothingSizes: ["S", "M", "L", "XL"],
      material: "100% bavlna",
      fit: "Regular fit",
      color: "Černá",
      shoeSizes: ["EU 41", "EU 42", "EU 43", "EU 44"],
      colorway: "Black / White",
      sku: "",
      condition: "Deadstock (Nové v krabici)",
      platform: "Steam",
      licenseType: "Trvalá licence",
      region: "Global / Region Free",
      deliveryTime: "Okamžitě e-mailem (do 30s)",
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

  const filteredProducts = products.filter((p) => {
    if (selectedCategoryFilter !== "all" && p.category !== selectedCategoryFilter) {
      return false;
    }
    return (
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()))
    );
  });

  const countParfemy = products.filter((p) => p.category === "parfemy").length;
  const countObleceni = products.filter((p) => p.category === "obleceni").length;
  const countBoty = products.filter((p) => p.category === "boty").length;
  const countDigital = products.filter((p) => p.category === "digital").length;

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
            onClick={() => setActiveTab("categories")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "categories"
                ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span>Spuštění kategorií & Coming Soon</span>
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
                  placeholder="Vyhledat produkt dle názvu, značky či kategorie..."
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
                <span>Přidat nový produkt</span>
              </Button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("all")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedCategoryFilter === "all"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                Všechny kategorie ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("parfemy")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  selectedCategoryFilter === "parfemy"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                <span>🧴 Parfémy</span>
                <span className="text-[10px] opacity-80 font-mono">({countParfemy})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("obleceni")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  selectedCategoryFilter === "obleceni"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                <span>👕 Oblečení</span>
                <span className="text-[10px] opacity-80 font-mono">({countObleceni})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("boty")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  selectedCategoryFilter === "boty"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                <span>👟 Boty</span>
                <span className="text-[10px] opacity-80 font-mono">({countBoty})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("digital")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  selectedCategoryFilter === "digital"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                <span>⚡ Digital</span>
                <span className="text-[10px] opacity-80 font-mono">({countDigital})</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
                  <thead className="bg-neutral-50 dark:bg-neutral-950/60 uppercase tracking-wider text-[10px] text-neutral-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4 w-14">Foto</th>
                      <th className="py-3 px-4">Kategorie</th>
                      <th className="py-3 px-4">Název & Značka</th>
                      <th className="py-3 px-4">Specifikace</th>
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
                            Zatím jste nepřidali žádný produkt v této kategorii. Klikněte výše na „Přidat nový produkt“ pro vložení první položky do nabídky.
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

                        const categoryBadges: Record<ProductCategory, React.ReactNode> = {
                          parfemy: (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              Parfém
                            </span>
                          ),
                          obleceni: (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                              Oblečení
                            </span>
                          ),
                          boty: (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800">
                              Boty
                            </span>
                          ),
                          digital: (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                              Digital
                            </span>
                          ),
                        };

                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="relative h-12 w-10 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                <Image
                                  src={product.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {categoryBadges[product.category || "parfemy"]}
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
                              {product.category === "obleceni"
                                ? `${product.clothingSizes?.join(", ") || "S-XL"} · ${product.fit || "Regular"}`
                                : product.category === "boty"
                                ? `${product.shoeSizes?.slice(0, 3).join(", ") || "EU 41-43"}... · ${product.condition || "DS"}`
                                : product.category === "digital"
                                ? `${product.platform || "Steam"} · ${product.region || "Global"}`
                                : `${product.volume || "100 ml"} · ${product.concentration || "EdP"}`}
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
                                  title="Upravit kompletní parametry produktu"
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

        {/* Tab 3: Categories & Coming Soon Toggles */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span>Spuštění kategorií & Coming Soon přepínače</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Jedním kliknutím můžete odebrat kategorii z „Coming Soon“ a spustit její prodej, nebo ji dočasně vrátit do přípravného režimu.
                  </p>
                </div>
                {categorySavedSuccess && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold animate-in fade-in">
                    <Check className="h-4 w-4" />
                    <span>Stav kategorií byl aktualizován na celém webu.</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                {/* Parfémy */}
                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                        🧴
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Parfémy & Vůně</h4>
                        <p className="text-[11px] text-neutral-500 font-mono">Položek v adminu: {countParfemy}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      categoryStatus.parfemy
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                    }`}>
                      {categoryStatus.parfemy ? "Aktivní katalog" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {categoryStatus.parfemy
                      ? "Kategorie je aktivní: zákazníci mohou prohlížet flakony a vkládat je do košíku."
                      : "Kategorie je označena jako Coming Soon: na webu je viditelná se štítkem Již brzy."}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-800/60">
                    <Link href="/katalog" target="_blank" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1">
                      <span>Zobrazit na webu</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Button
                      size="sm"
                      variant={categoryStatus.parfemy ? "outline" : "primary"}
                      onClick={() => handleToggleCategory("parfemy")}
                      className="text-xs uppercase tracking-wider font-semibold"
                    >
                      {categoryStatus.parfemy ? "Přepnout na Coming Soon" : "Aktivovat kategorii"}
                    </Button>
                  </div>
                </div>

                {/* Oblečení */}
                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-base">
                        👕
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Oblečení & Streetwear</h4>
                        <p className="text-[11px] text-neutral-500 font-mono">Položek v adminu: {countObleceni}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      categoryStatus.obleceni
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                        : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800"
                    }`}>
                      {categoryStatus.obleceni ? "Aktivní katalog" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {categoryStatus.obleceni
                      ? "Kategorie je aktivní: zákazníci mohou prohlížet a kupovat streetwear a módu."
                      : "Kategorie je uzamčena: zákazníci vidí prezentační teaser s přihlášením k odběru dropů."}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-800/60">
                    <Link href="/obleceni" target="_blank" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1">
                      <span>Zobrazit na webu</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Button
                      size="sm"
                      variant={categoryStatus.obleceni ? "outline" : "primary"}
                      onClick={() => handleToggleCategory("obleceni")}
                      className="text-xs uppercase tracking-wider font-semibold"
                    >
                      {categoryStatus.obleceni ? "Přepnout na Coming Soon" : "Aktivovat kategorii"}
                    </Button>
                  </div>
                </div>

                {/* Boty */}
                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-base">
                        👟
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Boty & Sneakers</h4>
                        <p className="text-[11px] text-neutral-500 font-mono">Položek v adminu: {countBoty}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      categoryStatus.boty
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                        : "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800"
                    }`}>
                      {categoryStatus.boty ? "Aktivní katalog" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {categoryStatus.boty
                      ? "Kategorie je aktivní: zákazníci mohou prohlížet a kupovat tenisky a sneakers."
                      : "Kategorie je uzamčena: zákazníci vidí prezentační teaser s přihlášením k odběru dropů."}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-800/60">
                    <Link href="/boty" target="_blank" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1">
                      <span>Zobrazit na webu</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Button
                      size="sm"
                      variant={categoryStatus.boty ? "outline" : "primary"}
                      onClick={() => handleToggleCategory("boty")}
                      className="text-xs uppercase tracking-wider font-semibold"
                    >
                      {categoryStatus.boty ? "Přepnout na Coming Soon" : "Aktivovat kategorii"}
                    </Button>
                  </div>
                </div>

                {/* Digital */}
                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base">
                        ⚡
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm">CzechBuy Digital</h4>
                        <p className="text-[11px] text-neutral-500 font-mono">Položek v adminu: {countDigital}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      categoryStatus.digital
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                        : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                    }`}>
                      {categoryStatus.digital ? "Aktivní katalog" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {categoryStatus.digital
                      ? "Kategorie je aktivní: zákazníci mohou okamžitě nakupovat herní klíče a licence."
                      : "Kategorie je uzamčena: zákazníci vidí prezentační teaser s přihlášením k dropům."}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-800/60">
                    <Link href="/digital" target="_blank" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1">
                      <span>Zobrazit na webu</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Button
                      size="sm"
                      variant={categoryStatus.digital ? "outline" : "primary"}
                      onClick={() => handleToggleCategory("digital")}
                      className="text-xs uppercase tracking-wider font-semibold"
                    >
                      {categoryStatus.digital ? "Přepnout na Coming Soon" : "Aktivovat kategorii"}
                    </Button>
                  </div>
                </div>
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
        title="Přidat nový produkt do nabídky"
        description="Vyberte kategorii a vyplňte specifikace nového produktu."
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          {/* Category Selector Tabs */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Kategorie produktu *
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() =>
                  setNewProductData({
                    ...newProductData,
                    category: "parfemy",
                  })
                }
                className={`py-2 px-2 rounded-lg font-bold text-center border transition ${
                  newProductData.category === "parfemy"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
                }`}
              >
                🧴 Parfémy
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewProductData({
                    ...newProductData,
                    category: "obleceni",
                  })
                }
                className={`py-2 px-2 rounded-lg font-bold text-center border transition ${
                  newProductData.category === "obleceni"
                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
                }`}
              >
                👕 Oblečení
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewProductData({
                    ...newProductData,
                    category: "boty",
                  })
                }
                className={`py-2 px-2 rounded-lg font-bold text-center border transition ${
                  newProductData.category === "boty"
                    ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
                }`}
              >
                👟 Boty
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewProductData({
                    ...newProductData,
                    category: "digital",
                  })
                }
                className={`py-2 px-2 rounded-lg font-bold text-center border transition ${
                  newProductData.category === "digital"
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
                }`}
              >
                ⚡ Digital
              </button>
            </div>
          </div>

          {/* Common Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Značka (Brand / Výrobce) *
              </label>
              <input
                type="text"
                required
                value={newProductData.brand}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, brand: e.target.value })
                }
                placeholder={
                  newProductData.category === "parfemy"
                    ? "např. Tom Ford"
                    : newProductData.category === "obleceni"
                    ? "např. Trapstar / Nike"
                    : newProductData.category === "boty"
                    ? "např. Jordan / Nike"
                    : "např. Steam / Valve / Microsoft"
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Název produktu *
              </label>
              <input
                type="text"
                required
                value={newProductData.name}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, name: e.target.value })
                }
                placeholder={
                  newProductData.category === "parfemy"
                    ? "např. Tobacco Vanille"
                    : newProductData.category === "obleceni"
                    ? "např. Irongate Heavy Hoodie"
                    : newProductData.category === "boty"
                    ? "např. Dunk Low Retro Panda"
                    : "např. Steam Gift Card 1000 Kč"
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Prodejní cena (Kč) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={newProductData.price}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    price: Number(e.target.value),
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Původní cena (Kč)
              </label>
              <input
                type="number"
                min={0}
                value={newProductData.originalPrice || ""}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    originalPrice: Number(e.target.value) || 0,
                  })
                }
                placeholder="Pro výpočet slevy"
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Skladová zásoba (ks) *
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
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none font-semibold"
              />
            </div>
          </div>

          {/* Category specific fields */}
          {newProductData.category === "parfemy" && (
            <div className="space-y-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Specifikace parfému
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Objem</label>
                  <input
                    type="text"
                    value={newProductData.volume}
                    onChange={(e) => setNewProductData({ ...newProductData, volume: e.target.value })}
                    placeholder="100 ml"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Koncentrace</label>
                  <select
                    value={newProductData.concentration}
                    onChange={(e) =>
                      setNewProductData({
                        ...newProductData,
                        concentration: e.target.value as FragranceConcentration,
                      })
                    }
                    className="w-full py-1.5 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  >
                    <option value="EdP">EdP</option>
                    <option value="EdT">EdT</option>
                    <option value="Parfum">Parfum</option>
                    <option value="Extrait">Extrait</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Určení</label>
                  <select
                    value={newProductData.gender}
                    onChange={(e) =>
                      setNewProductData({
                        ...newProductData,
                        gender: e.target.value as FragranceGender,
                      })
                    }
                    className="w-full py-1.5 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="panske">Pánské</option>
                    <option value="damske">Dámské</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newProductData.headNotes}
                  onChange={(e) => setNewProductData({ ...newProductData, headNotes: e.target.value })}
                  placeholder="Hlava vůně"
                  className="py-1 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
                />
                <input
                  type="text"
                  value={newProductData.heartNotes}
                  onChange={(e) => setNewProductData({ ...newProductData, heartNotes: e.target.value })}
                  placeholder="Srdce vůně"
                  className="py-1 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
                />
                <input
                  type="text"
                  value={newProductData.baseNotes}
                  onChange={(e) => setNewProductData({ ...newProductData, baseNotes: e.target.value })}
                  placeholder="Základ vůně"
                  className="py-1 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
                />
              </div>
            </div>
          )}

          {newProductData.category === "obleceni" && (
            <div className="space-y-3 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Specifikace oblečení & streetwearu
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Materiál</label>
                  <input
                    type="text"
                    value={newProductData.material}
                    onChange={(e) => setNewProductData({ ...newProductData, material: e.target.value })}
                    placeholder="100% bavlna"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Střih / Fit</label>
                  <input
                    type="text"
                    value={newProductData.fit}
                    onChange={(e) => setNewProductData({ ...newProductData, fit: e.target.value })}
                    placeholder="Oversized fit"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Barva</label>
                  <input
                    type="text"
                    value={newProductData.color}
                    onChange={(e) => setNewProductData({ ...newProductData, color: e.target.value })}
                    placeholder="Černá"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Dostupné velikosti (oddělené čárkou)</label>
                <input
                  type="text"
                  value={newProductData.clothingSizes.join(", ")}
                  onChange={(e) =>
                    setNewProductData({
                      ...newProductData,
                      clothingSizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="XS, S, M, L, XL, XXL"
                  className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                />
              </div>
            </div>
          )}

          {newProductData.category === "boty" && (
            <div className="space-y-3 p-3 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Specifikace tenisek & obuvi
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Barevné provedení (Colorway)</label>
                  <input
                    type="text"
                    value={newProductData.colorway}
                    onChange={(e) => setNewProductData({ ...newProductData, colorway: e.target.value })}
                    placeholder="Black / White"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Kód modelu (SKU)</label>
                  <input
                    type="text"
                    value={newProductData.sku}
                    onChange={(e) => setNewProductData({ ...newProductData, sku: e.target.value })}
                    placeholder="DD1391-100"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Stav</label>
                  <input
                    type="text"
                    value={newProductData.condition}
                    onChange={(e) => setNewProductData({ ...newProductData, condition: e.target.value })}
                    placeholder="Deadstock (Nové v krabici)"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Velikosti EU (oddělené čárkou)</label>
                <input
                  type="text"
                  value={newProductData.shoeSizes.join(", ")}
                  onChange={(e) =>
                    setNewProductData({
                      ...newProductData,
                      shoeSizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="EU 40, EU 41, EU 42, EU 43, EU 44, EU 45"
                  className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                />
              </div>
            </div>
          )}

          {newProductData.category === "digital" && (
            <div className="space-y-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Specifikace digitálního produktu
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Platforma</label>
                  <select
                    value={newProductData.platform}
                    onChange={(e) => setNewProductData({ ...newProductData, platform: e.target.value })}
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  >
                    <option value="Steam">Steam</option>
                    <option value="PlayStation Network">PlayStation Network (PSN)</option>
                    <option value="Xbox / Microsoft">Xbox / Microsoft Store</option>
                    <option value="EA / Origin / Ubisoft">EA / Ubisoft</option>
                    <option value="Software / Office">Software / Licence</option>
                    <option value="Předplatné">Předplatné (Spotify / Game Pass)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Typ licence / platnosti</label>
                  <input
                    type="text"
                    value={newProductData.licenseType}
                    onChange={(e) => setNewProductData({ ...newProductData, licenseType: e.target.value })}
                    placeholder="Trvalá licence / 1 Rok"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Aktivační region</label>
                  <input
                    type="text"
                    value={newProductData.region}
                    onChange={(e) => setNewProductData({ ...newProductData, region: e.target.value })}
                    placeholder="Global / Region Free"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Doručení</label>
                  <input
                    type="text"
                    value={newProductData.deliveryTime}
                    onChange={(e) => setNewProductData({ ...newProductData, deliveryTime: e.target.value })}
                    placeholder="Okamžitě e-mailem (do 30s)"
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Popis produktu
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
              placeholder="Detailní informace o produktu, materiálu, střihu či aktivaci..."
              className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              URL obrázku (volitelné – k dispozici je automatický fallback)
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

          <div className="flex items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newProductData.featured}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, featured: e.target.checked })
                }
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>Doporučený produkt (Featured)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newProductData.isNew}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, isNew: e.target.checked })
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
        title={`Upravit produkt: ${editingProductData.name || ""}`}
        description="Upravte veškeré specifikace, kategorii, cenu, sklad či fotografii produktu."
      >
        <form onSubmit={handleSaveEditedProduct} className="space-y-4 text-xs">
          {/* Category Selector Tabs */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Kategorie produktu *
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() =>
                  setEditingProductData({
                    ...editingProductData,
                    category: "parfemy",
                  })
                }
                className={`py-1.5 px-2 rounded-lg font-bold text-center border transition ${
                  editingProductData.category === "parfemy"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                🧴 Parfémy
              </button>
              <button
                type="button"
                onClick={() =>
                  setEditingProductData({
                    ...editingProductData,
                    category: "obleceni",
                  })
                }
                className={`py-1.5 px-2 rounded-lg font-bold text-center border transition ${
                  editingProductData.category === "obleceni"
                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                👕 Oblečení
              </button>
              <button
                type="button"
                onClick={() =>
                  setEditingProductData({
                    ...editingProductData,
                    category: "boty",
                  })
                }
                className={`py-1.5 px-2 rounded-lg font-bold text-center border transition ${
                  editingProductData.category === "boty"
                    ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                👟 Boty
              </button>
              <button
                type="button"
                onClick={() =>
                  setEditingProductData({
                    ...editingProductData,
                    category: "digital",
                  })
                }
                className={`py-1.5 px-2 rounded-lg font-bold text-center border transition ${
                  editingProductData.category === "digital"
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                ⚡ Digital
              </button>
            </div>
          </div>

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
                Název produktu *
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
                min={1}
                value={editingProductData.price}
                onChange={(e) =>
                  setEditingProductData({
                    ...editingProductData,
                    price: Number(e.target.value),
                  })
                }
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Původní cena (Kč)
              </label>
              <input
                type="number"
                min={0}
                value={editingProductData.originalPrice || ""}
                onChange={(e) =>
                  setEditingProductData({
                    ...editingProductData,
                    originalPrice: Number(e.target.value) || 0,
                  })
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
                className="w-full py-2 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none font-semibold"
              />
            </div>
          </div>

          {/* Category specific fields for Edit */}
          {editingProductData.category === "parfemy" && (
            <div className="space-y-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Specifikace parfému
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Objem</label>
                  <input
                    type="text"
                    value={editingProductData.volume}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, volume: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Koncentrace</label>
                  <select
                    value={editingProductData.concentration}
                    onChange={(e) =>
                      setEditingProductData({
                        ...editingProductData,
                        concentration: e.target.value as FragranceConcentration,
                      })
                    }
                    className="w-full py-1.5 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  >
                    <option value="EdP">EdP</option>
                    <option value="EdT">EdT</option>
                    <option value="Parfum">Parfum</option>
                    <option value="Extrait">Extrait</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Určení</label>
                  <select
                    value={editingProductData.gender}
                    onChange={(e) =>
                      setEditingProductData({
                        ...editingProductData,
                        gender: e.target.value as FragranceGender,
                      })
                    }
                    className="w-full py-1.5 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="panske">Pánské</option>
                    <option value="damske">Dámské</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={editingProductData.headNotes}
                  onChange={(e) =>
                    setEditingProductData({ ...editingProductData, headNotes: e.target.value })
                  }
                  placeholder="Hlava vůně"
                  className="py-1 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
                />
                <input
                  type="text"
                  value={editingProductData.heartNotes}
                  onChange={(e) =>
                    setEditingProductData({ ...editingProductData, heartNotes: e.target.value })
                  }
                  placeholder="Srdce vůně"
                  className="py-1 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
                />
                <input
                  type="text"
                  value={editingProductData.baseNotes}
                  onChange={(e) =>
                    setEditingProductData({ ...editingProductData, baseNotes: e.target.value })
                  }
                  placeholder="Základ vůně"
                  className="py-1 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-xs"
                />
              </div>
            </div>
          )}

          {editingProductData.category === "obleceni" && (
            <div className="space-y-3 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Specifikace oblečení & streetwearu
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Materiál</label>
                  <input
                    type="text"
                    value={editingProductData.material}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, material: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Střih / Fit</label>
                  <input
                    type="text"
                    value={editingProductData.fit}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, fit: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Barva</label>
                  <input
                    type="text"
                    value={editingProductData.color}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, color: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Dostupné velikosti (oddělené čárkou)</label>
                <input
                  type="text"
                  value={editingProductData.clothingSizes.join(", ")}
                  onChange={(e) =>
                    setEditingProductData({
                      ...editingProductData,
                      clothingSizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                />
              </div>
            </div>
          )}

          {editingProductData.category === "boty" && (
            <div className="space-y-3 p-3 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Specifikace tenisek & obuvi
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Barevné provedení (Colorway)</label>
                  <input
                    type="text"
                    value={editingProductData.colorway}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, colorway: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Kód modelu (SKU)</label>
                  <input
                    type="text"
                    value={editingProductData.sku}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, sku: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Stav</label>
                  <input
                    type="text"
                    value={editingProductData.condition}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, condition: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Velikosti EU (oddělené čárkou)</label>
                <input
                  type="text"
                  value={editingProductData.shoeSizes.join(", ")}
                  onChange={(e) =>
                    setEditingProductData({
                      ...editingProductData,
                      shoeSizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                />
              </div>
            </div>
          )}

          {editingProductData.category === "digital" && (
            <div className="space-y-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Specifikace digitálního produktu
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Platforma</label>
                  <select
                    value={editingProductData.platform}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, platform: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  >
                    <option value="Steam">Steam</option>
                    <option value="PlayStation Network">PlayStation Network (PSN)</option>
                    <option value="Xbox / Microsoft">Xbox / Microsoft Store</option>
                    <option value="EA / Origin / Ubisoft">EA / Ubisoft</option>
                    <option value="Software / Office">Software / Licence</option>
                    <option value="Předplatné">Předplatné</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Typ licence</label>
                  <input
                    type="text"
                    value={editingProductData.licenseType}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, licenseType: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Aktivační region</label>
                  <input
                    type="text"
                    value={editingProductData.region}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, region: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Doručení</label>
                  <input
                    type="text"
                    value={editingProductData.deliveryTime}
                    onChange={(e) =>
                      setEditingProductData({ ...editingProductData, deliveryTime: e.target.value })
                    }
                    className="w-full py-1.5 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Popis produktu
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
