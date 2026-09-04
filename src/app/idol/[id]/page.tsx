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

interface ShopData {
  shopName: string;
  address: string;
  contactNumber: string;
}

export default function IdolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [idol, setIdol] = useState<IdolData | null>(null);
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "idols", id));
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        const data = snap.data() as IdolData;
        if (data.status !== "active" || data.listingPaymentStatus !== "verified") {
          setNotFound(true);
          return;
        }
        setIdol(data);

        if (data.shopId) {
          try {
            const shopSnap = await getDoc(doc(db, "shops", data.shopId));
            if (shopSnap.exists()) {
              setShop(shopSnap.data() as ShopData);
            }
          } catch (err) {
            console.error("Error loading shop info:", err);
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
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
  }

  if (notFound) {
    return (
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
  }

  const cleanPhone = (shop?.contactNumber || "").replace(/\D/g, "");

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
          <div className="flex items-center gap-2 bg-success-bg rounded-xl px-4 py-2.5 mb-5">
            <span className="material-symbols-outlined text-success" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <div>
              <p className="text-xs font-semibold text-success">Verified Listing</p>
              <p className="text-xs text-on-surface-variant">Listing payment confirmed on Matti Mūrti</p>
            </div>
          </div>

          {/* Direct Artisan & Shop Details (Free Access) */}
          <div className="bg-surface-container rounded-xl p-5 border border-outline-variant">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "22px" }}>
                storefront
              </span>
              <h3 className="font-display text-base font-bold text-on-surface">
                Artisan & Shop Contact
              </h3>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Shop Name</p>
                <p className="text-sm font-semibold text-on-surface mt-0.5">
                  {shop?.shopName || idol!.shopName || "Artisan Workshop"}
                </p>
              </div>

              {shop?.address && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Address</p>
                  <p className="text-sm text-on-surface mt-0.5 leading-relaxed">
                    {shop.address}
                  </p>
                </div>
              )}

              {shop?.contactNumber && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Phone / WhatsApp</p>
                  <p className="text-sm font-semibold text-primary mt-0.5">
                    {shop.contactNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Direct Contact Actions */}
            {shop?.contactNumber && (
              <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-outline-variant/40">
                <a
                  href={`tel:${shop.contactNumber}`}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 font-semibold text-sm shadow-md"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    call
                  </span>
                  Call Artisan
                </a>
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Namaste! I found your ${idol!.heightFt}ft ₹${idol!.price.toLocaleString("en-IN")} clay idol on Matti Mūrti. Is it available?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2 font-semibold text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white border-none shadow-md"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    chat
                  </span>
                  WhatsApp
                </a>
              </div>
            )}

            {shop?.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${shop.shopName || idol!.shopName || ""} ${shop.address}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-primary font-semibold mt-4 hover:underline"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  location_on
                </span>
                Open Directions in Google Maps
              </a>
            )}
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-24 md:h-8" />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
