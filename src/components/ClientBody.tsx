"use client";

import { useEffect, useState } from "react";

/**
 * Renders children only after client-side mount to avoid hydration
 * mismatches from browser extensions (e.g. Bitdefender injects bis_skin_checked).
 */
export default function ClientBody({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="contents" suppressHydrationWarning>
      {mounted ? children : null}
    </div>
  );
}
