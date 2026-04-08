"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface PaywallOverlayProps {
  onPayClick: () => void;
}

export default function PaywallOverlay({ onPayClick }: PaywallOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-white/0 pt-16 pb-8 px-5 -mt-24"
    >
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-[#F2F4F6] flex items-center justify-center mb-4">
          <Lock className="w-5 h-5 text-[#8B95A1]" />
        </div>
        <h3 className="text-lg font-bold text-[#191F28] mb-1">
          전체 분석 결과 보기
        </h3>
        <p className="text-[#8B95A1] text-sm mb-5">
          철학관 평균 30,000~50,000원
        </p>
        <button
          onClick={onPayClick}
          className="w-full bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] text-white font-semibold text-base py-4 rounded-xl transition-all"
        >
          19,900원에 전체 분석 보기
        </button>
        <p className="text-xs text-[#8B95A1] mt-3">
          결제 즉시 전체 분석 PDF를 받아보세요
        </p>
      </div>
    </motion.div>
  );
}
