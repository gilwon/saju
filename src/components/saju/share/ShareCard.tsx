"use client";

import { useCallback, useState } from "react";
import KakaoShareButton from "./KakaoShareButton";

interface ShareCardProps {
  readingId: string;
  name: string;
}

export default function ShareCard({ readingId, name }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = useCallback(async () => {
    const url = `${window.location.origin}/reading/${readingId}/share`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [readingId]);

  return (
    <section className="mt-8 mx-auto max-w-md px-5">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#191F28] text-center mb-5">
          친구에게 공유하기
        </h3>

        <div className="space-y-3">
          <KakaoShareButton readingId={readingId} name={name} />

          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center gap-2 w-full bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] rounded-xl py-3.5 font-semibold transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {copied ? "복사 완료!" : "URL 복사하기"}
          </button>
        </div>
      </div>
    </section>
  );
}
