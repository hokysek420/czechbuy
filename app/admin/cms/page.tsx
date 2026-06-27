"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string;
}

const pageSlugs = [
  { slug: "o-nas", label: "O nás" },
  { slug: "kontakt", label: "Kontakt" },
  { slug: "doprava", label: "Doprava" },
  { slug: "vraceni-zbozi", label: "Vrácení zboží" },
  { slug: "faq", label: "FAQ" },
  { slug: "obchodni-podminky", label: "Obchodní podmínky" },
  { slug: "ochrana-osobnich-udaju", label: "Ochrana osobních údajů" },
  { slug: "reklamace", label: "Reklamace" },
];

export default function AdminCmsPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<Record<string, CmsPage>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadPages = async () => {
      const { data, error } = await supabase.from("cms_pages").select("*");
      if (!error && data) {
        const map: Record<string, CmsPage> = {};
        data.forEach((p: CmsPage) => {
          map[p.slug] = p;
        });
        setPages(map);
      }
      setLoading(false);
    };
    loadPages();
  }, []);

  const handleSave = async (slug: string) => {
    const page = pages[slug];
    if (!page) return;

    setSaving((prev) => ({ ...prev, [slug]: true }));

    const { error } = await supabase
      .from("cms_pages")
      .update({
        title: page.title,
        content: page.content,
        meta_description: page.meta_description,
      })
      .eq("slug", slug);

    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Uloženo", description: `Stránka "${page.title}" byla aktualizována.` });
    }

    setSaving((prev) => ({ ...prev, [slug]: false }));
  };

  const updatePage = (slug: string, updates: Partial<CmsPage>) => {
    setPages((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], ...updates },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">CMS</h1>
        <p className="text-muted-foreground">Správa obsahu stránek</p>
      </div>

      <Tabs defaultValue="o-nas">
        <TabsList className="flex-wrap h-auto">
          {pageSlugs.map((p) => (
            <TabsTrigger key={p.slug} value={p.slug}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {pageSlugs.map((p) => {
          const page = pages[p.slug];
          if (!page) return null;

          return (
            <TabsContent key={p.slug} value={p.slug}>
              <Card>
                <CardHeader>
                  <CardTitle>{page.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${p.slug}`}>Nadpis stránky</Label>
                    <Input
                      id={`title-${p.slug}`}
                      value={page.title}
                      onChange={(e) => updatePage(p.slug, { title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`meta-${p.slug}`}>Meta popis (SEO)</Label>
                    <Input
                      id={`meta-${p.slug}`}
                      value={page.meta_description || ""}
                      onChange={(e) => updatePage(p.slug, { meta_description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`content-${p.slug}`}>Obsah (HTML)</Label>
                    <Textarea
                      id={`content-${p.slug}`}
                      value={page.content}
                      onChange={(e) => updatePage(p.slug, { content: e.target.value })}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => handleSave(p.slug)}
                    disabled={saving[p.slug]}
                    className="rounded-full"
                  >
                    {saving[p.slug] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Uložit změny
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
