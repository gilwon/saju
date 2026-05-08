import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getServerUser } from "@/utils/supabase/get-user";
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

function buildReadingInfo(reading: SajuReading, characterId: CharacterType) {
  return {
    id: reading.id,
    characterId,
    name: reading.name,
    gender: reading.gender as "male" | "female",
    birthYear: reading.birth_year,
    birthMonth: reading.birth_month,
    birthDay: reading.birth_day,
    birthHour: reading.birth_hour,
    isLunar: reading.is_lunar,
    birthCity: reading.birth_city ?? undefined,
  };
}

function buildInitialMessages(
  chatMessages: { id: string; role: string; content: string }[]
): UIMessage[] {
  return chatMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: msg.content }],
  }));
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const { characterId, locale } = await params;
  const { r: readingIdParam, new: isNewChat } = await searchParams;

  if (!CHARACTERS[characterId as CharacterType]) {
    redirect(`/${locale}`);
  }

  const [user, supabase] = await Promise.all([
    getServerUser(),
    createClient(),
  ]);

  const starBalance = 99999;

  // 비회원(게스트) 플로우
  if (!user) {
    if (readingIdParam && isNewChat !== "true") {
      const cookieStore = await cookies();
      const guestSessionId = cookieStore.get("guest_session_id")?.value;

      const { data: guestReading } = await supabase
        .from("saju_readings")
        .select("*")
        .eq("id", readingIdParam)
        .is("user_id", null)
        .single();

      if (guestReading) {
        // 게스트 소유권 검증: guest_session_id 쿠키가 일치해야 함
        const readingGuestSessionId = (guestReading as Record<string, unknown>).guest_session_id as string | null;
        if (readingGuestSessionId !== null && readingGuestSessionId !== guestSessionId) {
          redirect(`/${locale}`);
        }

        const typedReading = guestReading as SajuReading;
        const { data: chatMessages } = await getChatMessages(guestReading.id);
        const readingInfo = buildReadingInfo(typedReading, characterId as CharacterType);

        return (
          <SajuLayout currentReading={readingInfo}>
            <ChatRoom
              readingId={guestReading.id}
              characterId={characterId as CharacterType}
              initialMessages={buildInitialMessages(chatMessages)}
              starBalance={starBalance}
              fiveElements={typedReading.five_elements ?? undefined}
            />
          </SajuLayout>
        );
      }
    }

    return (
      <SajuLayout>
        <ChatRoom
          characterId={characterId as CharacterType}
          needsBirthInfo
          starBalance={starBalance}
        />
      </SajuLayout>
    );
  }

  // 회원 플로우
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);
  const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;

  if (isNewChat === "true") {
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
    const readingInfo = buildReadingInfo(typedReading, characterId as CharacterType);

    return (
      <SajuLayout currentReading={readingInfo}>
        <ChatRoom
          readingId={existingReading.id}
          characterId={characterId as CharacterType}
          initialMessages={buildInitialMessages(chatMessages)}
          starBalance={starBalance}
          fiveElements={typedReading.five_elements ?? undefined}
          isAdmin={isAdmin}
        />
      </SajuLayout>
    );
  }

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
