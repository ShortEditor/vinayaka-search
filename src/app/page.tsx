"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import FilterBar from "@/components/FilterBar";
import IdolCard, { IdolCardSkeleton } from "@/components/IdolCard";

interface Idol {
  id: string;
  photos: string[];
  price: number;
  heightFt: number;
  style?: string;
  shopName?: string;
  createdAt?: { seconds: number } | null;
}

function parseHeightFilter(val: string): number | null {
  return parseFloat(val.replace(" ft", "")) || null;
}

function matchesPrice(price: number, filter: string): boolean {
  if (filter === "under1000") return price < 1000;
  if (filter === "1000-3000") return price >= 1000 && price <= 3000;
  if (filter === "3000-7000") return price >= 3000 && price <= 7000;
  if (filter === "above7000") return price > 7000;
  return true;
}

export default function HomePage() {
  const [idols, setIdols] = useState<Idol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedHeight, setSelectedHeight] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  // Equality-only query: works on Firestore's automatic single-field indexes,
  // so no composite index is required. Sorting happens client-side below.
  const fetchIdols = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "idols"),
        where("status", "==", "active"),
        where("listingPaymentStatus", "==", "verified")
      );
      const snap = await getDocs(q);

      // For each idol, we could join shop data — for MVP, shop name is denormalized
      const data: Idol[] = snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...(doc.data() as Omit<Idol, "id">),
      }));
      data.sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      );
      setIdols(data);
    } catch (err) {
      console.error("Error fetching idols:", err);
      setError(
        err instanceof Error && err.message.includes("permission")
          ? "The marketplace database is not accepting public reads right now (Firestore rules)."
          : "We couldn't load the idols. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdols();
  }, [fetchIdols, retryCount]);

  // Client-side filtering
  const filtered = idols.filter((idol) => {
    if (selectedHeight) {
      const h = parseHeightFilter(selectedHeight);
      if (h !== null && idol.heightFt !== h) return false;
    }
    if (selectedPrice && !matchesPrice(idol.price, selectedPrice)) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <FilterBar
        selectedHeight={selectedHeight}
        selectedPrice={selectedPrice}
        onHeightChange={setSelectedHeight}
        onPriceChange={setSelectedPrice}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 pb-24 md:pb-12">
        {/* Results count */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-on-surface-variant">
              {filtered.length === 0
                ? "No idols found"
                : `${filtered.length} idol${filtered.length !== 1 ? "s" : ""} found`}
              {(selectedHeight || selectedPrice) && " with selected filters"}
            </p>
            {(selectedHeight || selectedPrice) && (
              <button
                onClick={() => { setSelectedHeight(null); setSelectedPrice(null); }}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <IdolCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-danger-bg flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-danger" style={{ fontSize: "40px" }}>
                cloud_off
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-on-surface mb-2">
              Couldn&apos;t load the marketplace
            </h2>
            <p className="text-on-surface-variant text-sm max-w-xs mb-4">{error}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="btn-primary text-sm py-2.5 px-6"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: "40px" }}>
                {selectedHeight || selectedPrice ? "filter_alt_off" : "storefront"}
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-on-surface mb-2">
              {selectedHeight || selectedPrice ? "No matching idols found" : "No Idols Listed Yet"}
            </h2>
            <p className="text-on-surface-variant text-sm max-w-xs mb-4">
              {selectedHeight || selectedPrice
                ? "Try removing some filters to see more idols."
                : "Be the first artisan or vendor to list a handcrafted clay idol!"}
            </p>
            {selectedHeight || selectedPrice ? (
              <button
                onClick={() => { setSelectedHeight(null); setSelectedPrice(null); }}
                className="btn-secondary text-sm py-2 px-5"
              >
                Clear Filters
              </button>
            ) : (
              <Link href="/list" className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  add_circle
                </span>
                List an Idol (₹10)
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((idol) => (
              <IdolCard
                key={idol.id}
                id={idol.id}
                photos={idol.photos}
                price={idol.price}
                heightFt={idol.heightFt}
                style={idol.style}
                shopName={idol.shopName}
              />
            ))}
          </div>
        )}

        {/* Bottom spacing for mobile nav */}
        <div className="h-24 md:h-8" />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
