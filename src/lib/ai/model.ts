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
import { createGateway, generateText, streamText } from "ai";
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

// ---------------------------------------------------------------------------
// 자동 폴백 유틸리티
// Google Gemini 쿼터 초과 시 Groq 으로 자동 전환, 둘 다 초과 시 503 반환
// ---------------------------------------------------------------------------

/** 쿼터/레이트리밋 에러 여부 판별 */
export function isQuotaError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (e.statusCode === 429 || e.status === 429) return true;
    if (e.cause) return isQuotaError(e.cause);
  }
  const msg = String(err).toLowerCase();
  return (
    msg.includes("resource_exhausted") ||
    msg.includes("quota") ||
    msg.includes("rate_limit_exceeded") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit exceeded")
  );
}

const FALLBACK_MODELS = (): LanguageModel[] => [
  googleAI(GOOGLE_DEFAULT) as unknown as LanguageModel,
  groqAI(GROQ_DEFAULT) as unknown as LanguageModel,
];

const MODEL_NAMES = ["Google Gemini", "Groq"];

/** streamText + 자동 폴백. 모든 모델 소진 시 503 Response 반환 */
export async function createFallbackResponse(
  options: Omit<Parameters<typeof streamText>[0], "model"> & {
    onFinishText?: (text: string) => Promise<void>;
  }
): Promise<Response> {
  const { onFinishText, ...streamParams } = options;
  const encoder = new TextEncoder();
  const models = FALLBACK_MODELS();

  for (let i = 0; i < models.length; i++) {
    let reader: ReadableStreamDefaultReader<string> | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = streamText({ ...streamParams, model: models[i] } as any);
      reader = result.textStream.getReader();

      // 첫 청크를 읽어 쿼터 에러를 조기 감지
      const firstRead = await reader.read();

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          let fullText = "";
          try {
            if (!firstRead.done && firstRead.value) {
              fullText += firstRead.value;
              try { controller.enqueue(encoder.encode(firstRead.value)); } catch {}
            }
            while (true) {
              const { done, value } = await reader!.read();
              if (done) break;
              fullText += value;
              // 클라이언트가 끊겨도 AI 응답은 계속 수신해 fullText 완성
              try { controller.enqueue(encoder.encode(value)); } catch {}
            }
          } catch (err) {
            try { controller.error(err); } catch {}
          } finally {
            // 클라이언트 연결 여부와 무관하게 항상 DB 저장
            if (onFinishText && fullText) {
              await onFinishText(fullText).catch(console.error);
            }
            try { controller.close(); } catch {}
          }
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (err) {
      reader?.cancel().catch(() => {});
      if (isQuotaError(err) && i < models.length - 1) {
        console.warn(`[AI Fallback] ${MODEL_NAMES[i]} 쿼터 초과 → ${MODEL_NAMES[i + 1]} 전환`);
        continue;
      }
      throw err;
    }
  }

  console.error("[AI Fallback] 모든 AI 모델 쿼터 초과");
  return new Response("ALL_MODELS_EXHAUSTED", { status: 503 });
}

/** generateText + 자동 폴백 */
export async function generateWithFallback(
  options: Omit<Parameters<typeof generateText>[0], "model">
) {
  const models = FALLBACK_MODELS();
  let lastError: unknown;

  for (let i = 0; i < models.length; i++) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await generateText({ ...options, model: models[i] } as any);
    } catch (err) {
      lastError = err;
      if (isQuotaError(err) && i < models.length - 1) {
        console.warn(`[AI Fallback] ${MODEL_NAMES[i]} 쿼터 초과 → ${MODEL_NAMES[i + 1]} 전환`);
        continue;
      }
      break;
    }
  }

  throw lastError;
}
