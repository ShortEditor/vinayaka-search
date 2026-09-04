"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";

/**
 * Renders children only after client-side mount to avoid hydration
 * mismatches from browser extensions, and applies the AuthGate to ensure
 * unauthenticated visitors see only the login screen.
 */
export default function ClientBody({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="contents" suppressHydrationWarning>
      {mounted ? <AuthGate>{children}</AuthGate> : null}
    </div>
  );
}
