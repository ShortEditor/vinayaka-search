"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { useAuth } from "@/lib/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

interface UnlockDoc {
  id: string;
  idolId: string;
  paymentUTR: string;
  paymentStatus: "pending" | "verified";
  unlockedAt: { seconds: number } | null;
  idol?: {
    shopName?: string;
    price?: number;
    heightFt?: number;
    photos?: string[];
  } | null;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [unlocks, setUnlocks] = useState<UnlockDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/orders");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Equality-only query (no composite index); sorted client-side below.
        const q = query(collection(db, "unlocks"), where("buyerUid", "==", user.uid));
        const snap = await getDocs(q);
        const base: UnlockDoc[] = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
          id: d.id,
          ...(d.data() as Omit<UnlockDoc, "id">),
        }));
        base.sort(
          (a, b) => (b.unlockedAt?.seconds ?? 0) - (a.unlockedAt?.seconds ?? 0)
        );

        // Attach idol details for display
        const withIdols = await Promise.all(
          base.map(async (u) => {
            try {
              const idolSnap = await getDoc(doc(db, "idols", u.idolId));
              if (!idolSnap.exists()) return { ...u, idol: null };
              const d = idolSnap.data();
              return {
                ...u,
                idol: {
                  shopName: d.shopName,
                  price: d.price,
                  heightFt: d.heightFt,
                  photos: d.photos,
                },
              };
            } catch {
              return { ...u, idol: null };
            }
          })
        );
        setUnlocks(withIdols);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("We couldn't load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const formatDate = (ts: { seconds: number } | null) =>
    ts ? new Date(ts.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clay-base">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 pt-24 pb-24">
        <h1 className="text-2xl font-bold font-display text-on-surface mb-6">My Orders</h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
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
        ) : unlocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: "40px" }}>
                receipt_long
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-on-surface mb-2">No orders yet</h2>
            <p className="text-on-surface-variant text-sm max-w-xs mb-5">
              When you unlock a shop&apos;s contact details, your order will appear here.
            </p>
            <Link href="/" className="btn-primary text-sm py-2.5 px-6">
              Browse Idols
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {unlocks.map((u) => {
              const verified = u.paymentStatus === "verified";
              return (
                <Link
                  key={u.id}
                  href={`/idol/${u.idolId}/contact?unlockId=${u.id}`}
                  className="block bg-card-surface rounded-xl border border-clay-base ambient-shadow p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex gap-3">
                    {u.idol?.photos?.[0] ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={u.idol.photos[0]}
                          alt={u.idol.shopName || "Idol"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-outline" style={{ fontSize: "24px" }}>
                          image
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-on-surface truncate">
                          {u.idol?.shopName || "Idol listing"}
                        </p>
                        <span
                          className={`badge text-xs whitespace-nowrap ${
                            verified ? "badge-status-verified" : "badge-status-pending"
                          }`}
                        >
                          {verified ? "Unlocked" : "Verifying"}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {u.idol?.price != null && `₹${u.idol.price.toLocaleString("en-IN")}`}
                        {u.idol?.heightFt != null && ` · ${u.idol.heightFt} ft`}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {verified ? "Contact details ready" : "Payment verification in progress"} ·{" "}
                        {formatDate(u.unlockedAt)}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant self-center" style={{ fontSize: "20px" }}>
                      chevron_right
                    </span>
                  </div>
                </Link>
              );
            })}
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
