"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.fbq) {
    if (params) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }
  }
}

export default function MetaPixel() {
  useEffect(() => {
    if (!PIXEL_ID || typeof window === "undefined") return;
    if (window.fbq) return;

    const n = (function (...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (n as any).callMethod
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (n as any).callMethod.apply(n, args)
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (n as any).queue.push(args);
    }) as Window["fbq"] & { queue: unknown[][]; loaded: boolean; version: string };
    n.queue = [];
    n.loaded = true;
    n.version = "2.0";
    window.fbq = n;
    window._fbq = n;

    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }, []);

  if (!PIXEL_ID) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      src={`https://connect.facebook.net/en_US/fbevents.js`}
    />
  );
}
