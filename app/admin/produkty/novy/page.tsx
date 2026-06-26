"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { useStore } from "@/lib/store-context";

export default function NewProductPage() {
  const router = useRouter();
  const { categories } = useStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    sale_percentage: "0",
    sku: "",
    stock_quantity: "0",
    category_id: "",
    featured: false,
    is_active: true,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        toast({ title: "Chyba nahrávání", description: uploadError.message, variant: "destructive" });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    setImages((prev) => [...prev, ...uploadedUrls]);
    setUploadingImages(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.price || !form.sku) {
      toast({ title: "Chyba", description: "Vyplňte prosím všechna povinná pole.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("products").insert({
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      sale_percentage: parseInt(form.sale_percentage) || 0,
      sku: form.sku,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      category_id: form.category_id || null,
      images,
      featured: form.featured,
      is_active: form.is_active,
    });

    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produkt vytvořen", description: "Produkt byl úspěšně přidán do katalogu." });
      router.push("/admin/produkty");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.push("/admin/produkty")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Zpět na produkty
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nový produkt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Název *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Cena (Kč) *</Label>
                <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_percentage">Sleva (%)</Label>
                <Input id="sale_percentage" type="number" min="0" max="100" value={form.sale_percentage} onChange={(e) => setForm({ ...form, sale_percentage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Skladem (ks)</Label>
                <Input id="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <select
                id="category"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Vyberte kategorii --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label htmlFor="featured">Doporučený produkt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label htmlFor="is_active">Viditelný</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Obrázky</Label>
              <div className="flex items-center gap-4">
                <Label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Nahrát obrázky</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </Label>
                {uploadingImages && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="rounded-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Vytvořit produkt
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/produkty")} className="rounded-full">
                Zrušit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
