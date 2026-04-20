"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface SajuNavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onMenuToggle?: () => void;
}

export default function SajuNavbar({ isLoggedIn = false, isAdmin = false, onMenuToggle }: SajuNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/90 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-background border-b border-border"
      }`}
    >
      <div className="px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="메뉴"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/characters/hyunwoo-avatar-v3.jpg"
              alt="사주랩"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-lg font-extrabold text-foreground">사주랩</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              로그인
            </Link>
          ) : (
            <>
              {isAdmin && (
                <Link
                  href="/admin/analytics/overview"
                  className="flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors px-2 py-1.5 rounded-lg"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                  </svg>
                  Admin
                </Link>
              )}
              {/* [별 시스템 비활성화] 친구초대 / 충전 버튼 숨김 */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
