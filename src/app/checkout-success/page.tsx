"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutSuccessPage() {
  const { session } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    // Force the session token to reload so the new plan is reflected
    session.reload().then(() => {
      router.replace("/dashboard");
    });
  }, [session, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Activating your subscription…</p>
      </div>
    </div>
  );
}
