"use client";

import Image from "next/image";
import { useState } from "react";

interface PaymentScreenProps {
  amount: number;
  purpose: string;
  onSubmitUTR: (utr: string) => Promise<void>;
  submitting?: boolean;
}

export default function PaymentScreen({
  amount,
  purpose,
  onSubmitUTR,
  submitting = false,
}: PaymentScreenProps) {
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = utr.trim();
    if (!trimmed || trimmed.length < 8) {
      setError("Please enter a valid UTR / Transaction ID (min 8 characters)");
      return;
    }
    await onSubmitUTR(trimmed);
  };

  return (
    <div className="max-w-sm mx-auto animate-slide-up">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "36px" }}>
            qr_code_2
          </span>
        </div>
        <h2 className="text-3xl font-bold font-display text-on-surface">
          Pay ₹{amount}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">{purpose}</p>
      </div>

      {/* QR Code box */}
      <div className="bg-card-surface rounded-xl border border-clay-base p-6 mb-5 text-center ambient-shadow">
        <div className="inline-block p-3 bg-white rounded-xl border border-outline-variant mb-3">
          <div className="relative w-48 h-48">
            <Image
              src="/upi-qr.png"
              alt="UPI QR Code"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <p className="text-xs text-on-surface-variant">Scan with any UPI app</p>
        <p className="text-sm font-bold text-on-surface mt-1">9160068402-3@ybl</p>

        <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-center gap-2">
          <span className="text-xs text-on-surface-variant">Amount:</span>
          <span className="badge badge-price text-base font-bold">₹{amount}</span>
        </div>
      </div>

      {/* UTR input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Enter UTR / Transaction ID after paying
          </label>
          <input
            type="text"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="e.g. 406123456789"
            className="input-field"
            disabled={submitting}
          />
          {error && (
            <p className="mt-1.5 text-xs text-danger">{error}</p>
          )}
          <p className="mt-1.5 text-xs text-on-surface-variant">
            Find this in your UPI app under transaction details
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !utr.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {submitting ? (
            <>
              <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
              Submitting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                check_circle
              </span>
              I&apos;ve Paid – Confirm
            </>
          )}
        </button>
      </form>

      {/* Trust note */}
      <p className="text-center text-xs text-outline mt-4">
        🔒 Payment verified by the platform owner within a few hours
      </p>
    </div>
  );
}
