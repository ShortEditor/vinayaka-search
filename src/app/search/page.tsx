"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
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

const suggestions = ["Traditional", "Modern", "2 ft", "Ganesh"];

export default function SearchPage() {
  const [idols, setIdols] = useState<Idol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("");

  useEffect(() => {
    const fetchIdols = async () => {
      setLoading(true);
      setError(null);
      try {
        // Equality-only query — no composite index needed.
        const q = query(
          collection(db, "idols"),
          where("status", "==", "active"),
          where("listingPaymentStatus", "==", "verified")
        );
        const snap = await getDocs(q);
        const data: Idol[] = snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...(doc.data() as Omit<Idol, "id">),
        }));
        data.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setIdols(data);
      } catch (err) {
        console.error("Error fetching idols for search:", err);
        setError("We couldn't load the idols to search. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchIdols();
  }, []);

  const q = queryText.trim().toLowerCase();
  const results = q
    ? idols.filter((idol) =>
        [
          idol.shopName,
          idol.style,
          `${idol.heightFt} ft`,
          `${idol.heightFt}ft`,
          `₹${idol.price}`,
        ]
          .filter(Boolean)
          .some((field) => (field as string).toLowerCase().includes(q))
      )
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 pb-24">
        <h1 className="text-2xl font-bold font-display text-on-surface mb-4">Search</h1>

        {/* Search input */}
        <div className="relative mb-4">
          <span
            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            style={{ fontSize: "22px" }}
          >
            search
          </span>
          <input
            type="search"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search by shop, style or size…"
            className="input-field w-full !pl-12 !pr-11 py-3.5 rounded-2xl"
          />
          {queryText && (
            <button
              aria-label="Clear search"
              onClick={() => setQueryText("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                close
              </span>
            </button>
          )}
        </div>

        {/* Suggestion chips */}
        {!q && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-on-surface-variant self-center mr-1">Try:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQueryText(s)}
                className="filter-chip text-xs"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        {q && !loading && (
          <p className="text-sm text-on-surface-variant mb-4">
            {results.length === 0
              ? `No idols match “${queryText.trim()}”`
              : `${results.length} idol${results.length !== 1 ? "s" : ""} match “${queryText.trim()}”`}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <IdolCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-danger mb-3" style={{ fontSize: "48px" }}>
              cloud_off
            </span>
            <p className="text-on-surface-variant text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary text-sm py-2.5 px-6">
              Try Again
            </button>
          </div>
        ) : q && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: "40px" }}>
                search_off
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-on-surface mb-2">Nothing found</h2>
            <p className="text-on-surface-variant text-sm max-w-xs">
              Try a different shop name, style, or size — for example “Traditional” or “2 ft”.
            </p>
          </div>
        ) : q ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {results.map((idol) => (
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: "40px" }}>
                manage_search
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-on-surface mb-2">
              Find your perfect mūrti
            </h2>
            <p className="text-on-surface-variant text-sm max-w-xs">
              Search across all listed idols by shop name, style, height or price.
            </p>
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
