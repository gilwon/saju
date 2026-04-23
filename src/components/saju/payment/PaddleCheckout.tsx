"use client";

import { useState } from "react";
import { openCheckout } from "@/lib/paddle/client";
import type { ProductType } from "@/lib/paddle/config";
import { Button } from "@/components/ui/button";
import { PADDLE_CONFIG } from "@/lib/paddle/config";

interface PaddleCheckoutProps {
  userId: string;
  productType: ProductType;
  userEmail?: string;
  onSuccess?: () => void;
}

export default function PaddleCheckout({
  userId,
  productType,
  userEmail,
  onSuccess,
}: PaddleCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const product = PADDLE_CONFIG.products[productType];

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await openCheckout({
        productType,
        userId,
        userEmail,
        successUrl: `${window.location.origin}/ko/coin-shop?paid=true`,
      });

      // Paddle overlay 닫힌 후 onSuccess 콜백 (successUrl 리다이렉트와 별도)
      onSuccess?.();
    } catch (error) {
      console.error("Paddle checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full h-14 bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-2xl text-lg font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            결제 준비 중...
          </span>
        ) : (
          `${product.name} ${product.amount.toLocaleString('ko-KR')}원 결제하기`
        )}
      </Button>
      <p className="text-center text-xs text-[#8B95A1] mt-3">
        안전한 Paddle 결제 시스템으로 처리됩니다
      </p>
    </div>
  );
}
