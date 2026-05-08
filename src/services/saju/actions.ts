"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { analyzeSaju } from "@/lib/saju/calculator";
import type {
  SajuReading,
  SajuInputForm,
  SajuCompatibility,
  CompatibilityInputForm,
  ReadingStatus,
  Gender,
  ConcernType,
} from "@/types/saju";

// --- Zod Schemas ---

const genderSchema = z.enum(["male", "female"]);

const concernSchema = z.enum([
  "love",
  "career",
  "wealth",
  "health",
  "relationship",
  "other",
]);

const sajuInputSchema = z.object({
  name: z.string().min(1).max(50),
  gender: genderSchema,
  birthYear: z.number().int().min(1900).max(2100),
  birthMonth: z.number().int().min(1).max(12),
  birthDay: z.number().int().min(1).max(31),
  birthHour: z.number().int().min(0).max(23).nullable(),
  birthMinute: z.number().int().min(0).max(59),
  isLunar: z.boolean(),
  isLeapMonth: z.boolean(),
  concerns: z.array(concernSchema).min(1).max(3),
});

const compatibilityInputSchema = z.object({
  readingId: z.string().uuid(),
  partnerName: z.string().min(1).max(50),
  partnerGender: genderSchema,
  partnerBirthYear: z.number().int().min(1900).max(2100),
  partnerBirthMonth: z.number().int().min(1).max(12),
  partnerBirthDay: z.number().int().min(1).max(31),
  partnerBirthHour: z.number().int().min(0).max(23).nullable(),
  partnerBirthMinute: z.number().int().min(0).max(59),
  partnerIsLunar: z.boolean(),
  partnerIsLeapMonth: z.boolean(),
});

// --- Server Actions ---

/**
 * 사주 분석 레코드를 생성하고, 만세력 계산(four_pillars + five_elements)을 저장합니다.
 * status='pending' 으로 생성됩니다.
 */
