import { supabase } from "@/lib/supabase/client";
import { CmsPageView, generateCmsMetadata } from "@/components/cms/cms-page";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await supabase.from("cms_pages").select("*").eq("slug", "reklamace").maybeSingle().then(r => r.data as any);
  return generateCmsMetadata(page);
}

export default async function ComplaintsPage() {
  const { data } = await supabase.from("cms_pages").select("*").eq("slug", "reklamace").maybeSingle();
  return <CmsPageView page={data as any} />;
}
