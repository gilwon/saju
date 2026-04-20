"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SIJI_LIST } from "@/lib/saju/siji";

function getDaysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

export interface BirthDateFormData {
  name: string;
  year: string;
  month: string;
  day: string;
  time: string;
  gender: "male" | "female";
  calendar: "solar" | "lunar";
}

export interface BirthDateInitialData {
  name?: string;
  year?: string;
  month?: string;
  day?: string;
  time?: string;
  gender?: "male" | "female";
  calendar?: "solar" | "lunar";
}

interface BirthDateFormProps {
  onSubmit: (data: BirthDateFormData) => void;
  initialData?: BirthDateInitialData | null;
  onSaveProfile?: (data: BirthDateFormData) => Promise<void>;
  isSavingProfile?: boolean;
}

export default function BirthDateForm({
  onSubmit,
  initialData,
  onSaveProfile,
  isSavingProfile,
}: BirthDateFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [year, setYear] = useState(initialData?.year ?? "");
  const [month, setMonth] = useState(initialData?.month ?? "");
  const [day, setDay] = useState(initialData?.day ?? "");
  const [time, setTime] = useState(initialData?.time ?? "");
  const [gender, setGender] = useState<"male" | "female" | "">(
    initialData?.gender ?? ""
  );
  const [calendar, setCalendar] = useState<"solar" | "lunar">(
    initialData?.calendar ?? "solar"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialData) return;
    setName(initialData.name ?? "");
    setYear(initialData.year ?? "");
    setMonth(initialData.month ?? "");
    setDay(initialData.day ?? "");
    setTime(initialData.time ?? "");
    setGender(initialData.gender ?? "");
    setCalendar(initialData.calendar ?? "solar");
    setErrors({});
  }, [initialData]);

  const maxDay = useMemo(() => getDaysInMonth(Number(year), Number(month)), [year, month]);

  useMemo(() => {
    if (day && Number(day) > maxDay) setDay("");
  }, [maxDay, day]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!year) newErrors.year = "년도를 선택해주세요";
    if (!month) newErrors.month = "월을 선택해주세요";
    if (!day) newErrors.day = "일을 선택해주세요";
    if (!gender) newErrors.gender = "성별을 선택해주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const currentFormData = (): BirthDateFormData => ({
    name: name.trim(),
    year,
    month,
    day,
    time: time || "unknown",
    gender: gender as "male" | "female",
    calendar,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(currentFormData());
  };

  const handleSaveProfile = async () => {
    if (!validate() || !onSaveProfile) return;
    await onSaveProfile(currentFormData());
  };

  const canSave = name.trim() && year && month && day && gender;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#191F28]">
          생년월일을 알려주세요
        </h2>
        <p className="mt-2 text-[#8B95A1] text-sm">
          정확한 사주 분석을 위해 정보를 입력해주세요
        </p>
      </div>

      {/* 이름 */}
      <div>
        <Label
          htmlFor="name"
          className="text-sm font-medium text-[#191F28] mb-1.5 block"
        >
          이름
        </Label>
        <Input
          id="name"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl border-gray-200 text-base"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* 생년월일 */}
      <div>
        <Label className="text-sm font-medium text-[#191F28] mb-1.5 block">
          생년월일
        </Label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="1990"
            min={1940}
            max={2010}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="flex-[2] border border-gray-200 rounded-xl px-3 py-3 text-center text-lg focus:border-[#3182F6] focus:ring-1 focus:ring-[#3182F6] outline-none"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="1"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-center text-lg focus:border-[#3182F6] focus:ring-1 focus:ring-[#3182F6] outline-none"
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="1"
            value={day}
            onChange={(e) => setDay(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-center text-lg focus:border-[#3182F6] focus:ring-1 focus:ring-[#3182F6] outline-none"
          />
        </div>
        {(errors.year || errors.month || errors.day) && (
          <p className="text-red-500 text-xs mt-1">생년월일을 입력해주세요</p>
        )}
      </div>

      {/* 태어난 시간 */}
      <div>
        <Label className="text-sm font-medium text-[#191F28] mb-1.5 block">
          태어난 시간
        </Label>
        <Select value={time} onValueChange={setTime}>
          <SelectTrigger className="h-12 rounded-xl border-gray-200 text-base">
            <SelectValue placeholder="시간을 선택하세요 (선택)" />
          </SelectTrigger>
          <SelectContent>
            {SIJI_LIST.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 성별 */}
      <div>
        <Label className="text-sm font-medium text-[#191F28] mb-1.5 block">
          성별
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setGender("male")}
            className={`h-12 rounded-xl border text-base font-medium transition-all ${
              gender === "male"
                ? "border-[#3182F6] bg-[#3182F6]/5 text-[#3182F6]"
                : "border-gray-200 text-[#191F28] hover:border-gray-300"
            }`}
          >
            남
          </button>
          <button
            type="button"
            onClick={() => setGender("female")}
            className={`h-12 rounded-xl border text-base font-medium transition-all ${
              gender === "female"
                ? "border-[#3182F6] bg-[#3182F6]/5 text-[#3182F6]"
                : "border-gray-200 text-[#191F28] hover:border-gray-300"
            }`}
          >
            여
          </button>
        </div>
        {errors.gender && (
          <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
        )}
      </div>

      {/* 음력/양력 */}
      <div>
        <Label className="text-sm font-medium text-[#191F28] mb-1.5 block">
          달력 구분
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCalendar("solar")}
            className={`h-12 rounded-xl border text-base font-medium transition-all ${
              calendar === "solar"
                ? "border-[#3182F6] bg-[#3182F6]/5 text-[#3182F6]"
                : "border-gray-200 text-[#191F28] hover:border-gray-300"
            }`}
          >
            양력
          </button>
          <button
            type="button"
            onClick={() => setCalendar("lunar")}
            className={`h-12 rounded-xl border text-base font-medium transition-all ${
              calendar === "lunar"
                ? "border-[#3182F6] bg-[#3182F6]/5 text-[#3182F6]"
                : "border-gray-200 text-[#191F28] hover:border-gray-300"
            }`}
          >
            음력
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-xl py-4 text-lg font-semibold transition-colors mt-2"
      >
        다음
      </button>

      {onSaveProfile && (
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={!canSave || isSavingProfile}
          className="w-full border border-gray-200 text-[#8B95A1] hover:border-[#3182F6] hover:text-[#3182F6] rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSavingProfile ? "저장 중..." : "이 정보 프로필로 저장"}
        </button>
      )}
    </form>
  );
}
