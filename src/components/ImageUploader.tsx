"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 1.5;

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  maxPhotos?: number;
}

export default function ImageUploader({ onImagesChange, maxPhotos = MAX_PHOTOS }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<File> => {
    // Dynamically import to avoid SSR issues
    const imageCompression = (await import("browser-image-compression")).default;
    return imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const remaining = maxPhotos - previews.length;
      if (remaining <= 0) return;

      const newFiles = Array.from(files).slice(0, remaining);
      const newPreviews: { url: string; file: File }[] = [];

      for (const file of newFiles) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const compressed = await compressImage(file);
          const url = URL.createObjectURL(compressed);
          newPreviews.push({ url, file: compressed });
        } catch {
          newPreviews.push({ url: URL.createObjectURL(file), file });
        }
      }

      const updated = [...previews, ...newPreviews];
      setPreviews(updated);
      onImagesChange(updated.map((p) => p.file));
    },
    [previews, maxPhotos, onImagesChange]
  );

  const removeImage = (index: number) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onImagesChange(updated.map((p) => p.file));
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      {previews.length < maxPhotos && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-outline-variant hover:border-primary/60 hover:bg-surface-container"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "32px" }}>
                cloud_upload
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">
                Tap to upload photos
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                {previews.length} / {maxPhotos} photos added · Max {MAX_SIZE_MB}MB each
              </p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Previews grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {previews.map((p, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-container group">
              <Image
                src={p.url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
              />
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary-container/80 text-white text-[9px] text-center py-0.5 font-semibold">
                  MAIN
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  close
                </span>
              </button>
            </div>
          ))}
          {/* Add more slot */}
          {previews.length < maxPhotos && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-outline-variant hover:border-primary/60 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-outline" style={{ fontSize: "24px" }}>
                add_photo_alternate
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
