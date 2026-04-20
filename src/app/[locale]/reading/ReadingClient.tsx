"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import BirthDateForm, {
  type BirthDateFormData,
  type BirthDateInitialData,
} from "@/components/saju/input/BirthDateForm";
import ConcernSelector from "@/components/saju/input/ConcernSelector";
import AnalysisLoading from "@/components/saju/input/AnalysisLoading";
import ProfileSelector from "@/components/saju/profile/ProfileSelector";
import { createReading } from "@/services/saju/actions";
import { createProfile, getProfiles } from "@/services/saju/profile-actions";
import { SIJI_TO_HOUR, HOUR_TO_SIJI } from "@/lib/saju/siji";
import type { ConcernType, SajuProfile } from "@/types/saju";

type Step = 1 | 2 | 3;

export default function ReadingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<BirthDateFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<SajuProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formInitialData, setFormInitialData] = useState<BirthDateInitialData | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const saveMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getProfiles().then(({ data }) => setProfiles(data));
  }, []);

  useEffect(() => {
    return () => {
      if (saveMsgTimer.current) clearTimeout(saveMsgTimer.current);
    };
  }, []);

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

  const showSaveMsg = (text: string, ok: boolean) => {
    if (saveMsgTimer.current) clearTimeout(saveMsgTimer.current);
    setSaveMsg({ text, ok });
    saveMsgTimer.current = setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleProfileSelect = (profile: SajuProfile) => {
    setSelectedId(profile.id);
    setFormInitialData({
      name: profile.name,
      year: String(profile.birth_year),
      month: String(profile.birth_month),
      day: String(profile.birth_day),
      time: profile.birth_hour !== null ? (HOUR_TO_SIJI[profile.birth_hour] ?? "unknown") : "unknown",
      gender: profile.gender,
      calendar: profile.is_lunar ? "lunar" : "solar",
    });
  };

  const handleSaveProfile = async (data: BirthDateFormData) => {
    setIsSavingProfile(true);
    const { data: saved, error: saveError } = await createProfile({
      name: data.name,
      gender: data.gender,
      birthYear: Number(data.year),
      birthMonth: Number(data.month),
      birthDay: Number(data.day),
      birthHour: SIJI_TO_HOUR[data.time] ?? null,
      isLunar: data.calendar === "lunar",
      isLeapMonth: false,
    });
    setIsSavingProfile(false);
    if (saveError || !saved) {
      showSaveMsg(saveError ?? "저장에 실패했습니다.", false);
    } else {
      setProfiles((prev) => [saved, ...prev]);
      showSaveMsg("프로필이 저장되었습니다!", true);
    }
  };

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
      const { data, error: createError } = await createReading({
        name: formData.name,
        gender: formData.gender,
        birthYear: Number(formData.year),
        birthMonth: Number(formData.month),
        birthDay: Number(formData.day),
        birthHour: SIJI_TO_HOUR[formData.time] ?? null,
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

      router.push(`/reading/${data.id}`);
    } catch (err) {
      console.error("Reading creation error:", err);
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      setStep(2);
      setIsSubmitting(false);
    }
  };

  const handleAnalysisComplete = useCallback(() => {}, []);

  const totalSteps = 2;
  const currentProgress = step <= 2 ? step : 2;

  return (
    <div className="min-h-screen bg-white">
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
                animate={{ width: `${(currentProgress / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-5 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {saveMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-sm text-center ${
              saveMsg.ok ? "bg-[#E8F7EF] text-[#10B981]" : "bg-red-50 text-red-600"
            }`}
          >
            {saveMsg.text}
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
              <ProfileSelector
                profiles={profiles}
                onSelect={handleProfileSelect}
                selectedId={selectedId}
              />
              <BirthDateForm
                onSubmit={handleBirthDateSubmit}
                initialData={formInitialData}
                onSaveProfile={handleSaveProfile}
                isSavingProfile={isSavingProfile}
              />
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
