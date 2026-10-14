import { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrderClient } from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order | Adorn by Mashfika Luxury Boutique",
  description:
    "Track your handcrafted jewelry and boutique orders in real-time. Fast, secure delivery across Dhaka and all 64 districts in Bangladesh.",
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF7F5]">
          <div className="w-8 h-8 border-4 border-[#4A1525] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
