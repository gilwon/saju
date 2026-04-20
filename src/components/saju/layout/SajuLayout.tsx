import { createClient } from '@/utils/supabase/server';
import MobileLayoutWrapper from './MobileLayoutWrapper';
import { CHARACTERS, type CharacterType } from '@/lib/saju/characters';
import type { SajuProfile } from '@/types/saju';

interface SajuLayoutProps {
  children: React.ReactNode;
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
}

export default async function SajuLayout({ children, currentReading }: SajuLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 유저면 대화 기록 조회
  let profiles: SajuProfile[] = [];
  let chatHistory: {
    id: string;
    character_id: CharacterType;
    character_name: string;
    character_avatar: string;
    title: string | null;
    reading_name: string;
    updated_at: string;
  }[] = [];
  let totalCoins = 0;

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

  if (user) {
    const { data: profileData } = await supabase
      .from('saju_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (profileData) profiles = profileData as SajuProfile[];

    const { data: readings } = await supabase
      .from('saju_readings')
      .select('id, character_id, title, name, updated_at')
      .eq('user_id', user.id)
      .not('character_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (readings) {
      chatHistory = readings.map((r) => {
        const rawCharId = r.character_id as string;
        const charExists = !!CHARACTERS[rawCharId as keyof typeof CHARACTERS];
        const charId = (charExists ? rawCharId : 'charon_m') as CharacterType;
        const char = CHARACTERS[charId];
        return {
          id: r.id,
          character_id: charId,
          character_name: char.name,
          character_avatar: char.avatar,
          title: (r as Record<string, unknown>).title as string | null,
          reading_name: (r as Record<string, unknown>).name as string,
          updated_at: r.updated_at,
        };
      });
    }

    const isAdmin = user.email ? adminEmails.includes(user.email) : false;

    if (isAdmin) {
      totalCoins = 99999;
    } else {
      let { data: stars } = await supabase
        .from('user_stars')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!stars) {
        await supabase.from('user_stars').insert({ user_id: user.id, balance: 3 });
        stars = { balance: 3 };
      }
      totalCoins = stars.balance;
    }
  }

  const isAdminUser = user?.email ? adminEmails.includes(user.email) : false;

  const sidebarUser = user
    ? {
        id: user.id,
        email: user.email ?? undefined,
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? undefined,
        avatar: user.user_metadata?.avatar_url ?? undefined,
      }
    : null;

  return (
    <MobileLayoutWrapper
      isLoggedIn={!!user}
      sidebarUser={sidebarUser}
      chatHistory={chatHistory}
      currentReading={currentReading}
      totalCoins={totalCoins}
      isAdmin={isAdminUser}
      profiles={profiles}
    >
      {children}
    </MobileLayoutWrapper>
  );
}
