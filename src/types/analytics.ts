// 이벤트 타입
export type AnalyticsEventType =
  | "page_view"
  | "signup"
  | "login"
  | "reading_start"
  | "reading_complete"
  | "chat_message"
  | "purchase"
  | "compatibility_start"
  | "payment_success"
  | "payment_failed";

// 이벤트 로그
export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  user_id: string | null;
  properties: Record<string, unknown> | null;
  page_path: string | null;
  referrer: string | null;
  session_id: string | null;
  created_at: string;
}

// 트래픽 분석 타입
export interface CountryData {
  country_code: string;
  count: number;
}

// 사주랩 분석 대시보드 타입

export interface FunnelStep {
  label: string;
  count: number;
  rate: number;
}

export interface CohortRow {
  cohortMonth: string;
  totalUsers: number;
  retention: number[];
}

export interface HeatmapCell {
  hour: number;
  day: number;
  value: number;
}

export interface DateRange {
  from: string;
  to: string;
}

// 사용자 목록 아이템
export interface UserListItem {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  lastSignIn: string | null;
  readingCount: number;
  starBalance: number;
}

// 사주분석 항목
export interface SajuReadingItem {
  id: string;
  character_id: string | null;
  name: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  gender: string;
  title: string | null;
  chat_used: number;
  created_at: string;
}

// 대화 메시지
export interface ChatMessageItem {
  id: string;
  reading_id: string;
  role: string;
  content: string;
  character_id: string | null;
  created_at: string;
}

// 궁합 분석 항목
export interface CompatibilityItem {
  id: string;
  reading_id: string;
  partner_name: string;
  created_at: string;
}
