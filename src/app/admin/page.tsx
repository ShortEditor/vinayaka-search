"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Image from "next/image";

type Tab = "pending" | "listings" | "unlocks";

interface IdolDoc {
  id: string;
  shopName: string;
  price: number;
  heightFt: number;
  style?: string;
  photos: string[];
  listingPaymentStatus: "pending" | "verified" | "rejected";
  listingPaymentUTR: string;
  status: "active" | "inactive";
  createdAt: { seconds: number } | null;
}

interface UnlockDoc {
  id: string;
  idolId: string;
  paymentUTR: string;
  paymentStatus: "pending" | "verified";
  unlockedAt: { seconds: number } | null;
}

interface Feedback {
  type: "success" | "error";
  text: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [idols, setIdols] = useState<IdolDoc[]>([]);
  const [unlocks, setUnlocks] = useState<UnlockDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/admin/login");
      } else {
        setAuthChecked(true);
        loadData();
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [idolSnap, unlockSnap] = await Promise.all([
        getDocs(query(collection(db, "idols"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "unlocks"), orderBy("unlockedAt", "desc"))),
      ]);
      setIdols(idolSnap.docs.map((d) => ({ id: d.id, ...d.data() } as IdolDoc)));
      setUnlocks(unlockSnap.docs.map((d) => ({ id: d.id, ...d.data() } as UnlockDoc)));
    } catch (err) {
      console.error("Error loading admin data:", err);
      setFeedback({
        type: "error",
        text: "Failed to load admin data. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const approveIdol = async (idol: IdolDoc) => {
    setActionLoading(idol.id);
    try {
      await updateDoc(doc(db, "idols", idol.id), {
        listingPaymentStatus: "verified",
        status: "active",
      });
      setIdols((prev) =>
        prev.map((i) =>
          i.id === idol.id
            ? { ...i, listingPaymentStatus: "verified", status: "active" }
            : i
        )
      );
      showFeedback("success", `Approved and published ${idol.shopName || "idol listing"}! 🎉`);
    } catch (err) {
      console.error("Error approving idol:", err);
      showFeedback(
        "error",
        err instanceof Error ? err.message : "Failed to approve listing."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const rejectIdol = async (idol: IdolDoc) => {
    setActionLoading(`reject-${idol.id}`);
    try {
      await updateDoc(doc(db, "idols", idol.id), {
        listingPaymentStatus: "rejected",
        status: "inactive",
      });
      setIdols((prev) =>
        prev.map((i) =>
          i.id === idol.id
            ? { ...i, listingPaymentStatus: "rejected", status: "inactive" }
            : i
        )
      );
      showFeedback("success", `Rejected listing for ${idol.shopName || "idol"}.`);
    } catch (err) {
      console.error("Error rejecting idol:", err);
      showFeedback(
        "error",
        err instanceof Error ? err.message : "Failed to reject listing."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const deleteIdol = async (idol: IdolDoc) => {
    if (!window.confirm(`Permanently delete listing for "${idol.shopName || "idol"}"?`)) {
      return;
    }
    setActionLoading(`delete-${idol.id}`);
    try {
      await deleteDoc(doc(db, "idols", idol.id));
      setIdols((prev) => prev.filter((i) => i.id !== idol.id));
      showFeedback("success", `Deleted listing for ${idol.shopName || "idol"}.`);
    } catch (err) {
      console.error("Error deleting idol:", err);
      showFeedback(
        "error",
        err instanceof Error ? err.message : "Failed to delete listing."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const approveUnlock = async (unlock: UnlockDoc) => {
    setActionLoading(`unlock-${unlock.id}`);
    try {
      await updateDoc(doc(db, "unlocks", unlock.id), {
        paymentStatus: "verified",
      });
      setUnlocks((prev) =>
        prev.map((u) =>
          u.id === unlock.id ? { ...u, paymentStatus: "verified" } : u
        )
      );
      showFeedback("success", "Verified unlock payment!");
    } catch (err) {
      console.error("Error approving unlock:", err);
      showFeedback("error", "Failed to verify unlock payment.");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleIdolStatus = async (idol: IdolDoc) => {
    const newStatus = idol.status === "active" ? "inactive" : "active";
    setActionLoading(`toggle-${idol.id}`);
    try {
      await updateDoc(doc(db, "idols", idol.id), { status: newStatus });
      setIdols((prev) =>
        prev.map((i) => (i.id === idol.id ? { ...i, status: newStatus } : i))
      );
      showFeedback(
        "success",
        `Idol listing is now ${newStatus === "active" ? "Live" : "Inactive"}.`
      );
    } catch (err) {
      console.error("Error toggling status:", err);
      showFeedback("error", "Failed to change status.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clay-base">
        <div className="spinner" />
      </div>
    );
  }

  // Revenue calculations
  const verifiedListings = idols.filter(
    (i) => i.listingPaymentStatus === "verified"
  );
  const verifiedUnlocks = unlocks.filter(
    (u) => u.paymentStatus === "verified"
  );
  const pendingIdols = idols.filter((i) => i.listingPaymentStatus === "pending");
  const pendingUnlocks = unlocks.filter(
    (u) => u.paymentStatus === "pending"
  );
  const totalRevenue = verifiedListings.length * 10;

  const formatDate = (ts: { seconds: number } | null) =>
    ts ? new Date(ts.seconds * 1000).toLocaleString("en-IN") : "—";

  const statItems = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: "bar_chart",
      color: "text-primary",
    },
    {
      label: "Verified Listings",
      value: verifiedListings.length,
      icon: "storefront",
      color: "text-success",
    },
    {
      label: "Pending Approvals",
      value: pendingIdols.length + pendingUnlocks.length,
      icon: "pending_actions",
      color: "text-warning",
    },
    {
      label: "Total Listings",
      value: idols.length,
      icon: "inventory_2",
      color: "text-secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-clay-base">
      {/* Admin header */}
      <header className="bg-inverse-surface text-inverse-on-surface px-4 sm:px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: "18px" }}
            >
              admin_panel_settings
            </span>
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight text-white">
              Admin Portal
            </p>
            <p className="text-[10px] text-inverse-on-surface/60">
              Matti Mūrti Marketplace
            </p>
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut(auth);
            router.push("/admin/login");
          }}
          className="flex items-center gap-1.5 text-sm text-inverse-on-surface/70 hover:text-inverse-on-surface transition-colors"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px" }}
          >
            logout
          </span>
          Logout
        </button>
      </header>

      {/* Floating feedback alert */}
      {feedback && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold shadow-md ${
              feedback.type === "success"
                ? "bg-success-bg border-success/30 text-success"
                : "bg-danger-bg border-danger/30 text-danger"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                {feedback.type === "success" ? "check_circle" : "error"}
              </span>
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs hover:opacity-70"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Revenue cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="bg-card-surface rounded-xl border border-clay-base p-4 ambient-shadow"
            >
              <span
                className={`material-symbols-outlined mb-2 ${stat.color}`}
                style={{ fontSize: "24px" }}
              >
                {stat.icon}
              </span>
              <p className="text-2xl font-bold font-display text-on-surface">
                {stat.value}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-container rounded-xl p-1 mb-5 w-full overflow-x-auto">
          {(
            [
              {
                id: "pending",
                label: `Pending (${pendingIdols.length + pendingUnlocks.length})`,
              },
              { id: "listings", label: `All Listings (${idols.length})` },
              { id: "unlocks", label: `All Unlocks (${unlocks.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 text-sm font-semibold py-2.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-card-surface ambient-shadow text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* ── PENDING TAB ── */}
            {activeTab === "pending" && (
              <div className="space-y-4">
                {pendingIdols.length === 0 && pendingUnlocks.length === 0 && (
                  <div className="text-center py-16 text-on-surface-variant">
                    <span
                      className="material-symbols-outlined text-success mx-auto mb-2"
                      style={{
                        fontSize: "48px",
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      check_circle
                    </span>
                    <p className="font-semibold">
                      All caught up! No pending approvals.
                    </p>
                  </div>
                )}

                {/* Pending listings */}
                {pendingIdols.map((idol) => (
                  <div
                    key={idol.id}
                    className="bg-card-surface rounded-xl border border-clay-base p-4 ambient-shadow"
                  >
                    <div className="flex gap-3">
                      {idol.photos[0] && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant">
                          <Image
                            src={idol.photos[0]}
                            alt="Idol"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-sm">
                              {idol.shopName || "—"}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              ₹{idol.price?.toLocaleString("en-IN")} ·{" "}
                              {idol.heightFt}ft · {idol.style || "Traditional"}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-1">
                              📋 ₹10 Listing Fee
                            </p>
                          </div>
                          <span className="badge badge-status-pending text-xs whitespace-nowrap">
                            ₹10 Pending
                          </span>
                        </div>
                        <div className="mt-2 p-2.5 bg-surface-container rounded-lg border border-outline-variant/60">
                          <p className="text-xs text-on-surface-variant font-medium">
                            UTR / Transaction ID:
                          </p>
                          <p className="text-sm font-mono font-bold text-primary break-all">
                            {idol.listingPaymentUTR || "—"}
                          </p>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1.5">
                          📅 {formatDate(idol.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3.5 pt-3 border-t border-outline-variant/30">
                      <button
                        onClick={() => approveIdol(idol)}
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-success text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                      >
                        {actionLoading === idol.id ? (
                          <span
                            className="spinner"
                            style={{
                              width: "16px",
                              height: "16px",
                              borderWidth: "2px",
                              borderTopColor: "white",
                            }}
                          />
                        ) : (
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: "16px",
                              fontVariationSettings: "'FILL' 1",
                            }}
                          >
                            check_circle
                          </span>
                        )}
                        Approve & Publish
                      </button>

                      <button
                        onClick={() => rejectIdol(idol)}
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-danger-bg text-danger text-sm font-semibold border border-danger/20 hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `reject-${idol.id}` ? (
                          <span
                            className="spinner"
                            style={{
                              width: "16px",
                              height: "16px",
                              borderWidth: "2px",
                            }}
                          />
                        ) : (
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: "16px",
                              fontVariationSettings: "'FILL' 1",
                            }}
                          >
                            cancel
                          </span>
                        )}
                        Reject
                      </button>

                      <button
                        onClick={() => deleteIdol(idol)}
                        disabled={!!actionLoading}
                        className="p-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-danger-bg hover:text-danger transition-colors disabled:opacity-50"
                        title="Delete listing"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "18px" }}
                        >
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pending unlocks */}
                {pendingUnlocks.map((unlock) => (
                  <div
                    key={unlock.id}
                    className="bg-card-surface rounded-xl border border-clay-base p-4 ambient-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm">Unlock Payment</p>
                        <p className="text-xs text-on-surface-variant">
                          Idol ID: {unlock.idolId}
                        </p>
                      </div>
                      <span className="badge badge-status-pending text-xs">
                        ₹25 Pending
                      </span>
                    </div>
                    <div className="p-2 bg-surface-container rounded-lg mb-2">
                      <p className="text-xs text-on-surface-variant">
                        UTR / Transaction ID:
                      </p>
                      <p className="text-sm font-mono font-semibold break-all">
                        {unlock.paymentUTR}
                      </p>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3">
                      📅 {formatDate(unlock.unlockedAt)}
                    </p>
                    <button
                      onClick={() => approveUnlock(unlock)}
                      disabled={!!actionLoading}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-success text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {actionLoading === `unlock-${unlock.id}` ? (
                        <span
                          className="spinner"
                          style={{
                            width: "16px",
                            height: "16px",
                            borderWidth: "2px",
                            borderTopColor: "white",
                          }}
                        />
                      ) : (
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "16px",
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          check_circle
                        </span>
                      )}
                      Verify Unlock Payment
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── ALL LISTINGS TAB ── */}
            {activeTab === "listings" && (
              <div className="space-y-3">
                {idols.map((idol) => (
                  <div
                    key={idol.id}
                    className="bg-card-surface rounded-xl border border-clay-base p-4 flex items-center gap-3 ambient-shadow"
                  >
                    {idol.photos[0] && (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant">
                        <Image
                          src={idol.photos[0]}
                          alt="Idol"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {idol.shopName || "Untitled Shop"}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        ₹{idol.price?.toLocaleString("en-IN")} · {idol.heightFt}ft
                      </p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span
                          className={`badge text-xs ${
                            idol.listingPaymentStatus === "verified"
                              ? "badge-status-verified"
                              : idol.listingPaymentStatus === "rejected"
                              ? "bg-danger-bg text-danger"
                              : "badge-status-pending"
                          }`}
                        >
                          {idol.listingPaymentStatus === "verified"
                            ? "Payment ✓"
                            : idol.listingPaymentStatus === "rejected"
                            ? "Rejected"
                            : "Pending"}
                        </span>
                        <span
                          className={`badge text-xs ${
                            idol.status === "active"
                              ? "badge-status-verified"
                              : "badge-status-pending"
                          }`}
                        >
                          {idol.status === "active" ? "Live" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleIdolStatus(idol)}
                        disabled={
                          !!actionLoading ||
                          idol.listingPaymentStatus !== "verified"
                        }
                        className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all disabled:opacity-40 ${
                          idol.status === "active"
                            ? "border-danger/30 text-danger bg-danger-bg hover:bg-danger hover:text-white"
                            : "border-success/30 text-success bg-success-bg hover:bg-success hover:text-white"
                        }`}
                      >
                        {actionLoading === `toggle-${idol.id}`
                          ? "..."
                          : idol.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        onClick={() => deleteIdol(idol)}
                        disabled={!!actionLoading}
                        className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-danger-bg hover:text-danger transition-colors disabled:opacity-50"
                        title="Delete listing"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "18px" }}
                        >
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
                {idols.length === 0 && (
                  <p className="text-center text-on-surface-variant py-16">
                    No listings yet.
                  </p>
                )}
              </div>
            )}

            {/* ── UNLOCKS TAB ── */}
            {activeTab === "unlocks" && (
              <div className="space-y-3">
                {unlocks.map((unlock) => (
                  <div
                    key={unlock.id}
                    className="bg-card-surface rounded-xl border border-clay-base p-4 flex items-center justify-between gap-3 ambient-shadow"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        Idol: {unlock.idolId.slice(0, 12)}...
                      </p>
                      <p className="text-xs text-on-surface-variant font-mono">
                        UTR: {unlock.paymentUTR}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        📅 {formatDate(unlock.unlockedAt)}
                      </p>
                    </div>
                    <span
                      className={`badge text-xs flex-shrink-0 ${
                        unlock.paymentStatus === "verified"
                          ? "badge-status-verified"
                          : "badge-status-pending"
                      }`}
                    >
                      {unlock.paymentStatus === "verified"
                        ? "₹25 Paid ✓"
                        : "₹25 Pending"}
                    </span>
                  </div>
                ))}
                {unlocks.length === 0 && (
                  <p className="text-center text-on-surface-variant py-16">
                    No unlocks yet.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
