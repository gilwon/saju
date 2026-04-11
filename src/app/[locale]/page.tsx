import SajuLayout from "@/components/saju/layout/SajuLayout";
import CharacterCards from "@/components/saju/landing/CharacterCards";
import SajuTestimonials from "@/components/saju/landing/SajuTestimonials";
import SajuFAQ from "@/components/saju/landing/SajuFAQ";
import SajuFooter from "@/components/saju/landing/SajuFooter";
import { createClient } from "@/utils/supabase/server";
import type { CharacterType } from "@/lib/saju/characters";
import type { SajuReading } from "@/types/saju";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인 유저면 최근 reading에서 사주 정보 가져오기
  let currentReading;
  if (user) {
    const { data: latestReading } = await supabase
      .from("saju_readings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestReading) {
      const r = latestReading as SajuReading;
      currentReading = {
        id: r.id,
        characterId: (r.character_id || "charon_m") as CharacterType,
        name: r.name,
        gender: r.gender as "male" | "female",
        birthYear: r.birth_year,
        birthMonth: r.birth_month,
        birthDay: r.birth_day,
        birthHour: r.birth_hour,
        isLunar: r.is_lunar,
        birthCity: r.birth_city ?? undefined,
      };
    }
  }

  return (
    <SajuLayout currentReading={currentReading}>
      {/* 카드 + 이용방법 = 한 영역 */}
      <div className="bg-background">
        <CharacterCards />
      </div>
      {/* <SajuTestimonials /> */}
      {/* <SajuFAQ /> */}
      <SajuFooter />
    </SajuLayout>
  );
}
