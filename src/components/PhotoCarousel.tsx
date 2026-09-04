"use client";

import Image from "next/image";
import { useState } from "react";

interface PhotoCarouselProps {
  photos: string[];
  alt?: string;
}

export default function PhotoCarousel({ photos, alt = "Idol photo" }: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (!photos || photos.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div className="relative w-full aspect-[4/5] bg-surface-container rounded-xl overflow-hidden border border-clay-base ambient-shadow">
      {/* Main image */}
      <Image
        src={photos[current]}
        alt={`${alt} ${current + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        priority={current === 0}
        sizes="(max-width: 768px) 100vw, 600px"
      />

      {/* Nav arrows (only if multiple photos) */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-card-surface/80 hover:bg-card-surface text-on-surface rounded-full flex items-center justify-center backdrop-blur-sm transition-all ambient-shadow"
            aria-label="Previous photo"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              chevron_left
            </span>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-card-surface/80 hover:bg-card-surface text-on-surface rounded-full flex items-center justify-center backdrop-blur-sm transition-all ambient-shadow"
            aria-label="Next photo"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              chevron_right
            </span>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-200 rounded-full ${
                  i === current
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-on-surface/30 hover:bg-on-surface/50"
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-3 right-3 bg-card-surface/90 text-on-surface text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
            {current + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
