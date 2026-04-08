import { redirect } from "next/navigation";
import { setReferralCookie } from "@/services/referral/cookie";

interface InvitePageProps {
  params: Promise<{ code: string; locale: string }>;
}

/**
 * 레퍼럴 초대 랜딩 페이지
 * /invite/[code] 접속 시 레퍼럴 코드를 쿠키에 저장하고 메인 페이지로 리다이렉트합니다.
 */
export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;

  // 레퍼럴 코드 유효성 기본 검사 (8자 영문+숫자)
  if (code && /^[A-Z0-9]{6,10}$/i.test(code)) {
    await setReferralCookie(code.toUpperCase());
  }

  // 메인 페이지로 리다이렉트
  redirect("/");
}
