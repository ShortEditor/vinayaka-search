"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ContactRevealPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    // Contact details are now displayed directly on the idol page for free
    router.replace(`/idol/${id}`);
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-clay-base">
      <div className="spinner" />
    </div>
  );
}
