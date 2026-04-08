import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import SajuReportClient from "@/components/saju/report/SajuReportClient";

export default async function SajuReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/ko?login=required");
  }

  // [별 시스템 비활성화] 무제한 무료 사용
  const starBalance = 99999;

  // 최근 사주 정보 (사이드바 + 내 정보 사용하기 용)
  const { data: latestReading } = await supabase
    .from("saju_readings")
    .select("id, character_id, name, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar, birth_city")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // 완료된 리포트 목록 (재다운로드용)
  const { data: completedReports } = await supabase
    .from("saju_readings")
    .select("id, name, birth_year, birth_month, birth_day, created_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("full_analysis", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  const previousBirthInfo = latestReading
    ? {
        name: latestReading.name as string,
        gender: latestReading.gender as "male" | "female",
        birthYear: latestReading.birth_year as number,
        birthMonth: latestReading.birth_month as number,
        birthDay: latestReading.birth_day as number,
        birthHour: latestReading.birth_hour as number | null,
        isLunar: latestReading.is_lunar as boolean,
        birthCity: (latestReading.birth_city as string) ?? undefined,
      }
    : undefined;

  const currentReading = latestReading
    ? {
        id: latestReading.id as string,
        characterId: (latestReading.character_id ?? "charon_m") as import("@/lib/saju/characters").CharacterType,
        name: latestReading.name as string,
        gender: latestReading.gender as "male" | "female",
        birthYear: latestReading.birth_year as number,
        birthMonth: latestReading.birth_month as number,
        birthDay: latestReading.birth_day as number,
        birthHour: latestReading.birth_hour as number | null,
        isLunar: latestReading.is_lunar as boolean,
        birthCity: (latestReading.birth_city as string) ?? undefined,
      }
    : undefined;

  return (
    <SajuLayout currentReading={currentReading}>
      <SajuReportClient
        userId={user.id}
        starBalance={starBalance}
        previousBirthInfo={previousBirthInfo}
        completedReports={completedReports ?? []}
      />
    </SajuLayout>
  );
}
