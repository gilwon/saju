"use client";

import { useState } from "react";
import PreviewCard from "@/components/saju/preview/PreviewCard";
import PaywallOverlay from "@/components/saju/preview/PaywallOverlay";
import { openCheckout } from "@/lib/paddle/client";
import type { SajuReading } from "@/types/saju";

interface ReadingPreviewProps {
  reading: SajuReading;
  locale: string;
}

export default function ReadingPreview({
  reading,
  locale,
}: ReadingPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await openCheckout({
        productType: "stars30",
        userId: reading.user_id ?? "",
        successUrl: `${window.location.origin}/${locale}/coin-shop?paid=true`,
      });
    } catch (err) {
      console.error("Paddle checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PreviewCard reading={reading} />
      <PaywallOverlay onPayClick={handlePayClick} />
    </>
  );
}
