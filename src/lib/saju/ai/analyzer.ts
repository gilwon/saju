import type { FourPillarsDetail } from 'manseryeok';
import type {
  FiveElementDistribution,
  Gender,
  ConcernType,
  SajuAnalysis,
  CompatibilityAnalysis,
} from '@/types/saju';
import {
  buildPreviewPrompt,
  buildSajuAnalysisPrompt,
  buildCompatibilityPrompt,
  parseAIResponse,
} from '../prompts';
import { generateWithFallback } from '@/lib/ai/model';

/**
 * 무료 미리보기 텍스트를 생성합니다 (150자 이내).
 */
export async function generatePreview(params: {
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
  gender: Gender;
}): Promise<string> {
  const { system, user } = buildPreviewPrompt(params);

  const { text } = await generateWithFallback({
    system,
    prompt: user,
    maxOutputTokens: 300,
    temperature: 0.7,
  });

  return text.trim();
}

/**
 * 종합 사주분석을 생성합니다.
 */
export async function generateFullAnalysis(params: {
  name: string;
  gender: Gender;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
  concerns: ConcernType[];
  currentYear: number;
  advancedContext?: string;
}): Promise<SajuAnalysis> {
  const { system, user } = buildSajuAnalysisPrompt(params);

  const { text } = await generateWithFallback({
    system,
    prompt: user,
    maxOutputTokens: 12000,
    temperature: 0.7,
  });

  return parseAIResponse<SajuAnalysis>(text);
}

/**
 * 궁합 분석을 생성합니다.
 */
export async function generateCompatibility(params: {
  person1: {
    name: string;
    gender: Gender;
    pillars: FourPillarsDetail;
    elements: FiveElementDistribution;
  };
  person2: {
    name: string;
    gender: Gender;
    pillars: FourPillarsDetail;
    elements: FiveElementDistribution;
  };
}): Promise<CompatibilityAnalysis> {
  const { system, user } = buildCompatibilityPrompt(params);

  const { text } = await generateWithFallback({
    system,
    prompt: user,
    maxOutputTokens: 2048,
    temperature: 0.7,
  });

  return parseAIResponse<CompatibilityAnalysis>(text);
}
