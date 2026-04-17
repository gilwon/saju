import type {
  FourPillarsDetail,
  BirthInfo,
  FiveElement,
  HeavenlyStem,
  EarthlyBranch,
  YinYang,
  Pillar,
} from 'manseryeok';

// manseryeok 타입 재 export
export type {
  FourPillarsDetail,
  BirthInfo,
  FiveElement,
  HeavenlyStem,
  EarthlyBranch,
  YinYang,
  Pillar,
};

// ─── 캐릭터 & 채팅 타입 ───

export type CharacterType = "charon_m" | "charon_f" | "doctor" | "minjun" | "haeun" | "jian" | "seojun" | "doyun" | "yeonhwa" | "mong" | "haeri";

export interface ChatMessage {
  id: string;
  reading_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  character_id: CharacterType;
  created_at: string;
}

// ─── 사주랩 도메인 타입 ───

/** 고민 카테고리 */
export type ConcernType =
  | 'love'
  | 'career'
  | 'wealth'
  | 'health'
  | 'relationship'
  | 'other';

/** 고민 카테고리 한국어 라벨 */
export const CONCERN_LABELS: Record<ConcernType, string> = {
  love: '연애/결혼',
  career: '직업/진로',
  wealth: '재물/금전',
  health: '건강',
  relationship: '대인관계',
  other: '기타',
};

/** 성별 */
export type Gender = 'male' | 'female';

/** 오행 분포 (8글자 기준 카운트) */
export interface FiveElementDistribution {
  wood: number;   // 목
  fire: number;   // 화
  earth: number;  // 토
  metal: number;  // 금
  water: number;  // 수
}

/** 오행 영문-한글 매핑 */
export const ELEMENT_LABELS: Record<keyof FiveElementDistribution, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
};

// ─── AI 분석 결과 타입 ───

/** 월별 운세 */
export interface MonthlyFortune {
  month: number;
  fortune: string;
}

/** 행운 요소 */
export interface LuckyElements {
  color: string;
  direction: string;
  number: string;
}

/** 사주 분석 결과 (AI 생성) */
export interface SajuAnalysis {
  personality: string;
  love: string;
  career: string;
  wealth: string;
  health: string;
  yearlyFortune: string;
  monthlyFortune: MonthlyFortune[];
  luckyElements: LuckyElements;
  summary: string;
  // 추가 심화 섹션 (optional, 기존 데이터 호환)
  tenGods?: string;         // 십신 분석
  majorCycles?: string;     // 대운 흐름
  relationship?: string;    // 대인관계·사회운
  actionAdvice?: string;    // 실천 조언
}

/** 궁합 분석 결과 (AI 생성) */
export interface CompatibilityAnalysis {
  score: number;         // 0-100
  summary: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

// ─── DB 레코드 타입 (Supabase) ───

/** 사주 분석 상태 */
export type ReadingStatus =
  | 'pending'
  | 'preview'
  | 'paid'
  | 'generating'
  | 'completed'
  | 'failed';

/** 사주 분석 레코드 */
export interface SajuReading {
  id: string;
  user_id: string | null;
  name: string;
  gender: Gender;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number | null;
  birth_minute: number;
  is_lunar: boolean;
  is_leap_month: boolean;
  concerns: ConcernType[];
  four_pillars: FourPillarsDetail | null;
  five_elements: FiveElementDistribution | null;
  preview_summary: string | null;
  full_analysis: SajuAnalysis | null;
  status: ReadingStatus;
  paddle_transaction_id: string | null;
  pdf_url: string | null;
  birth_city: string | null;
  birth_longitude: number | null;
  chat_credits: number;
  chat_used: number;
  character_id: CharacterType;
  created_at: string;
  updated_at: string;
}

/** 궁합 분석 상태 */
export type CompatibilityStatus =
  | 'pending'
  | 'paid'
  | 'generating'
  | 'completed'
  | 'failed';

/** 궁합 분석 레코드 */
export interface SajuCompatibility {
  id: string;
  user_id: string | null;
  reading_id: string;            // 본인 사주 분석 참조
  partner_name: string;
  partner_gender: Gender;
  partner_birth_year: number;
  partner_birth_month: number;
  partner_birth_day: number;
  partner_birth_hour: number | null;
  partner_birth_minute: number;
  partner_is_lunar: boolean;
  partner_is_leap_month: boolean;
  partner_four_pillars: FourPillarsDetail | null;
  partner_five_elements: FiveElementDistribution | null;
  analysis: CompatibilityAnalysis | null;
  status: CompatibilityStatus;
  paddle_transaction_id: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 입력 폼 타입 ───

/** 사주 분석 입력 폼 */
export interface SajuInputForm {
  name: string;
  gender: Gender;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;    // null = 시간 모름
  birthMinute: number;
  isLunar: boolean;
  isLeapMonth: boolean;
  concerns: ConcernType[];
}

/** 궁합 분석 입력 폼 */
export interface CompatibilityInputForm {
  readingId: string;           // 본인 사주 분석 ID
  partnerName: string;
  partnerGender: Gender;
  partnerBirthYear: number;
  partnerBirthMonth: number;
  partnerBirthDay: number;
  partnerBirthHour: number | null;
  partnerBirthMinute: number;
  partnerIsLunar: boolean;
  partnerIsLeapMonth: boolean;
}
