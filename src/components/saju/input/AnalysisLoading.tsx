"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { label: "사주팔자를 계산하고 있어요...", duration: 2000 },
  { label: "오행 분포를 분석하고 있어요...", duration: 2000 },
  { label: "운세를 해석하고 있어요...", duration: 3000 },
];

interface AnalysisLoadingProps {
  onComplete: () => void;
}

export default function AnalysisLoading({ onComplete }: AnalysisLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep((prev) => prev + 1);
    }, STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
      <div className="w-full max-w-sm space-y-6">
        {/* 프로그레스 원형 */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-[#3182F6]"
          />
        </div>

        {/* 단계 목록 */}
        <div className="space-y-4">
          <AnimatePresence>
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isActive = currentStep === index;

              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.3 }}
                  className="flex items-center gap-3"
                >
                  {/* 체크마크 / 스피너 / 대기 */}
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {isCompleted ? (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 text-[#3182F6]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-[#3182F6]"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                    )}
                  </div>

                  <span
                    className={`text-base ${
                      isCompleted
                        ? "text-[#3182F6] font-medium"
                        : isActive
                          ? "text-[#191F28] font-medium"
                          : "text-[#8B95A1]"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
