"use client";

import { useRouter } from "next/navigation";

interface CompatibilityUpsellProps {
  readingId: string;
}

export default function CompatibilityUpsell({
  readingId,
}: CompatibilityUpsellProps) {
  const router = useRouter();

  return (
    <section className="mt-10 mx-auto max-w-md px-5">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-[#191F28] text-center">
          궁합도 확인해보세요!
        </h3>

        <p className="text-sm text-[#8B95A1] text-center mt-3 leading-relaxed">
          상대방과의 사주 궁합을 AI가 분석해드려요
        </p>

        <div className="text-center mt-6 mb-6">
          <span className="text-3xl font-bold text-[#191F28]">9,900</span>
          <span className="text-base text-[#8B95A1] ml-1">원</span>
        </div>

        <button
          onClick={() => router.push(`/reading/${readingId}/compatibility`)}
          className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-xl py-4 text-lg font-semibold transition-colors"
        >
          궁합 분석 시작하기
        </button>
      </div>
    </section>
  );
}
