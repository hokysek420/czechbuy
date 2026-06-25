"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ShoppingBag, ShoppingCart, Heart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store-context";

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const { cartCount, wishlist } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/prihlaseni");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Načítání...</div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Osobní údaje",
      description: "Upravte své jméno a kontaktní informace",
      icon: User,
      href: "/profil/nastaveni",
    },
    {
      title: "Moje objednávky",
      description: `Zobrazit historii objednávek`,
      icon: ShoppingBag,
      href: "/profil/objednavky",
    },
    {
      title: "Oblíbené položky",
      description: `${wishlist.length} položek v oblíbených`,
      icon: Heart,
      href: "/wishlist",
    },
    {
      title: "Nastavení",
      description: "Změna hesla a předvolby",
      icon: Settings,
      href: "/profil/nastaveni",
    },
  ];

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Můj účet</h1>
          <p className="text-muted-foreground">Vítejte zpět, {profile?.full_name || "uživateli"}!</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {profile?.full_name || "Uživatel"}
                  </h2>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={signOut} className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                Odhlásit se
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{cartCount}</p>
                  <p className="text-sm text-muted-foreground">Produktů v košíku</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{wishlist.length}</p>
                  <p className="text-sm text-muted-foreground">Oblíbených položek</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="grid gap-4">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
