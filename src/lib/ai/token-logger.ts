/**
 * AI 토큰 사용량 로깅 유틸리티
 */

interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

export function logTokenUsage(
  label: string,
  usage: TokenUsage | undefined,
  modelName?: string
) {
  if (!usage) {
    console.log(`[Token] ${label}: usage not available`);
    return;
  }

  const raw = usage as unknown as Record<string, number>;
  const input = raw.inputTokens ?? raw.promptTokens ?? raw.prompt_tokens ?? 0;
  const output = raw.outputTokens ?? raw.completionTokens ?? raw.completion_tokens ?? 0;
  const total = input + output;

  // 비용 추정 ($/1M tokens)
  const costEstimates: Record<string, { input: number; output: number }> = {
    "grok-4.1-fast": { input: 0.20, output: 0.50 },
    "grok-4.1-fast-std": { input: 0.20, output: 0.50 },
  };

  const rates = costEstimates[modelName || "grok-4.1-fast"] || costEstimates["grok-4.1-fast"];
  const cost = (input / 1_000_000) * rates.input + (output / 1_000_000) * rates.output;

  console.log(
    `[Token] ${label} | model=${modelName || "gemini-flash-lite"} | in=${input.toLocaleString()} out=${output.toLocaleString()} total=${total.toLocaleString()} | $${cost.toFixed(4)}`
  );
}
