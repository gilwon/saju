import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics/track";
import type { AnalyticsEventType } from "@/types/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_type,
      page_path,
      session_id,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      user_id,
      properties,
    } = body;

    if (!event_type) {
      return NextResponse.json({ error: "event_type is required" }, { status: 400 });
    }

    await trackEvent({
      eventType: event_type as AnalyticsEventType,
      pagePath: page_path,
      sessionId: session_id,
      referrer,
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
      utmContent: utm_content,
      utmTerm: utm_term,
      userId: user_id,
      properties,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
