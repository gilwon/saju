import { cookies } from "next/headers";

// 레퍼럴 쿠키 이름
const REFERRAL_COOKIE_NAME = "_drsaju_ref";
// 쿠키 유효기간: 7일 (초 단위)
const REFERRAL_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * 레퍼럴 코드를 쿠키에 저장합니다.
 * 레퍼럴 링크 접속 시 호출됩니다.
 */
export async function setReferralCookie(code: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFERRAL_COOKIE_NAME, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * 쿠키에서 레퍼럴 코드를 읽어옵니다.
 * 회원가입 시 호출됩니다.
 */
export async function getReferralCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFERRAL_COOKIE_NAME)?.value ?? null;
}

/**
 * 레퍼럴 쿠키를 삭제합니다.
 * 레퍼럴 처리 완료 후 호출됩니다.
 */
export async function clearReferralCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFERRAL_COOKIE_NAME);
}

/**
 * Request 헤더에서 레퍼럴 쿠키를 읽어옵니다.
 * auth/callback 같은 Route Handler에서 사용합니다.
 */
export function getReferralCodeFromHeaders(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null;

  const referralCookie = cookieHeader
    .split("; ")
    .find((c) => c.startsWith(`${REFERRAL_COOKIE_NAME}=`));

  return referralCookie?.split("=").slice(1).join("=") ?? null;
}
