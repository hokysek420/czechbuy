"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (!error && data) setCategories(data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast({ title: "Chyba", description: "Vyplňte název a slug.", variant: "destructive" });
      return;
    }

    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("categories").update({ name: form.name, slug: form.slug }).eq("id", editing.id);
      if (error) {
        toast({ title: "Chyba", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Uloženo", description: "Kategorie byla aktualizována." });
        setDialogOpen(false);
        loadCategories();
      }
    } else {
      const { error } = await supabase.from("categories").insert({ name: form.name, slug: form.slug });
      if (error) {
        toast({ title: "Chyba", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Vytvořeno", description: "Kategorie byla přidána." });
        setDialogOpen(false);
        loadCategories();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tuto kategorii?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Smazáno", description: "Kategorie byla odstraněna." });
      loadCategories();
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kategorie</h1>
          <p className="text-muted-foreground">Správa produktových kategorií</p>
        </div>
        <Button onClick={openNew} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Nová kategorie
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Načítání...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Žádné kategorie.</div>
      ) : (
        <div className="grid gap-4">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(cat)} title="Upravit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} title="Smazat" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Upravit kategorii" : "Nová kategorie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Název</Label>
              <Input id="catName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catSlug">Slug (URL)</Label>
              <Input id="catSlug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Zrušit</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Uložit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
