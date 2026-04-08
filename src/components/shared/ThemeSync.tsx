"use client";

import { useTheme } from "@/components/shared/ThemeProvider";
import { useEffect } from "react";

/**
 * next-themes의 class 기반 테마를 daisyUI의 data-theme 속성과 동기화합니다.
 */
export function ThemeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.setAttribute("data-theme", "drsaju");
    } else {
      root.setAttribute("data-theme", "drsajulight");
    }
  }, [resolvedTheme]);

  return null;
}
