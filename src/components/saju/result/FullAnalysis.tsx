"use client";

import type { SajuAnalysis, SajuReading } from "@/types/saju";
import MonthlyFortuneGrid from "./MonthlyFortuneGrid";
import LuckyElements from "./LuckyElements";

interface FullAnalysisProps {
  analysis: SajuAnalysis;
  reading: SajuReading;
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-[#191F28] mb-3">{title}</h3>
      {children}
    </div>
  );
}

const SECTIONS = [
  { key: "personality" as const, title: "성격/기질" },
  { key: "love" as const, title: "연애/결혼운" },
  { key: "wealth" as const, title: "재물/금전운" },
  { key: "career" as const, title: "직업/사업운" },
  { key: "health" as const, title: "건강운" },
  { key: "yearlyFortune" as const, title: "2026년 총운" },
];

export default function FullAnalysis({ analysis, reading }: FullAnalysisProps) {
  return (
    <div className="flex flex-col gap-4">
      {SECTIONS.map(({ key, title }) => (
        <SectionCard key={key} title={title}>
          <p className="text-sm text-[#191F28] leading-relaxed whitespace-pre-line">
            {analysis[key]}
          </p>
        </SectionCard>
      ))}

      <SectionCard title="월별 운세">
        <MonthlyFortuneGrid monthlyFortune={analysis.monthlyFortune} />
      </SectionCard>

      <SectionCard title="행운 요소">
        <LuckyElements luckyElements={analysis.luckyElements} />
      </SectionCard>

      <SectionCard title="종합 코멘트">
        <p className="text-sm text-[#191F28] leading-relaxed whitespace-pre-line">
          {analysis.summary}
        </p>
      </SectionCard>
    </div>
  );
}
