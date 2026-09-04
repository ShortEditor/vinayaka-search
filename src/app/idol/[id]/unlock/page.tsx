"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UnlockPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    // Unlocking is now free; redirect directly to the idol details page
    router.replace(`/idol/${id}`);
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-clay-base">
      <div className="spinner" />
    </div>
  );
}
