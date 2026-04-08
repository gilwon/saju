"use client";

import { create } from "zustand";
import type { SajuInputForm, Gender, ConcernType } from "@/types/saju";

type AnalysisStatus =
  | "idle"
  | "calculating"
  | "previewing"
  | "analyzing"
  | "completed"
  | "error";

interface SajuStore {
  // 입력 폼
  inputForm: SajuInputForm;
  setInputForm: (form: Partial<SajuInputForm>) => void;
  resetInputForm: () => void;

  // 현재 분석
  currentReadingId: string | null;
  setCurrentReadingId: (id: string | null) => void;

  // 분석 상태
  analysisStatus: AnalysisStatus;
  setAnalysisStatus: (status: AnalysisStatus) => void;

  // 에러
  error: string | null;
  setError: (error: string | null) => void;
}

const DEFAULT_INPUT_FORM: SajuInputForm = {
  name: "",
  gender: "male",
  birthYear: 1990,
  birthMonth: 1,
  birthDay: 1,
  birthHour: null,
  birthMinute: 0,
  isLunar: false,
  isLeapMonth: false,
  concerns: [],
};

export const useSajuStore = create<SajuStore>((set) => ({
  // 입력 폼
  inputForm: { ...DEFAULT_INPUT_FORM },
  setInputForm: (form) =>
    set((s) => ({
      inputForm: { ...s.inputForm, ...form },
    })),
  resetInputForm: () =>
    set({ inputForm: { ...DEFAULT_INPUT_FORM } }),

  // 현재 분석
  currentReadingId: null,
  setCurrentReadingId: (id) => set({ currentReadingId: id }),

  // 분석 상태
  analysisStatus: "idle",
  setAnalysisStatus: (status) => set({ analysisStatus: status }),

  // 에러
  error: null,
  setError: (error) => set({ error }),
}));
