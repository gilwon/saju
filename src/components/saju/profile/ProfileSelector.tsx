"use client";

import type { SajuProfile } from "@/types/saju";
import { Link } from "@/i18n/routing";
import { formatBirthYMD } from "@/lib/utils";

interface ProfileSelectorProps {
  profiles: SajuProfile[];
  onSelect: (profile: SajuProfile) => void;
  selectedId?: string | null;
}

export default function ProfileSelector({ profiles, onSelect, selectedId }: ProfileSelectorProps) {
  if (profiles.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#8B95A1] uppercase tracking-wide">
          저장된 프로필
        </span>
        <Link href="/my-profiles" className="text-xs text-[#3182F6] hover:underline">
          관리
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {profiles.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className={`flex-shrink-0 flex flex-col items-start px-3 py-2 rounded-xl border text-left transition-all ${
                active
                  ? "border-[#3182F6] bg-[#3182F6]/5"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className={`text-sm font-semibold ${active ? "text-[#3182F6]" : "text-[#191F28]"}`}>
                {p.name}
              </span>
              <span className="text-xs text-[#8B95A1] mt-0.5">
                {formatBirthYMD(p.birth_year, p.birth_month, p.birth_day)}
                {p.is_lunar ? " (음)" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
