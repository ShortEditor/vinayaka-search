"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  auth,
} from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useAuth } from "@/lib/useAuth";

type Mode = "signin" | "signup";

const errorMessages: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/wrong-password": "Incorrect email or password. Please try again.",
  "auth/user-not-found": "No account found with this email. Try creating one.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled in the Firebase console yet.",
  "auth/unauthorized-domain": "This domain isn't authorized for sign-in in the Firebase console.",
  "auth/popup-blocked": "The sign-in popup was blocked by your browser. Please allow popups and retry.",
  "auth/network-request-failed": "Network error. Please check your connection.",
};

function friendlyAuthError(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: string }).code;
    if (errorMessages[code]) return errorMessages[code];
  }
  return "Something went wrong. Please try again.";
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextUrl = () => {
    if (typeof window === "undefined") return "/";
    return new URLSearchParams(window.location.search).get("next") || "/";
  };

  // Already signed in? Skip the form.
  useEffect(() => {
    if (!authLoading && user) router.replace(nextUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      router.push(nextUrl());
    } catch (err) {
      setError(friendlyAuthError(err));
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(nextUrl());
    } catch (err) {
      setError(friendlyAuthError(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-clay-base kolam-bg px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-3 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_back
          </span>
          Back to marketplace
        </Link>

        <div className="bg-card-surface rounded-2xl border border-clay-base ambient-shadow p-7 sm:p-8">
          {/* Wordmark */}
          <div className="text-center mb-6">
            <h1 className="font-display text-4xl font-semibold text-primary tracking-tight">
              Matti Mūrti
            </h1>
            <p className="text-on-surface-variant text-sm mt-2">
              {mode === "signin"
                ? "Welcome back. Sign in to continue."
                : "Create an account to track your unlocks."}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 bg-surface-container rounded-xl p-1 mb-5">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 text-sm font-semibold py-2.5 rounded-lg transition-all ${
                  mode === m
                    ? "bg-card-surface ambient-shadow text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-danger-bg border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
                error
              </span>
              {error}
            </div>
          )}

          {/* Email/password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field w-full pr-11"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {submitting ? (
                <span className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px", borderTopColor: "white" }} />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  {mode === "signin" ? "login" : "person_add"}
                </span>
              )}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-outline-variant/50" />
            <span className="text-xs text-on-surface-variant font-medium">or</span>
            <div className="flex-1 h-px bg-outline-variant/50" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-60 active:scale-[0.99]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-xs text-on-surface-variant/80 text-center mt-5 leading-relaxed">
            Signing in lets you keep a record of the shop contacts you unlock.
            Browsing and listing idols works without an account.
          </p>
        </div>
      </div>
    </div>
  );
}
