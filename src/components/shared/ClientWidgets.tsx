"use client";

import dynamic from "next/dynamic";
import { usePageView } from "@/hooks/useAnalytics";

// const CookieConsent = dynamic(
//   () =>
//     import("@/components/ui/cookie-consent").then((mod) => mod.CookieConsent),
//   { ssr: false }
// );

export function ClientWidgets() {
  usePageView();

  return (
    <>
      {/* <CookieConsent /> */}
    </>
  );
}
