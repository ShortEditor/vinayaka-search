"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import LoginPage from "@/app/login/page";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, authLoading } = useAuth();

  // Admin and login routes manage their own authentication
  if (pathname.startsWith("/admin") || pathname === "/login") {
    return <>{children}</>;
  }

  // Show a branded loading screen while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-clay-base kolam-bg px-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-primary tracking-tight mb-2">
            Matti Mūrti
          </h1>
          <p className="text-on-surface-variant text-xs sm:text-sm mb-6">
            Handcrafted Clay Idols Marketplace
          </p>
          <div
            className="spinner"
            style={{ width: "32px", height: "32px", borderWidth: "3px" }}
          />
        </div>
      </div>
    );
  }

  // If user is not logged in, show the login screen exclusively
  if (!user) {
    return <LoginPage isGate={true} />;
  }

  // User is logged in, show requested marketplace screen
  return <>{children}</>;
}
