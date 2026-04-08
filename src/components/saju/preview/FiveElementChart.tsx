"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import type { FiveElementDistribution } from "@/types/saju";

const ELEMENT_CONFIG = [
  { key: "wood" as const, label: "목(木)", color: "#22C55E" },
  { key: "fire" as const, label: "화(火)", color: "#EF4444" },
  { key: "earth" as const, label: "토(土)", color: "#EAB308" },
  { key: "metal" as const, label: "금(金)", color: "#94A3B8" },
  { key: "water" as const, label: "수(水)", color: "#3B82F6" },
];

interface FiveElementChartProps {
  elements: FiveElementDistribution;
}

export default function FiveElementChart({ elements }: FiveElementChartProps) {
  const data = ELEMENT_CONFIG.map(({ key, label }) => ({
    element: label,
    value: elements[key],
  }));

  return (
    <div className="w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="element"
            tick={{ fill: "#4B5563", fontSize: 13, fontWeight: 600 }}
          />
          <Radar
            dataKey="value"
            stroke="#3182F6"
            fill="#3182F6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex gap-3 flex-wrap justify-center mt-2">
        {ELEMENT_CONFIG.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[#4B5563] font-medium">
              {label} {elements[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