export async function createReading(
  input: SajuInputForm
): Promise<{ data: SajuReading | null; error: string | null }> {
  const parsed = sajuInputSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const form = parsed.data;

  // 만세력 계산
  const { pillars, elements } = analyzeSaju({
    year: form.birthYear,
    month: form.birthMonth,
    day: form.birthDay,
    hour: form.birthHour ?? 0,
    minute: form.birthMinute ?? 0,
    isLunar: form.isLunar,
    isLeapMonth: form.isLeapMonth,
  });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let guestSessionId: string | null = null;
  if (!user) {
    guestSessionId = crypto.randomUUID();
    const cookieStore = await cookies();
    cookieStore.set('guest_session_id', guestSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }

  const { data, error } = await supabase
    .from("saju_readings")
    .insert({
      user_id: user?.id ?? null,
      guest_session_id: guestSessionId,
      name: form.name,
      gender: form.gender,
      birth_year: form.birthYear,
      birth_month: form.birthMonth,
      birth_day: form.birthDay,
      birth_hour: form.birthHour,
      birth_minute: form.birthMinute,
      is_lunar: form.isLunar,
      is_leap_month: form.isLeapMonth,
      concerns: form.concerns,
      four_pillars: pillars,
      five_elements: elements,
      status: "pending",
    })
    .select("*")
    .single();

  return {
    data: data as SajuReading | null,
    error: error?.message ?? null,
  };
}

/**
 * 사주 정보(생년월일, 이름, 성별 등)를 수정하고 사주를 다시 계산합니다.
 */
export async function updateReadingBirthInfo(
  readingId: string,
  input: {
    name: string;
    gender: 'male' | 'female';
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour: number | null;
    isLunar: boolean;
    birthCity?: string;
  }
): Promise<{ error: string | null }> {
  const parsedId = z.string().uuid().safeParse(readingId);
  if (!parsedId.success) {
    return { error: "Invalid reading ID" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { pillars, elements } = analyzeSaju({
    year: input.birthYear,
    month: input.birthMonth,
    day: input.birthDay,
    hour: input.birthHour ?? 0,
    minute: 0,
    isLunar: input.isLunar,
    isLeapMonth: false,
  });

  // 사주 정보 업데이트
  const { error } = await supabase
    .from("saju_readings")
    .update({
      name: input.name,
      gender: input.gender,
      birth_year: input.birthYear,
      birth_month: input.birthMonth,
      birth_day: input.birthDay,
      birth_hour: input.birthHour,
      is_lunar: input.isLunar,
      birth_city: input.birthCity || null,
      four_pillars: pillars,
      five_elements: elements,
      updated_at: new Date().toISOString(),
    })
    .eq("id", readingId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // 기존 채팅 메시지 삭제 (사주 정보가 바뀌면 이전 분석이 무효)
  await supabase
    .from("saju_chat_messages")
    .delete()
    .eq("reading_id", readingId);

  return { error: null };
}

/**
 * ID로 사주 분석 레코드를 조회합니다.
 */
export async function getReading(
  id: string
): Promise<{ data: SajuReading | null; error: string | null }> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return { data: null, error: "Invalid reading ID" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_readings")
    .select("*")
    .eq("id", id)
    .single();

  return {
    data: data as SajuReading | null,
    error: error?.message ?? null,
  };
}

// 클라이언트(Server Action)에서 설정 가능한 status 목록 (paid/completed는 결제 웹훅에서만 설정)
const ALLOWED_CLIENT_STATUSES: ReadingStatus[] = ["pending", "preview"];

/**
 * 사주 분석 레코드의 상태를 업데이트합니다.
 * 추가 데이터(preview_summary, full_analysis, paddle_transaction_id, pdf_url 등)도 함께 업데이트 가능합니다.
 */
export async function updateReadingStatus(
  id: string,
  status: ReadingStatus,
  data?: Partial<
    Pick<
      SajuReading,
      | "preview_summary"
      | "full_analysis"
      | "paddle_transaction_id"
      | "pdf_url"
    >
  >
): Promise<{ data: SajuReading | null; error: string | null }> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return { data: null, error: "Invalid reading ID" };
  }

  // 허용된 status만 설정 가능 (paid/completed 등 결제 관련 status 우회 방지)
  if (!ALLOWED_CLIENT_STATUSES.includes(status)) {
    return { data: null, error: "Invalid status" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 게스트 reading은 소유권 확인 없이 처리 (user_id가 null)
  // 로그인 유저는 자신의 reading만 수정 가능
  let query = supabase
    .from("saju_readings")
    .update({
      status,
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (user) {
    query = query.eq("user_id", user.id);
  }

  const { data: updated, error } = await query.select("*").single();

  return {
    data: updated as SajuReading | null,
    error: error?.message ?? null,
  };
}

/**
 * 게스트로 생성한 readings를 로그인한 계정으로 연결합니다.
 */
export async function migrateGuestReadings(
  readingIds: string[]
): Promise<{ error: string | null }> {
  if (!readingIds.length) return { error: null };

  const validIds = readingIds.filter(
    (id) => z.string().uuid().safeParse(id).success
  );
  if (!validIds.length) return { error: null };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get('guest_session_id')?.value;

  // user_id가 null인 게스트 reading만 연결 (타인 소유 reading 탈취 방지)
  // guest_session_id가 있으면 해당 세션의 reading만 migrate
  let query = supabase
    .from("saju_readings")
    .update({ user_id: user.id, updated_at: new Date().toISOString() })
    .in("id", validIds)
    .is("user_id", null);

  if (guestSessionId) {
    query = query.eq("guest_session_id", guestSessionId);
  }

  const { error } = await query;

  if (guestSessionId) {
    cookieStore.delete('guest_session_id');
  }

  return { error: error?.message ?? null };
}

/**
 * 무료 리포트 생성을 위해 reading 상태를 paid로 전환합니다. (서버 측에서 소유권 검증 후 전환)
 */
export async function initializeFreeReportStatus(
  readingId: string
): Promise<{ error?: string }> {
  const parsed = z.string().uuid().safeParse(readingId);
  if (!parsed.success) return { error: "Invalid reading ID" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reading } = await supabase
    .from("saju_readings")
    .select("user_id, guest_session_id, status")
    .eq("id", readingId)
    .single();

  if (!reading) return { error: "Reading not found" };
  if (!["pending", "preview"].includes(reading.status as string)) {
    return { error: "이미 처리된 분석입니다." };
  }

  if (user) {
    if (reading.user_id !== null && reading.user_id !== user.id) {
      return { error: "Forbidden" };
    }
  } else {
    if (reading.user_id !== null) return { error: "Forbidden" };
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get("guest_session_id")?.value;
    const rgsid = (reading as Record<string, unknown>).guest_session_id as string | null;
    if (rgsid !== null && rgsid !== guestSessionId) {
      return { error: "Forbidden" };
    }
  }

  const { error } = await supabase
    .from("saju_readings")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", readingId);

  if (error) return { error: "상태 업데이트에 실패했습니다." };
  return {};
}

/**
 * 사주 분석 레코드에 user_id를 연결합니다. (결제 + 로그인 후 호출)
 */
export async function linkReadingToUser(
  readingId: string,
  userId: string
): Promise<{ data: SajuReading | null; error: string | null }> {
  const parsedId = z.string().uuid().safeParse(readingId);
  const parsedUserId = z.string().uuid().safeParse(userId);
  if (!parsedId.success || !parsedUserId.success) {
    return { data: null, error: "Invalid ID" };
  }

  const supabase = await createClient();

  // user_id가 null인 게스트 reading만 연결 가능 (이미 다른 유저 소유인 reading 탈취 방지)
  const { data, error } = await supabase
    .from("saju_readings")
    .update({
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", readingId)
    .is("user_id", null)
    .select("*")
    .single();

  return {
    data: data as SajuReading | null,
    error: error?.message ?? null,
  };
}

/**
 * 궁합 분석 레코드를 생성합니다.
 */
export async function createCompatibility(
  input: CompatibilityInputForm
): Promise<{ data: SajuCompatibility | null; error: string | null }> {
  const parsed = compatibilityInputSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const form = parsed.data;

  // 파트너 만세력 계산
  const { pillars, elements } = analyzeSaju({
    year: form.partnerBirthYear,
    month: form.partnerBirthMonth,
    day: form.partnerBirthDay,
    hour: form.partnerBirthHour ?? 0,
    minute: form.partnerBirthMinute ?? 0,
    isLunar: form.partnerIsLunar,
    isLeapMonth: form.partnerIsLeapMonth,
  });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_compatibility")
    .insert({
      reading_id: form.readingId,
      partner_name: form.partnerName,
      partner_gender: form.partnerGender,
      partner_birth_year: form.partnerBirthYear,
      partner_birth_month: form.partnerBirthMonth,
      partner_birth_day: form.partnerBirthDay,
      partner_birth_hour: form.partnerBirthHour,
      partner_birth_minute: form.partnerBirthMinute,
      partner_is_lunar: form.partnerIsLunar,
      partner_is_leap_month: form.partnerIsLeapMonth,
      partner_four_pillars: pillars,
      partner_five_elements: elements,
      status: "pending",
    })
    .select("*")
    .single();

  return {
    data: data as SajuCompatibility | null,
    error: error?.message ?? null,
  };
}

/**
 * ID로 궁합 분석 레코드를 조회합니다.
 */
export async function getCompatibility(
  id: string
): Promise<{ data: SajuCompatibility | null; error: string | null }> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return { data: null, error: "Invalid compatibility ID" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_compatibility")
    .select("*")
    .eq("id", id)
    .single();

  return {
    data: data as SajuCompatibility | null,
    error: error?.message ?? null,
  };
}

/**
 * 사용자의 모든 사주 분석 레코드를 조회합니다.
 */
export async function getUserReadings(
  userId: string
): Promise<{ data: SajuReading[]; error: string | null }> {
  const parsed = z.string().uuid().safeParse(userId);
  if (!parsed.success) {
    return { data: [], error: "Invalid user ID" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_readings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    data: (data ?? []) as SajuReading[],
    error: error?.message ?? null,
  };
}
