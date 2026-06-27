import { supabase } from "@/lib/supabase/client";

const BUCKET = "product-images";

function generateFileName(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}.${ext}`;
}

export async function uploadProductImage(file: File): Promise<{ url: string | null; error: Error | null }> {
  const fileName = generateFileName(file.name);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return { url: null, error: new Error(uploadError.message) };
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return { url: publicUrl, error: null };
}

export async function uploadProductImages(files: File[]): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const { url, error } = await uploadProductImage(file);
    if (error) {
      errors.push(`${file.name}: ${error.message}`);
    } else if (url) {
      urls.push(url);
    }
  }

  return { urls, errors };
}

export async function deleteProductImage(imageUrl: string): Promise<{ error: Error | null }> {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const fileName = pathParts[pathParts.length - 1];

    if (!fileName) {
      return { error: new Error("Invalid image URL") };
    }

    const { error } = await supabase.storage.from(BUCKET).remove([fileName]);
    return { error: error ? new Error(error.message) : null };
  } catch {
    return { error: new Error("Invalid image URL") };
  }
}

export function extractFileNameFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    return pathParts[pathParts.length - 1] || null;
  } catch {
    return null;
  }
}
