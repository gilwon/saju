import { createAdminClient } from "@/utils/supabase/admin";
import { headers } from "next/headers";
import crypto from "crypto";
import type { AnalyticsEventType } from "@/types/analytics";

interface TrackEventParams {
  userId?: string | null;
  eventType: AnalyticsEventType;
  properties?: Record<string, unknown>;
  sessionId?: string;
  pagePath?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

function extractBrowser(ua: string): string {
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function extractOS(ua: string): string {
  if (/windows/i.test(ua)) return "Windows";
  if (/mac/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad/i.test(ua)) return "iOS";
  return "Other";
}

async function extractRequestMeta() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "";
  const ipHash = ip
    ? crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16)
    : null;

  const countryCode = h.get("x-vercel-ip-country") || null;
  const city = h.get("x-vercel-ip-city") || null;

  const ua = h.get("user-agent") || "";
  const deviceType = /mobile/i.test(ua)
    ? "mobile"
    : /tablet/i.test(ua)
      ? "tablet"
      : "desktop";
  const browser = extractBrowser(ua);
  const os = extractOS(ua);

  return { ipHash, countryCode, city, deviceType, browser, os };
}

export async function trackEvent(params: TrackEventParams) {
  if (process.env.NODE_ENV === "development") return;

  try {
    const supabase = createAdminClient();
    const meta = await extractRequestMeta();

    await supabase.from("analytics_events").insert({
      user_id: params.userId || null,
      session_id: params.sessionId || null,
      event_type: params.eventType,
      properties: params.properties || {},
      page_path: params.pagePath || null,
      referrer: params.referrer || null,
      utm_source: params.utmSource || null,
      utm_medium: params.utmMedium || null,
      utm_campaign: params.utmCampaign || null,
      utm_content: params.utmContent || null,
      utm_term: params.utmTerm || null,
      country_code: meta.countryCode,
      city: meta.city,
      device_type: meta.deviceType,
      browser: meta.browser,
      os: meta.os,
      ip_hash: meta.ipHash,
    });
  } catch (error) {
    console.error("[analytics] trackEvent error:", error);
  }
}
