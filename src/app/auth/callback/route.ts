import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { routing } from "@/i18n/routing";
import { sendWelcomeEmail } from "@/services/email/actions";
import { trackEvent } from "@/lib/analytics/track";
import { processReferral } from "@/services/referral/actions";
import { getReferralCodeFromHeaders } from "@/services/referral/cookie";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Get preferred locale from cookie or default
  const cookieStore = request.headers.get("cookie");
  const localeCookie = cookieStore
    ?.split("; ")
    .find((c) => c.startsWith("NEXT_LOCALE="))
    ?.split("=")[1];
  const locale = (localeCookie || routing.defaultLocale) as (typeof routing.locales)[number];

  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  // Only add locale prefix for non-default locales (en has no prefix)
  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const localizedNext = `${localePrefix}${next.startsWith("/") ? next : `/${next}`}`;

  // Magic Link는 code 파라미터를 사용
  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    // 디버깅용 에러 로깅
    if (error) {
      console.error("Auth code exchange error:", error.message, error);
    }

    if (!error && data?.user) {
      const user = data.user;

      // 신규 사용자 감지: created_at이 10초 이내면 신규
      const createdAt = new Date(user.created_at);
      const now = new Date();
      const isNewUser = now.getTime() - createdAt.getTime() < 10000; // 10초

      // 쿠키에서 UTM / referrer 읽기
      const utmCookie = cookieStore
        ?.split("; ")
        .find((c) => c.startsWith("_az_utm="))
        ?.split("=")
        .slice(1)
        .join("=");
      const refCookie = cookieStore
        ?.split("; ")
        .find((c) => c.startsWith("_az_ref="))
        ?.split("=")
        .slice(1)
        .join("=");

      let utmData = { utm_source: "", utm_medium: "", utm_campaign: "" };
      if (utmCookie) {
        try {
          utmData = JSON.parse(decodeURIComponent(utmCookie));
        } catch {}
      }
      const firstReferrer = refCookie ? decodeURIComponent(refCookie) : "";

      // Geo / device from headers
      const signupCountry = request.headers.get("x-vercel-ip-country") || null;
      const ua = request.headers.get("user-agent") || "";
      const signupDevice = /mobile/i.test(ua)
        ? "mobile"
        : /tablet/i.test(ua)
          ? "tablet"
          : "desktop";

      // 신규 사용자 처리: 환영 이메일 + Attribution 저장
      if (isNewUser) {
        const userName =
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

        // 비동기로 이메일 발송 (응답 대기하지 않음)
        sendWelcomeEmail({
          email: user.email!,
          userName,
          locale,
        }).catch((err) => console.error("Welcome email failed:", err));

        trackEvent({
          userId: user.id,
          eventType: "signup",
          utmSource: utmData.utm_source || undefined,
          utmMedium: utmData.utm_medium || undefined,
          utmCampaign: utmData.utm_campaign || undefined,
          referrer: firstReferrer || undefined,
        }).catch(() => {});

        // 레퍼럴 처리: 쿠키에서 레퍼럴 코드 확인 후 보상 지급
        const referralCode = getReferralCodeFromHeaders(cookieStore);
        if (referralCode) {
          processReferral(referralCode).catch((err) =>
            console.error("레퍼럴 처리 실패:", err)
          );
        }

        // users 테이블에 First Touch Attribution 저장
        const adminSupabase = createAdminClient();
        adminSupabase
          .from("users")
          .update({
            first_utm_source: utmData.utm_source || null,
            first_utm_medium: utmData.utm_medium || null,
            first_utm_campaign: utmData.utm_campaign || null,
            first_referrer: firstReferrer || null,
            signup_country: signupCountry,
            signup_device: signupDevice,
          })
          .eq("id", user.id)
          .then(() => {});
      } else {
        trackEvent({ userId: user.id, eventType: "login" }).catch(() => {});
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      const baseUrl = isLocalEnv
        ? origin
        : forwardedHost
          ? `https://${forwardedHost}`
          : origin;

      return NextResponse.redirect(`${baseUrl}${localizedNext}`);
    }
  } else {
    console.error(
      "Auth callback: No code parameter received. URL:",
      request.url
    );
  }

  // return the user to an error page with instructions
  const errorLocalePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return NextResponse.redirect(
    `${origin}${errorLocalePrefix}/login?error=auth-code-error`
  );
}
