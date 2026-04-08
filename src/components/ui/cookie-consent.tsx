"use client";

import { useState, useEffect } from "react";
import { Cookie, XIcon } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (consent === null) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "true");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "false");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/20 dark:shadow-black/60">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Cookie className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              더 나은 서비스를 위해 쿠키를 사용합니다.{" "}
              <a
                href="/privacy-policy"
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              >
                개인정보처리방침
              </a>
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="닫기"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-3.5 flex items-center justify-end gap-2">
          <button
            onClick={decline}
            className="rounded-lg px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            거부
          </button>
          <button
            onClick={accept}
            className="rounded-lg px-5 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );
}
