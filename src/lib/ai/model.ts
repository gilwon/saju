/**
 * AI 모델 설정
 *
 * 환경변수 AI_PROVIDER 로 프로바이더를 전환합니다.
 *   AI_PROVIDER=google  → Google Gemini (기본값)
 *   AI_PROVIDER=groq    → Groq (llama-3.3-70b-versatile)
 *
 * 각 프로바이더별 API 키:
 *   GOOGLE_GENERATIVE_AI_API_KEY
 *   GROQ_API_KEY
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createGateway } from "ai";
import type { EmbeddingModel, LanguageModel } from "ai";

const provider = (process.env.AI_PROVIDER ?? "google") as "google" | "groq";

/** Google AI SDK */
const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
});

/** Groq AI SDK */
const groqAI = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

/** Vercel AI Gateway (임베딩 전용) */
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

/** 기본 모델 ID */
const GOOGLE_DEFAULT = "gemini-2.5-flash-lite" as const;
const GROQ_DEFAULT   = "llama-3.1-8b-instant" as const; // 무료 티어 TPM 20,000 (70b는 12,000으로 부족)

/**
 * 현재 AI_PROVIDER 에 맞는 모델을 반환합니다.
 * route.ts / analyzer.ts 등에서 `google(...)` 대신 이 함수를 사용하세요.
 */
export function getModel(overrideId?: string): LanguageModel {
  if (provider === "groq") {
    return groqAI(overrideId ?? GROQ_DEFAULT) as unknown as LanguageModel;
  }
  return googleAI(overrideId ?? GOOGLE_DEFAULT) as unknown as LanguageModel;
}

/** A/B 테스트용 모델 옵션 */
export const SDS_MODEL_OPTIONS = [
  // Google
  { id: "gemini-2.5-flash-lite",         label: "Gemini 2.5 Flash Lite",   provider: "google" },
  { id: "gemini-3.1-flash-lite-preview",  label: "Gemini 3.1 Flash Lite",   provider: "google" },
  // Groq
  { id: "llama-3.3-70b-versatile",        label: "Llama 3.3 70B",           provider: "groq"   },
  { id: "llama-3.1-8b-instant",           label: "Llama 3.1 8B (빠름)",     provider: "groq"   },
  { id: "gemma2-9b-it",                   label: "Gemma2 9B",               provider: "groq"   },
] as const;

export type SdsModelId = (typeof SDS_MODEL_OPTIONS)[number]["id"];

/** 챗봇용 모델 */
export function getChatModel(): LanguageModel {
  return getModel();
}

/** 분류/분석용 모델 */
export function getClassificationModel(): LanguageModel {
  return getModel();
}

export function getAnalysisModel(): LanguageModel {
  return getModel();
}

/** SDS 텍스트 생성용 모델 (A/B 테스트 지원) */
export function getSdsTextModel(modelId?: SdsModelId): LanguageModel {
  return getModel(modelId);
}

/** 임베딩용 모델 (Google 전용) */
export function getEmbeddingModel(): EmbeddingModel {
  if (process.env.AI_GATEWAY_API_KEY) {
    return gateway.textEmbeddingModel("google/gemini-embedding-001") as unknown as EmbeddingModel;
  }
  return googleAI.textEmbeddingModel("gemini-embedding-001") as unknown as EmbeddingModel;
}
