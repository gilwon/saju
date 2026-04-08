"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import BirthDateForm, {
  type BirthDateFormData,
} from "@/components/saju/input/BirthDateForm";
import ConcernSelector from "@/components/saju/input/ConcernSelector";
import AnalysisLoading from "@/components/saju/input/AnalysisLoading";
import { createReading } from "@/services/saju/actions";
import type { ConcernType } from "@/types/saju";

/** 시진 value를 시간(hour)으로 변환 */
const SIJI_TO_HOUR: Record<string, number | null> = {
  unknown: null,
  ja: 23,
  chuk: 1,
  in: 3,
  myo: 5,
  jin: 7,
  sa: 9,
  o: 11,
  mi: 13,
  sin: 15,
  yu: 17,
  sul: 19,
  hae: 21,
};

type Step = 1 | 2 | 3;

export default function ReadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<BirthDateFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL search params에서 히어로 폼 데이터 읽기
  useEffect(() => {
    const name = searchParams.get("name");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const day = searchParams.get("day");
    const hour = searchParams.get("hour");
    const gender = searchParams.get("gender");
    const calendar = searchParams.get("calendar");

    if (name && year && month && day && gender) {
      setFormData({
        name,
        year,
        month,
        day,
        time: hour || "unknown",
        gender: gender as "male" | "female",
        calendar: (calendar as "solar" | "lunar") || "solar",
      });
      setStep(2);
    }
  }, [searchParams]);

  const handleBirthDateSubmit = (data: BirthDateFormData) => {
    setFormData(data);
    setStep(2);
  };

  const handleConcernSubmit = async (concerns: string[]) => {
    if (!formData || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setStep(3);

    try {
      const birthHour = SIJI_TO_HOUR[formData.time] ?? null;

      const { data, error: createError } = await createReading({
        name: formData.name,
        gender: formData.gender,
        birthYear: Number(formData.year),
        birthMonth: Number(formData.month),
        birthDay: Number(formData.day),
        birthHour,
        birthMinute: 0,
        isLunar: formData.calendar === "lunar",
        isLeapMonth: false,
        concerns: concerns as ConcernType[],
      });

      if (createError || !data) {
        setError(createError || "분석 생성에 실패했습니다.");
        setStep(2);
        setIsSubmitting(false);
        return;
      }

      // preview API 호출
      const previewRes = await fetch("/api/saju/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readingId: data.id }),
      });

      if (!previewRes.ok) {
        setError("미리보기 생성에 실패했습니다.");
        setStep(2);
        setIsSubmitting(false);
        return;
      }

      // 성공 - reading detail 페이지로 이동
      router.push(`/reading/${data.id}`);
    } catch (err) {
      console.error("Reading creation error:", err);
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      setStep(2);
      setIsSubmitting(false);
    }
  };

  const handleAnalysisComplete = useCallback(() => {
    // AnalysisLoading 애니메이션 완료 시 호출되지만,
    // 실제 리다이렉트는 handleConcernSubmit에서 처리
  }, []);

  const totalSteps = 2;
  const currentProgress = step <= 2 ? step : 2;

  return (
    <div className="min-h-screen bg-white">
      {/* 진행 바 (Step 3에서는 숨김) */}
      {step <= 2 && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="max-w-md mx-auto px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#191F28]">
                {currentProgress}/{totalSteps}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#3182F6] rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentProgress / totalSteps) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="max-w-md mx-auto px-5 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BirthDateForm onSubmit={handleBirthDateSubmit} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ConcernSelector
                onSubmit={handleConcernSubmit}
                onBack={() => setStep(1)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnalysisLoading onComplete={handleAnalysisComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
