"use client";

import { PricingTable, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Suspense, lazy } from "react";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      {/* Dithering shader */}
      <div className="absolute inset-0 pointer-events-none">
        <Suspense fallback={null}>
          <div className="absolute inset-0 opacity-15 mix-blend-screen">
            <Dithering
              colorBack="#00000000"
              colorFront="#aaaaaa"
              shape="warp"
              type="4x4"
              speed={0.3}
              className="size-full"
              minPixelRatio={1}
            />
          </div>
        </Suspense>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <h1 className="text-3xl font-serif font-bold text-white">Pomo</h1>
        <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif font-bold text-white mb-3">
            Unlock Full Access
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            Get unlimited access to the Pomo timer, task board, ambient sounds,
            and study history tracking.
          </p>
        </div>

        <div className="w-full max-w-lg">
          <PricingTable
            newSubscriptionRedirectUrl="/checkout-success"
            appearance={{
              baseTheme: dark,
              variables: {
                colorBackground: "#000000",
                colorText: "#ffffff",
                colorTextSecondary: "rgba(255,255,255,0.7)",
                colorNeutral: "#ffffff",
              },
              elements: {
                switchThumb: { backgroundColor: "#ffffff" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
