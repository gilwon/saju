import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getChatMessages } from "@/services/saju/chat-actions";
import { CHARACTERS, type CharacterType } from "@/lib/saju/characters";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import ChatRoom from "@/components/saju/chat/ChatRoom";
import type { SajuReading } from "@/types/saju";
import type { UIMessage } from "ai";

interface ChatPageProps {
  params: Promise<{ characterId: string; locale: string }>;
  searchParams: Promise<{ r?: string; new?: string }>;
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const { characterId, locale } = await params;
  const { r: readingIdParam, new: isNewChat } = await searchParams;

  if (!CHARACTERS[characterId as CharacterType]) {
    redirect(`/${locale}`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}?login=required&character=${characterId}`);
  }

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);
  const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;

  // [별 시스템 비활성화] 잔액 조회 없이 무제한 사용
  const starBalance = 99999;
  // --- 별 잔액 조회 (추후 재활성화 시 아래 주석 해제) ---
  // let starBalance = 0;
  // if (isAdmin) {
  //   starBalance = 99999;
  // } else {
  //   let { data: stars } = await supabase
  //     .from("user_stars")
  //     .select("balance")
  //     .eq("user_id", user.id)
  //     .single();
  //   if (!stars) {
  //     await supabase.from("user_stars").insert({ user_id: user.id, balance: 3 });
  //     stars = { balance: 3 };
  //   }
  //   starBalance = stars.balance;
  // }

  // 새 대화 모드면 기존 reading 건너뛰고 바로 입력 폼
  if (isNewChat === 'true') {
    // 기존 사주정보 참고용으로 가져오기
    const { data: anyReading } = await supabase
      .from("saju_readings")
      .select("name, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar, birth_city")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const previousBirthInfo = anyReading
      ? {
          name: anyReading.name as string,
          gender: anyReading.gender as "male" | "female",
          birthYear: anyReading.birth_year as number,
          birthMonth: anyReading.birth_month as number,
          birthDay: anyReading.birth_day as number,
          birthHour: anyReading.birth_hour as number | null,
          isLunar: anyReading.is_lunar as boolean,
          birthCity: (anyReading.birth_city as string) ?? undefined,
        }
      : undefined;

    return (
      <SajuLayout>
        <ChatRoom
          characterId={characterId as CharacterType}
          needsBirthInfo
          starBalance={starBalance}
          previousBirthInfo={previousBirthInfo}
          isAdmin={isAdmin}
        />
      </SajuLayout>
    );
  }

  // readingId 파라미터가 있으면 해당 reading, 없으면 최신 reading
  let readingQuery = supabase
    .from("saju_readings")
    .select("*")
    .eq("user_id", user.id);

  if (readingIdParam) {
    readingQuery = readingQuery.eq("id", readingIdParam);
  } else {
    readingQuery = readingQuery.eq("character_id", characterId);
  }

  const { data: existingReading } = await readingQuery
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existingReading) {
    const typedReading = existingReading as SajuReading;
    const { data: chatMessages } = await getChatMessages(existingReading.id);

    const initialMessages: UIMessage[] = chatMessages.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: msg.content }],
    }));

    const readingInfo = {
      id: existingReading.id,
      characterId: characterId as CharacterType,
      name: typedReading.name,
      gender: typedReading.gender as 'male' | 'female',
      birthYear: typedReading.birth_year,
      birthMonth: typedReading.birth_month,
      birthDay: typedReading.birth_day,
      birthHour: typedReading.birth_hour,
      isLunar: typedReading.is_lunar,
      birthCity: typedReading.birth_city ?? undefined,
    };

    // 오행 분포 데이터
    const fiveElements = typedReading.five_elements ?? undefined;

    return (
      <SajuLayout currentReading={readingInfo}>
        <ChatRoom
          readingId={existingReading.id}
          characterId={characterId as CharacterType}
          initialMessages={initialMessages}
          starBalance={starBalance}
          fiveElements={fiveElements}
          isAdmin={isAdmin}
        />
      </SajuLayout>
    );
  }

  // 이 캐릭터용 reading은 없지만, 다른 캐릭터로 입력한 사주정보가 있을 수 있음
  const { data: anyReading } = await supabase
    .from("saju_readings")
    .select("name, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar, birth_city")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const previousBirthInfo = anyReading
    ? {
        name: anyReading.name as string,
        gender: anyReading.gender as "male" | "female",
        birthYear: anyReading.birth_year as number,
        birthMonth: anyReading.birth_month as number,
        birthDay: anyReading.birth_day as number,
        birthHour: anyReading.birth_hour as number | null,
        isLunar: anyReading.is_lunar as boolean,
        birthCity: (anyReading.birth_city as string) ?? undefined,
      }
    : undefined;

  return (
    <SajuLayout>
      <ChatRoom
        characterId={characterId as CharacterType}
        needsBirthInfo
        starBalance={starBalance}
        previousBirthInfo={previousBirthInfo}
      />
    </SajuLayout>
  );
}
