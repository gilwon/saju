import { updateSession } from "@/utils/supabase/middleware";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// 인증이 필요한 보호 경로
// - /my-readings: 내 분석 목록
// - /reading/[id]/result: 결제 완료 후 전체 결과
const PROTECTED_PATTERN = /^\/[^/]+\/(my-readings|reading\/[^/]+\/result)/;

export async function proxy(request: NextRequest) {
  // 1. Run next-intl middleware to handle locale redirects and get the base response
  const response = intlMiddleware(request);

  // 2. Run Supabase session update (copies cookies to response)
  const supabaseResponse = await updateSession(request, response);

  // 3. pathname 헤더 추가 (layout.tsx에서 현재 경로 확인용)
  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname);

  // 4. Protect dashboard routes — redirect to login if not authenticated
  const pathname = request.nextUrl.pathname;
  if (PROTECTED_PATTERN.test(pathname)) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const locale = pathname.split("/")[1] || "ko";
        const loginUrl = new URL(`/${locale}/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - auth routes (handled by root route handlers)
  // - _next (static files)
  // - _vercel (Vercel internals)
  // - Static files (e.g. favicon.ico, sitemap.xml, robots.txt, etc.)
  matcher: ["/((?!api|auth|widget|icon|demo|_next|_vercel|.*\\..*).*)"],
};
