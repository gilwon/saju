"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// --- 유틸리티 ---

/**
 * 8자리 랜덤 레퍼럴 코드 생성 (영문 대문자 + 숫자)
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 혼동하기 쉬운 O/0/1/I 제외
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// --- Zod Schemas ---

const referralCodeSchema = z.string().min(6).max(10);

// --- Server Actions ---

/**
 * 로그인한 유저의 레퍼럴 코드를 조회하거나, 없으면 새로 생성합니다.
 */
export async function getOrCreateReferralCode(): Promise<{
  data: { code: string } | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // 기존 코드 조회
  const { data: existing } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { data: { code: existing.code }, error: null };
  }

  // 새 코드 생성 (중복 시 재시도)
  let retries = 3;
  while (retries > 0) {
    const code = generateReferralCode();

    const { data: created, error } = await supabase
      .from("referral_codes")
      .insert({ user_id: user.id, code })
      .select("code")
      .single();

    if (!error && created) {
      return { data: { code: created.code }, error: null };
    }

    // unique 제약 위반이 아니면 에러 반환
    if (error && !error.message.includes("duplicate")) {
      return { data: null, error: error.message };
    }

    retries--;
  }

  return { data: null, error: "레퍼럴 코드 생성에 실패했습니다. 다시 시도해주세요." };
}

/**
 * 레퍼럴 코드로 초대를 처리합니다.
 * 회원가입 완료 후 호출되며, 양쪽(초대한 사람 + 초대받은 사람)에 별 3개씩 지급합니다.
 */
export async function processReferral(
  referralCode: string
): Promise<{ success: boolean; error: string | null }> {
  const parsed = referralCodeSchema.safeParse(referralCode);
  if (!parsed.success) {
    return { success: false, error: "유효하지 않은 레퍼럴 코드입니다." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 레퍼럴 코드 조회
  const { data: codeData } = await supabase
    .from("referral_codes")
    .select("id, user_id, code")
    .eq("code", parsed.data)
    .single();

  if (!codeData) {
    return { success: false, error: "존재하지 않는 레퍼럴 코드입니다." };
  }

  // 자기 자신을 초대할 수 없음
  if (codeData.user_id === user.id) {
    return { success: false, error: "자기 자신을 초대할 수 없습니다." };
  }

  // 이미 초대받은 적이 있는지 확인
  const { data: existingReferral } = await supabase
    .from("referrals")
    .select("id")
    .eq("referred_id", user.id)
    .single();

  if (existingReferral) {
    // 이미 처리됨 - 에러가 아닌 성공으로 처리 (중복 호출 방지)
    return { success: true, error: null };
  }

  // 레퍼럴 레코드 생성
  const { error: insertError } = await supabase.from("referrals").insert({
    referrer_id: codeData.user_id,
    referred_id: user.id,
    referral_code_id: codeData.id,
    status: "completed",
    reward_given: true,
  });

  if (insertError) {
    console.error("레퍼럴 생성 실패:", insertError);
    return { success: false, error: "레퍼럴 처리에 실패했습니다." };
  }

  // 양쪽에 별 1개씩 지급
  const REWARD_STARS = 1;

  // 초대받은 사람 (현재 유저) 별 지급
  await addStarsToUser(supabase, user.id, REWARD_STARS);

  // 초대한 사람 별 지급
  await addStarsToUser(supabase, codeData.user_id, REWARD_STARS);

  return { success: true, error: null };
}

/**
 * 유저에게 별을 추가하는 내부 함수
 */
async function addStarsToUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  amount: number
) {
  // 현재 잔액 조회
  const { data: existing } = await supabase
    .from("user_stars")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (existing) {
    const newBalance = (existing.balance || 0) + amount;
    await supabase
      .from("user_stars")
      .update({ balance: newBalance })
      .eq("user_id", userId);
  } else {
    // user_stars 레코드가 없으면 생성
    await supabase
      .from("user_stars")
      .insert({ user_id: userId, balance: amount });
  }
}

/**
 * 내 초대 현황을 조회합니다.
 */
export async function getReferralStats(): Promise<{
  data: {
    totalInvited: number;
    rewardedCount: number;
    totalRewardStars: number;
  } | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // 내가 초대한 사람들 조회
  const { data: referrals, error } = await supabase
    .from("referrals")
    .select("id, status, reward_given")
    .eq("referrer_id", user.id);

  if (error) {
    return { data: null, error: error.message };
  }

  const totalInvited = referrals?.length || 0;
  const rewardedCount =
    referrals?.filter((r) => r.reward_given).length || 0;
  const totalRewardStars = rewardedCount * 1; // 보상받은 건당 1별

  return {
    data: {
      totalInvited,
      rewardedCount,
      totalRewardStars,
    },
    error: null,
  };
}
