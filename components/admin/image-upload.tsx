"use client";

import { useState, useCallback } from "react";
import { Upload, X, GripVertical, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadProductImages, deleteProductImage } from "@/lib/storage-utils";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) {
        toast({ title: "Chyba", description: "Vyberte prosím obrázky.", variant: "destructive" });
        return;
      }

      setUploading(true);
      const { urls, errors } = await uploadProductImages(imageFiles);

      if (urls.length > 0) {
        onChange([...images, ...urls]);
      }

      if (errors.length > 0) {
        toast({
          title: "Chyba nahrávání",
          description: errors.join("\n"),
          variant: "destructive",
        });
      }

      setUploading(false);
    },
    [images, onChange, toast]
  );

  const handleRemove = useCallback(
    async (index: number) => {
      const imageUrl = images[index];
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);

      // Delete from storage asynchronously
      const { error } = await deleteProductImage(imageUrl);
      if (error) {
        toast({ title: "Varování", description: "Obrázek nebyl smazán ze storage.", variant: "destructive" });
      }
    },
    [images, onChange, toast]
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newImages = [...images];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      onChange(newImages);
    },
    [images, onChange]
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          id="image-upload"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <label htmlFor="image-upload" className="cursor-pointer block">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Nahrávání...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Přetáhněte obrázky sem nebo klikněte pro výběr</span>
              <span className="text-xs text-muted-foreground">Podporováno: JPG, PNG, WEBP</span>
            </div>
          )}
        </label>
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <div
              key={`${img}-${i}`}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                handleReorder(fromIndex, i);
              }}
            >
              <img src={img} alt={`Obrázek ${i + 1}`} className="w-full h-full object-cover" />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="p-1.5 rounded-full bg-white/90 text-destructive hover:bg-white transition-colors"
                    title="Smazat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Drag handle */}
              <div className="absolute top-1 left-1 p-1 rounded bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="h-3 w-3" />
              </div>

              {/* Index badge */}
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-xs">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
