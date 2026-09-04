"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/profile");
    }
  }, [authLoading, user, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clay-base">
        <div className="spinner" />
      </div>
    );
  }

  const displayName = user.displayName || user.email || "Devotee";
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-6 pt-20">
        <h1 className="text-2xl font-bold font-display text-on-surface mb-6">My Profile</h1>

        {/* Account card */}
        <div className="bg-card-surface rounded-2xl border border-clay-base ambient-shadow overflow-hidden mb-5">
          <div className="bg-primary-container p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold font-display text-white leading-none">
                {initial}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-lg font-display truncate">
                {user.displayName || "Devotee"}
              </p>
              <p className="text-white/75 text-sm truncate">{user.email}</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {memberSince && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                    calendar_today
                  </span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium mb-0.5">Member since</p>
                  <p className="text-sm font-medium text-on-surface">{memberSince}</p>
                </div>
              </div>
            )}

            <Link
              href="/orders"
              className="flex items-center gap-3 p-3 -m-1 rounded-xl hover:bg-surface-container transition-colors"
            >
              <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                  receipt_long
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">My Orders</p>
                <p className="text-xs text-on-surface-variant">Shop contacts you&apos;ve unlocked</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>
                chevron_right
              </span>
            </Link>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-danger/30 text-danger bg-danger-bg text-sm font-semibold hover:bg-danger hover:text-white transition-colors active:scale-[0.99]"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            logout
          </span>
          Sign Out
        </button>

        {/* Bottom spacing for mobile nav */}
        <div className="h-24 md:h-8" />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
