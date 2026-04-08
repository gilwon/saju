"use client";

import type { LuckyElements as LuckyElementsType } from "@/types/saju";

interface LuckyElementsProps {
  luckyElements: LuckyElementsType;
}

const COLOR_MAP: Record<string, string> = {
  빨강: "#EF4444",
  빨간색: "#EF4444",
  주황: "#F97316",
  주황색: "#F97316",
  노랑: "#EAB308",
  노란색: "#EAB308",
  초록: "#22C55E",
  초록색: "#22C55E",
  녹색: "#22C55E",
  파랑: "#3B82F6",
  파란색: "#3B82F6",
  남색: "#4338CA",
  보라: "#A855F7",
  보라색: "#A855F7",
  분홍: "#EC4899",
  분홍색: "#EC4899",
  흰색: "#F9FAFB",
  검정: "#1F2937",
  검은색: "#1F2937",
  회색: "#9CA3AF",
  금색: "#D4A017",
  은색: "#C0C0C0",
};

function getColorHex(colorName: string): string {
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (colorName.includes(key)) return hex;
  }
  return "#3182F6";
}

export default function LuckyElements({ luckyElements }: LuckyElementsProps) {
  const items = [
    {
      label: "행운의 색상",
      value: luckyElements.color,
      chip: (
        <div
          className="w-8 h-8 rounded-full border border-gray-200"
          style={{ backgroundColor: getColorHex(luckyElements.color) }}
        />
      ),
    },
    {
      label: "행운의 방향",
      value: luckyElements.direction,
      chip: null,
    },
    {
      label: "행운의 숫자",
      value: luckyElements.number,
      chip: null,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4"
        >
          {item.chip ? (
            item.chip
          ) : (
            <span className="text-2xl font-bold text-[#3182F6]">
              {item.value}
            </span>
          )}
          <span className="text-xs text-[#8B95A1]">{item.label}</span>
          {item.chip && (
            <span className="text-sm font-medium text-[#191F28]">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
