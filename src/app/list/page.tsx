"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import ImageUploader from "@/components/ImageUploader";
import PaymentScreen from "@/components/PaymentScreen";

const HEIGHT_OPTIONS = [
  1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 9, 10,
];

const STYLE_OPTIONS = [
  "Sitting", "Standing", "Dancing (Nritya)", "Eco-friendly (Clay)",
  "Panchamukhi", "Chaturbhuja", "Playing Veena", "Other",
];

type Step = "shop" | "idol" | "payment" | "done";

interface ShopForm {
  shopName: string;
  address: string;
  contactNumber: string;
}

interface IdolForm {
  price: string;
  heightFt: string;
  style: string;
}

export default function ListPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("shop");
  const [shopForm, setShopForm] = useState<ShopForm>({
    shopName: "",
    address: "",
    contactNumber: "",
  });
  const [idolForm, setIdolForm] = useState<IdolForm>({
    price: "",
    heightFt: "2",
    style: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Validation ---
  const validateShop = () => {
    const e: Record<string, string> = {};
    if (!shopForm.shopName.trim()) e.shopName = "Shop name is required";
    if (!shopForm.address.trim()) e.address = "Address is required";
    if (!shopForm.contactNumber.match(/^\d{10}$/))
      e.contactNumber = "Enter a valid 10-digit phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateIdol = () => {
    const e: Record<string, string> = {};
    if (!idolForm.price || isNaN(Number(idolForm.price)) || Number(idolForm.price) <= 0)
      e.price = "Enter a valid price";
    if (images.length === 0) e.images = "Upload at least 1 photo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- Upload images to Cloudinary (with Firebase Storage fallback) ---
  const uploadImages = async (shopId: string, idolId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", `vinayaka-marketplace/idols/${shopId}`);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            urls.push(data.url);
            continue;
          }
        }
      } catch (uploadErr) {
        console.warn("Cloudinary upload failed, falling back to Firebase Storage:", uploadErr);
      }

      // Fallback: Firebase Storage
      const storageRef = ref(storage, `idols/${shopId}/${idolId}/photo_${i}.jpg`);
      await uploadBytes(storageRef, file, { contentType: "image/jpeg" });
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  };

  // --- Step handlers ---
  const handleShopNext = () => {
    if (validateShop()) setStep("idol");
  };

  const handleIdolNext = () => {
    if (validateIdol()) setStep("payment");
  };

  const handlePaymentSubmit = async (utr: string) => {
    setSubmitting(true);
    try {
      // Save shop
      const shopRef = await addDoc(collection(db, "shops"), {
        shopName: shopForm.shopName,
        address: shopForm.address,
        contactNumber: shopForm.contactNumber,
        createdAt: serverTimestamp(),
      });

      // Save idol placeholder (to get ID for storage path)
      const idolRef = await addDoc(collection(db, "idols"), {
        shopId: shopRef.id,
        shopName: shopForm.shopName,
        photos: [],
        price: Number(idolForm.price),
        heightFt: parseFloat(idolForm.heightFt),
        style: idolForm.style,
        listingPaymentStatus: "pending",
        listingPaymentUTR: utr,
        status: "inactive",
        createdAt: serverTimestamp(),
      });

      // Upload images
      const photoUrls = await uploadImages(shopRef.id, idolRef.id);

      // Update idol with photo URLs
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(idolRef, { photos: photoUrls });

      setStep("done");
    } catch (err) {
      console.error("Error submitting listing:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Step indicator ---
  const stepLabels = [
    { id: "shop", label: "Shop Info", icon: "storefront" },
    { id: "idol", label: "Idol Details", icon: "photo_camera" },
    { id: "payment", label: "Pay ₹10", icon: "payments" },
  ];

  const currentStepIdx = ["shop", "idol", "payment", "done"].indexOf(step);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 pt-24 pb-24">
        <h1 className="text-3xl font-bold font-display text-on-surface mb-1">
          List Your Idol
        </h1>
        <p className="text-on-surface-variant text-sm mb-6">
          Reach buyers across the city — fill in your details below
        </p>

        {/* Step indicator */}
        {step !== "done" && (
          <div className="flex items-center gap-2 mb-8">
            {stepLabels.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < currentStepIdx
                        ? "bg-success text-white"
                        : i === currentStepIdx
                        ? "bg-primary-container text-white"
                        : "bg-outline-variant text-on-surface-variant"
                    }`}
                  >
                    {i < currentStepIdx ? (
                      <span className="material-symbols-outlined" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      i === currentStepIdx ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 rounded transition-all ${
                      i < currentStepIdx ? "bg-success" : "bg-outline-variant"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── STEP 1: Shop Details ─── */}
        {step === "shop" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                storefront
              </span>
              <h2 className="font-bold text-lg font-display">Your Shop Details</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Shop Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={shopForm.shopName}
                onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                placeholder="e.g. Sri Ganesh Vigrahalu"
                className="input-field"
              />
              {errors.shopName && <p className="mt-1 text-xs text-danger">{errors.shopName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Shop Address <span className="text-danger">*</span>
              </label>
              <textarea
                value={shopForm.address}
                onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                placeholder="Enter your full shop address including area/landmark"
                className="input-field resize-none"
                rows={3}
              />
              {errors.address && <p className="mt-1 text-xs text-danger">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                WhatsApp / Phone Number <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">+91</span>
                <input
                  type="tel"
                  value={shopForm.contactNumber}
                  onChange={(e) => setShopForm({ ...shopForm, contactNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="9876543210"
                  className="input-field !pl-16"
                  inputMode="numeric"
                />
              </div>
              {errors.contactNumber && <p className="mt-1 text-xs text-danger">{errors.contactNumber}</p>}
            </div>

            <button onClick={handleShopNext} className="btn-primary w-full mt-2">
              Next: Idol Details →
            </button>
          </div>
        )}

        {/* ─── STEP 2: Idol Details ─── */}
        {step === "idol" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                photo_camera
              </span>
              <h2 className="font-bold text-lg font-display">Idol Details</h2>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Idol Photos (up to 5) <span className="text-danger">*</span>
              </label>
              <ImageUploader onImagesChange={setImages} />
              {errors.images && <p className="mt-1 text-xs text-danger">{errors.images}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Price (₹) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={idolForm.price}
                  onChange={(e) => setIdolForm({ ...idolForm, price: e.target.value })}
                  placeholder="0"
                  className="input-field pl-9 text-lg font-bold"
                  inputMode="numeric"
                  min={0}
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-danger">{errors.price}</p>}
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Height <span className="text-danger">*</span>
              </label>
              <select
                value={idolForm.heightFt}
                onChange={(e) => setIdolForm({ ...idolForm, heightFt: e.target.value })}
                className="input-field appearance-none cursor-pointer"
              >
                {HEIGHT_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h} ft
                  </option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Style / Type <span className="text-on-surface-variant font-normal">(optional)</span>
              </label>
              <select
                value={idolForm.style}
                onChange={(e) => setIdolForm({ ...idolForm, style: e.target.value })}
                className="input-field appearance-none cursor-pointer"
              >
                <option value="">Select a style...</option>
                {STYLE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("shop")} className="btn-secondary flex-1">
                ← Back
              </button>
              <button onClick={handleIdolNext} className="btn-primary flex-1">
                Next: Pay ₹10 →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Payment ─── */}
        {step === "payment" && (
          <div className="animate-fade-in">
            <PaymentScreen
              amount={10}
              purpose="Pay ₹10 to publish your idol listing on the marketplace"
              onSubmitUTR={handlePaymentSubmit}
              submitting={submitting}
            />
            <button
              onClick={() => setStep("idol")}
              className="btn-secondary w-full mt-4 text-sm py-2.5"
            >
              ← Back to Idol Details
            </button>
          </div>
        )}

        {/* ─── STEP 4: Done ─── */}
        {step === "done" && (
          <div className="text-center py-8 animate-slide-up">
            <span className="material-symbols-outlined text-success mx-auto mb-4" style={{ fontSize: "80px", fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <h2 className="text-2xl font-bold font-display mb-2">
              Listing Submitted! 🎉
            </h2>
            <p className="text-on-surface-variant text-sm max-w-xs mx-auto mb-6">
              Your idol listing is under review. It will go live once your ₹10 payment is verified (usually within a few hours).
            </p>
            <div className="bg-surface-container rounded-xl border border-outline-variant p-4 mb-6 text-left">
              <p className="text-xs text-on-surface-variant font-medium mb-1">What happens next?</p>
              <ul className="text-sm text-on-surface space-y-1.5">
                <li>✅ Your listing is saved and pending review</li>
                <li>🔍 We verify your payment (UTR) within a few hours</li>
                <li>🌟 Once approved, your idol goes live for buyers to see</li>
                <li>📞 Buyers pay ₹25 to unlock your contact details</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setStep("shop");
                  setShopForm({ shopName: "", address: "", contactNumber: "" });
                  setIdolForm({ price: "", heightFt: "2", style: "" });
                  setImages([]);
                }}
                className="btn-secondary"
              >
                List Another Idol
              </button>
              <button onClick={() => router.push("/")} className="btn-primary">
                Browse Marketplace →
              </button>
            </div>
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-24 md:h-8" />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
