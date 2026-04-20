'use client';

import { useState } from 'react';
import SajuNavbar from '@/components/saju/landing/SajuNavbar';
import LoginSidebar from '@/components/saju/landing/LoginSidebar';
import type { CharacterType } from '@/lib/saju/characters';
import type { SajuProfile } from '@/types/saju';

interface MobileLayoutWrapperProps {
  isLoggedIn: boolean;
  sidebarUser: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  } | null;
  chatHistory: {
    id: string;
    character_id: CharacterType;
    character_name: string;
    character_avatar: string;
    title: string | null;
    reading_name: string;
    updated_at: string;
    href?: string;
    isReadingResult?: boolean;
  }[];
  currentReading?: {
    id: string;
    characterId: CharacterType;
    name: string;
    gender: 'male' | 'female';
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour: number | null;
    isLunar: boolean;
    birthCity?: string;
  };
  totalCoins: number;
  isAdmin?: boolean;
  profiles?: SajuProfile[];
  children: React.ReactNode;
}

export default function MobileLayoutWrapper({
  isLoggedIn,
  sidebarUser,
  chatHistory,
  currentReading,
  totalCoins,
  isAdmin = false,
  profiles = [],
  children,
}: MobileLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SajuNavbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onMenuToggle={() => setSidebarOpen((v) => !v)} />

      <div className="flex">
        {/* 데스크톱: 기존 사이드바 */}
        <LoginSidebar
          user={sidebarUser}
          chatHistory={chatHistory}
          currentReading={currentReading}
          totalCoins={totalCoins}
          profiles={profiles}
        />

        {/* 모바일: 슬라이드 오버레이 사이드바 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <aside
              className="absolute left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border overflow-y-auto flex flex-col animate-slide-in-left"
              onClick={(e) => e.stopPropagation()}
            >
              <LoginSidebar
                user={sidebarUser}
                chatHistory={chatHistory}
                currentReading={currentReading}
                profiles={profiles}
                totalCoins={totalCoins}
                isMobile
                onNavigate={() => setSidebarOpen(false)}
              />
            </aside>
          </div>
        )}

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
