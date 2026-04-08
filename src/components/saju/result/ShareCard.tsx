"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareCardProps {
  readingId: string;
  name: string;
}

export default function ShareCard({ readingId, name }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/reading/${readingId}/result`
      : "";

  const shareText = `${name}님의 사주분석 결과를 확인해보세요! - 사주랩`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleKakaoShare = () => {
    if (typeof window !== "undefined" && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "사주랩 - AI 사주분석",
          description: shareText,
          imageUrl: `${window.location.origin}/og-image.png`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "결과 보기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } else {
      handleCopyLink();
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "사주랩 - AI 사주분석",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // 사용자가 공유 취소
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-[#191F28] mb-3">
        친구에게 공유하기
      </h3>
      <p className="text-sm text-[#8B95A1] mb-4">
        사주분석 결과를 친구에게 공유해보세요.
      </p>
      <div className="flex gap-2">
        <Button
          onClick={handleNativeShare}
          variant="outline"
          className="flex-1 h-10 rounded-xl text-sm font-medium border-gray-200"
        >
          <svg
            className="w-4 h-4 mr-1.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          공유
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="flex-1 h-10 rounded-xl text-sm font-medium border-gray-200"
        >
          {copied ? "복사됨" : "링크 복사"}
        </Button>
        <Button
          onClick={handleKakaoShare}
          className="flex-1 h-10 rounded-xl text-sm font-medium bg-[#FEE500] hover:bg-[#FADA0A] text-[#3C1E1E]"
        >
          카카오톡
        </Button>
      </div>
    </div>
  );
}
