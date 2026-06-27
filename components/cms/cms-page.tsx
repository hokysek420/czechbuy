import { supabase } from "@/lib/supabase/client";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface CmsPageData {
  slug: string;
  title: string;
  content: string;
  meta_description: string;
}

export async function getCmsPage(slug: string): Promise<CmsPageData | null> {
  const { data } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return data as CmsPageData | null;
}

export function generateCmsMetadata(page: CmsPageData | null): Metadata {
  if (!page) {
    return { title: "Stránka nenalezena - CzechBuy" };
  }
  return {
    title: `${page.title} - CzechBuy`,
    description: page.meta_description || page.title,
  };
}

export function CmsPageView({ page }: { page: CmsPageData | null }) {
  if (!page) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Stránka nenalezena</h1>
          <p className="text-muted-foreground">Požadovaná stránka neexistuje.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground flex items-center gap-1">
            <Home className="h-4 w-4" />
            Domů
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{page.title}</span>
        </nav>

        <article className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">{page.title}</h1>
          <div
            className="text-muted-foreground leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_strong]:text-foreground"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    </div>
  );
}
