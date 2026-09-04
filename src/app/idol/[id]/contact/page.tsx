"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

interface ShopData {
  shopName: string;
  address: string;
  contactNumber: string;
}

export default function ContactRevealPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const unlockId = searchParams.get("unlockId");

  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      if (!unlockId) { setError(true); setLoading(false); return; }
      try {
        // Get the unlock document to find the idol
        const unlockSnap = await getDoc(doc(db, "unlocks", unlockId));
        if (!unlockSnap.exists()) { setError(true); return; }

        // Get the idol to find the shopId
        const idolSnap = await getDoc(doc(db, "idols", id));
        if (!idolSnap.exists()) { setError(true); return; }

        const shopId = idolSnap.data().shopId;
        const shopSnap = await getDoc(doc(db, "shops", shopId));
        if (!shopSnap.exists()) { setError(true); return; }

        setShop(shopSnap.data() as ShopData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id, unlockId]);

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12 pt-20">
        <div className="skeleton h-8 w-48 mx-auto rounded mb-6" />
        <div className="space-y-3">
          <div className="skeleton h-20 rounded-xl" />
          <div className="skeleton h-14 rounded-xl" />
          <div className="skeleton h-14 rounded-xl" />
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );

  if (error || !shop) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <span className="material-symbols-outlined text-warning mb-4" style={{ fontSize: "64px" }}>
          warning
        </span>
        <h2 className="text-xl font-bold font-display mb-2">Something went wrong</h2>
        <p className="text-on-surface-variant text-sm mb-6">
          We couldn&apos;t load the shop details. Please contact support if your payment was deducted.
        </p>
        <Link href="/" className="btn-secondary">Back to Home</Link>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );

  const whatsappNum = shop.contactNumber.replace(/\D/g, "");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-6 pt-20">
        <div className="text-center mb-6 animate-slide-up">
          <span className="material-symbols-outlined text-success mx-auto mb-2" style={{ fontSize: "64px", fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <h1 className="text-2xl font-bold font-display text-on-surface">
            Contact Unlocked! 🎉
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Here are the shop details for this idol
          </p>
        </div>

        {/* Shop card */}
        <div className="bg-card-surface rounded-xl border border-clay-base ambient-shadow overflow-hidden animate-fade-in">
          {/* Shop name header */}
          <div className="bg-primary-container p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: "24px" }}>
                storefront
              </span>
            </div>
            <div>
              <p className="text-xs text-white/70 font-medium">Shop Name</p>
              <p className="text-white font-bold text-lg font-display">
                {shop.shopName}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                  location_on
                </span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium mb-0.5">Address</p>
                <p className="text-sm font-medium text-on-surface">{shop.address}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                  call
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-on-surface-variant font-medium mb-0.5">Phone</p>
                <p className="text-sm font-semibold text-on-surface">{shop.contactNumber}</p>
              </div>
              <a
                href={`tel:${shop.contactNumber}`}
                className="btn-secondary text-xs py-2 px-4"
              >
                Call Now
              </a>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="px-5 pb-5">
            <a
              href={`https://wa.me/91${whatsappNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                chat
              </span>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Verification pending note */}
        <div className="bg-warning-bg border border-warning/20 rounded-xl p-4 mt-4 flex items-start gap-2">
          <span className="material-symbols-outlined text-warning flex-shrink-0 mt-0.5" style={{ fontSize: "16px" }}>
            warning
          </span>
          <p className="text-xs text-on-surface-variant">
            <span className="font-semibold text-warning">Payment pending verification.</span>{" "}
            Your ₹25 payment will be verified within a few hours. Contact details are accessible now.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="btn-secondary text-sm py-2.5 px-6">
            Browse More Idols
          </Link>
        </div>

        {/* Bottom spacing */}
        <div className="h-24 md:h-8" />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
