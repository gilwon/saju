"use client";

import { useCallback } from "react";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

interface KakaoShareButtonProps {
  readingId: string;
  name: string;
}

export default function KakaoShareButton({
  readingId,
  name,
}: KakaoShareButtonProps) {
  const handleShare = useCallback(() => {
    if (!window.Kakao) {
      alert("카카오톡 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!window.Kakao.isInitialized()) {
      alert("카카오톡 SDK 초기화에 실패했습니다.");
      return;
    }

    const shareUrl = `${window.location.origin}/reading/${readingId}/share`;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "사주랩에서 나의 2026년 운세를 확인했어요!",
        description: `${name}님의 사주분석 결과를 확인해보세요.`,
        imageUrl: `${window.location.origin}/reading/${readingId}/share/opengraph-image`,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: "나도 확인하기",
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  }, [readingId, name]);

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full bg-[#FEE500] hover:bg-[#F5DC00] text-[#191F28] rounded-xl py-3.5 font-semibold transition-colors"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.56-.96 3.6-.99 3.83 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.44 4.28-2.86.56.08 1.14.12 1.72.12 5.52 0 10-3.58 10-7.94C22 6.58 17.52 3 12 3z" />
      </svg>
      카카오톡으로 공유
    </button>
  );
}
