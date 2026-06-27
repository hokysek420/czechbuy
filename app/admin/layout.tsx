"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Tag,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Přehled", href: "/admin", icon: LayoutDashboard },
  { label: "Produkty", href: "/admin/produkty", icon: Package },
  { label: "Kategorie", href: "/admin/kategorie", icon: Tag },
  { label: "Objednávky", href: "/admin/objednavky", icon: ShoppingBag },
  { label: "Zákazníci", href: "/admin/zakaznici", icon: Users },
  { label: "Nastavení", href: "/admin/nastaveni", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/prihlaseni");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Načítání...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border fixed h-full">
        <div className="p-6">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-xl font-bold">CzechBuy</span>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/")}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Zpět na web
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="text-lg font-bold">CzechBuy</span>
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Admin</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background pt-14">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/");
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Zpět na web
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
