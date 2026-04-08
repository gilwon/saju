"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

interface PaymentSuccessProps {
  readingId: string;
}

type AnalysisState = "idle" | "analyzing" | "completed" | "failed";

export default function PaymentSuccess({ readingId }: PaymentSuccessProps) {
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>("idle");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // 로그인 상태 확인
  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  // AI 분석 트리거
  const startAnalysis = useCallback(async () => {
    if (state === "analyzing" || state === "completed") return;

    setState("analyzing");
    try {
      const res = await fetch("/api/saju/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readingId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "분석 실패");
      }

      setState("completed");

      // 잠시 후 결과 페이지로 이동
      setTimeout(() => {
        router.push(`/reading/${readingId}/result`);
      }, 1500);
    } catch (error) {
      console.error("Analysis error:", error);
      setState("failed");
    }
  }, [readingId, router, state]);

  useEffect(() => {
    startAnalysis();
  }, [startAnalysis]);

  const handleGoogleLogin = () => {
    // 로그인 후 현재 페이지로 돌아오도록 redirectTo 설정
    window.location.href = `/api/auth/google?redirectTo=${encodeURIComponent(window.location.pathname)}`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">
        {/* 결제 완료 */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-[#E8F3FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3182F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#191F28] mb-2">
            결제가 완료되었습니다
          </h1>
        </div>

        {/* 분석 상태 */}
        {state === "analyzing" && (
          <div className="bg-[#F9FAFB] rounded-2xl p-6 mb-6">
            <div className="h-8 w-8 border-3 border-[#3182F6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#191F28] font-semibold mb-1">
              AI가 사주를 분석하고 있어요...
            </p>
            <p className="text-sm text-[#8B95A1]">
              잠시만 기다려주세요. 보통 30초 이내에 완료됩니다.
            </p>
          </div>
        )}

        {state === "completed" && (
          <div className="bg-[#E8F7EF] rounded-2xl p-6 mb-6">
            <p className="text-[#191F28] font-semibold mb-1">
              분석이 완료되었습니다
            </p>
            <p className="text-sm text-[#8B95A1]">
              결과 페이지로 이동합니다...
            </p>
          </div>
        )}

        {state === "failed" && (
          <div className="bg-[#FFF0F0] rounded-2xl p-6 mb-6">
            <p className="text-[#191F28] font-semibold mb-1">
              분석 중 문제가 발생했습니다
            </p>
            <p className="text-sm text-[#8B95A1] mb-4">
              다시 시도해주세요. 문제가 계속되면 고객센터로 연락해주세요.
            </p>
            <Button
              onClick={() => {
                setState("idle");
                startAnalysis();
              }}
              className="bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-xl px-6 h-11 text-sm font-semibold"
            >
              다시 시도
            </Button>
          </div>
        )}

        {/* 로그인 유도 (비로그인 상태일 때만) */}
        {isLoggedIn === false && (
          <div className="bg-[#F9FAFB] rounded-2xl p-5 mt-4">
            <p className="text-sm text-[#191F28] font-medium mb-1">
              로그인하면 언제든 다시 확인할 수 있어요
            </p>
            <p className="text-xs text-[#8B95A1] mb-3">
              구글 계정으로 간편 로그인
            </p>
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-11 rounded-xl text-sm font-semibold border-gray-200 text-[#191F28]"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google로 로그인
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
