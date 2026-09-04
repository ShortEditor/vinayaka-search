"use client";

import { useState } from "react";

export const HEIGHT_OPTIONS = [
  "1 ft", "1.5 ft", "2 ft", "2.5 ft", "3 ft", "3.5 ft",
  "4 ft", "4.5 ft", "5 ft", "6 ft", "7 ft", "8 ft", "9 ft", "10 ft",
];

export const PRICE_OPTIONS = [
  { label: "Under ₹1,000", value: "under1000" },
  { label: "₹1,000 – ₹3,000", value: "1000-3000" },
  { label: "₹3,000 – ₹7,000", value: "3000-7000" },
  { label: "₹7,000+", value: "above7000" },
];

interface FilterBarProps {
  selectedHeight: string | null;
  selectedPrice: string | null;
  onHeightChange: (val: string | null) => void;
  onPriceChange: (val: string | null) => void;
}

export default function FilterBar({
  selectedHeight,
  selectedPrice,
  onHeightChange,
  onPriceChange,
}: FilterBarProps) {
  const [showAllHeights, setShowAllHeights] = useState(false);
  const visibleHeights = showAllHeights ? HEIGHT_OPTIONS : HEIGHT_OPTIONS.slice(0, 8);

  return (
    <section className="sticky top-16 mt-16 z-40 bg-card-surface/95 backdrop-blur-sm pt-3.5 pb-3.5 border-b border-clay-base kolam-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-3">
          {/* Height Row */}
          <div className="flex overflow-x-auto no-scrollbar gap-2.5 items-center">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest shrink-0 pr-1">
              Height
            </span>
            {visibleHeights.map((h) => (
              <button
                key={h}
                onClick={() => onHeightChange(selectedHeight === h ? null : h)}
                className={`filter-chip ${selectedHeight === h ? "active" : ""}`}
              >
                {h}
              </button>
            ))}
            <button
              onClick={() => setShowAllHeights(!showAllHeights)}
              className="text-xs text-primary font-semibold hover:underline shrink-0 px-2"
            >
              {showAllHeights ? "Less" : "More ↓"}
            </button>
          </div>

          {/* Price Row */}
          <div className="flex overflow-x-auto no-scrollbar gap-2.5 items-center">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest shrink-0 pr-1">
              Price
            </span>
            {PRICE_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => onPriceChange(selectedPrice === p.value ? null : p.value)}
                className={`price-chip ${selectedPrice === p.value ? "active" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
