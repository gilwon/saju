"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("_az_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("_az_sid", sid);
  }
  return sid;
}

function getUTMParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
  };
}

function storeUTMCookie() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source");
  if (source) {
    const utm = JSON.stringify({
      utm_source: source,
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
    });
    document.cookie = `_az_utm=${encodeURIComponent(utm)};path=/;max-age=${30 * 86400};SameSite=Lax`;
  }
  if (
    !source &&
    document.referrer &&
    !document.referrer.includes(window.location.hostname)
  ) {
    document.cookie = `_az_ref=${encodeURIComponent(document.referrer)};path=/;max-age=${30 * 86400};SameSite=Lax`;
  }
}

export function usePageView() {
  const pathname = usePathname();
  const lastPath = useRef("");
  const cookieStored = useRef(false);

  useEffect(() => {
    if (!cookieStored.current) {
      storeUTMCookie();
      cookieStored.current = true;
    }

    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // localhost에서는 수집하지 않음
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;

    const utm = getUTMParams();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "page_view",
        page_path: pathname,
        session_id: getSessionId(),
        referrer: document.referrer || undefined,
        ...utm,
      }),
    }).catch(() => {});
  }, [pathname]);
}
