"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import PaymentScreen from "@/components/PaymentScreen";

export default function UnlockPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitUTR = async (utr: string) => {
    setSubmitting(true);
    try {
      // Generate a simple device fingerprint (browser-based, not foolproof)
      const deviceFingerprint = btoa(
        `${navigator.userAgent}-${screen.width}x${screen.height}-${Intl.DateTimeFormat().resolvedOptions().timeZone}`
      ).slice(0, 32);

      // Link the unlock to the signed-in account when there is one, so it
      // shows up under My Orders.
      const user = auth.currentUser;

      const docRef = await addDoc(collection(db, "unlocks"), {
        idolId: id,
        paymentUTR: utr,
        paymentStatus: "pending",
        deviceFingerprint,
        ...(user ? { buyerUid: user.uid, buyerEmail: user.email ?? null } : {}),
        unlockedAt: serverTimestamp(),
      });

      // Redirect to contact page with the unlock document ID
      router.push(`/idol/${id}/contact?unlockId=${docRef.id}`);
    } catch (err) {
      console.error("Error saving unlock:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-6 pt-20">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_back
          </span>
          Back to idol details
        </button>

        {/* Sign-in nudge: optional, unlocking stays open to everyone */}
        {!authLoading && !user && (
          <div className="bg-secondary-container/30 border border-secondary/20 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-secondary flex-shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
              info
            </span>
            <p className="text-xs text-on-surface-variant">
              <Link href={`/login?next=/idol/${id}/unlock`} className="font-semibold text-primary hover:underline">
                Sign in
              </Link>{" "}
              to keep this unlock in <span className="font-semibold">My Orders</span> — or continue as a guest.
            </p>
          </div>
        )}

        <PaymentScreen
          amount={25}
          purpose="Pay ₹25 to unlock shop contact details (address + phone number)"
          onSubmitUTR={handleSubmitUTR}
          submitting={submitting}
        />

        {/* Bottom spacing */}
        <div className="h-24 md:h-8" />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
