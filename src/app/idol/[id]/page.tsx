"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import PhotoCarousel from "@/components/PhotoCarousel";
import Link from "next/link";

interface IdolData {
  photos: string[];
  price: number;
  heightFt: number;
  style?: string;
  shopId: string;
  shopName?: string;
  status: string;
  listingPaymentStatus: string;
}

export default function IdolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [idol, setIdol] = useState<IdolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "idols", id));
        if (!snap.exists()) { setNotFound(true); return; }
        const data = snap.data() as IdolData;
        if (data.status !== "active" || data.listingPaymentStatus !== "verified") {
          setNotFound(true); return;
        }
        setIdol(data);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pt-20">
        <div className="skeleton h-[450px] rounded-xl mb-4" />
        <div className="skeleton h-8 w-32 rounded-full mb-3" />
        <div className="skeleton h-6 w-48 rounded mb-2" />
        <div className="skeleton h-12 rounded-xl mt-6" />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );

  if (notFound) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <span className="material-symbols-outlined text-outline mb-4" style={{ fontSize: "64px" }}>
          sentiment_dissatisfied
        </span>
        <h2 className="text-2xl font-bold font-display mb-2">Idol not found</h2>
        <p className="text-on-surface-variant mb-6">This listing may have been removed or is under review.</p>
        <Link href="/" className="btn-primary">Browse Other Idols</Link>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pt-20">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-4 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_back
          </span>
          Back to browse
        </button>

        {/* Photo carousel */}
        <PhotoCarousel photos={idol!.photos} alt="Idol" />

        {/* Details card */}
        <div className="bg-card-surface rounded-xl border border-clay-base p-5 mt-4 ambient-shadow animate-fade-in">
          {/* Price + Height row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-display text-3xl font-bold text-primary">
              ₹{idol!.price.toLocaleString("en-IN")}
            </span>
            <span className="badge badge-height text-sm px-3 py-1">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                straighten
              </span>
              {idol!.heightFt} ft tall
            </span>
          </div>

          {/* Style */}
          {idol!.style && (
            <p className="text-sm text-on-surface-variant mb-3">
              <span className="font-semibold text-on-surface">Style:</span> {idol!.style}
            </p>
          )}

          {/* Trust signal */}
          <div className="flex items-center gap-2 bg-success-bg rounded-xl px-4 py-2.5 mb-4">
            <span className="material-symbols-outlined text-success" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <div>
              <p className="text-xs font-semibold text-success">Verified Listing</p>
              <p className="text-xs text-on-surface-variant">Payment confirmed by platform owner</p>
            </div>
          </div>

          {/* Contact blur teaser */}
          <div className="bg-surface-container rounded-xl p-4 mb-4 border border-outline-variant">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Shop Details</p>
            <div className="space-y-1.5">
              <div className="h-3 rounded bg-outline-variant w-3/4 blur-[3px]" />
              <div className="h-3 rounded bg-outline-variant w-full blur-[3px]" />
              <div className="h-3 rounded bg-outline-variant w-2/4 blur-[3px]" />
            </div>
            <p className="text-xs text-on-surface-variant mt-3 text-center">Pay ₹25 to unlock shop address & contact</p>
          </div>

          {/* CTA */}
          <Link href={`/idol/${id}/unlock`} className="btn-primary w-full text-base py-4">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              lock_open
            </span>
            Get Contact Details — ₹25
          </Link>
          <p className="text-center text-xs text-on-surface-variant mt-2">
            One-time payment to see shop address & phone number
          </p>
        </div>

        {/* Bottom spacing */}
        <div className="h-24 md:h-8" />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
