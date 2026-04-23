"use client";

import { useState, useEffect } from "react";
import type { MonthlyFortune } from "@/types/saju";

interface MonthlyFortuneGridProps {
  monthlyFortune: MonthlyFortune[];
}

export default function MonthlyFortuneGrid({
  monthlyFortune,
}: MonthlyFortuneGridProps) {
  const [currentMonth, setCurrentMonth] = useState(0);

  useEffect(() => {
    setCurrentMonth(new Date().getMonth() + 1);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {monthlyFortune.map((item) => (
        <div
          key={item.month}
          className={`rounded-xl p-4 border ${
            item.month === currentMonth
              ? "border-[#3182F6] bg-[#F2F7FF]"
              : "border-gray-100 bg-gray-50"
          }`}
        >
          <span
            className={`text-sm font-semibold ${
              item.month === currentMonth
                ? "text-[#3182F6]"
                : "text-[#8B95A1]"
            }`}
          >
            {item.month}월
          </span>
          <p className="mt-1 text-sm text-[#191F28] leading-relaxed">
            {item.fortune}
          </p>
        </div>
      ))}
    </div>
  );
}
