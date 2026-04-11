"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import type { ChatMessage, CharacterType } from "@/types/saju";

const readingIdSchema = z.string().uuid();
const characterSchema = z.enum(["charon_m", "charon_f", "doctor", "minjun", "haeun", "jian", "seojun", "doyun"]);

/**
 * reading에 birth_city와 character_id를 업데이트합니다.
 */
export async function updateReadingMeta(
  readingId: string,
  meta: { birthCity?: string; characterId?: CharacterType; title?: string }
): Promise<{ error: string | null }> {
  const parsedId = readingIdSchema.safeParse(readingId);
  if (!parsedId.success) {
    return { error: "Invalid reading ID" };
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (meta.birthCity !== undefined) {
    updateData.birth_city = meta.birthCity;
  }
  if (meta.characterId !== undefined) {
    const parsed = characterSchema.safeParse(meta.characterId);
    if (!parsed.success) return { error: "Invalid character ID" };
    updateData.character_id = meta.characterId;
  }
  if (meta.title !== undefined) {
    updateData.title = meta.title;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("saju_readings")
    .update(updateData)
    .eq("id", readingId);

  return { error: error?.message ?? null };
}

/**
 * 채팅 이력 조회
 */
export async function getChatMessages(
  readingId: string
): Promise<{ data: ChatMessage[]; error: string | null }> {
  const parsed = readingIdSchema.safeParse(readingId);
  if (!parsed.success) {
    return { data: [], error: "Invalid reading ID" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_chat_messages")
    .select("*")
    .eq("reading_id", readingId)
    .order("created_at", { ascending: true });

  return {
    data: (data ?? []) as ChatMessage[],
    error: error?.message ?? null,
  };
}

/**
 * 메시지 저장
 */
export async function saveChatMessage(
  readingId: string,
  role: "user" | "assistant",
  content: string,
  characterId: CharacterType
): Promise<{ data: ChatMessage | null; error: string | null }> {
  const parsed = readingIdSchema.safeParse(readingId);
  if (!parsed.success) {
    return { data: null, error: "Invalid reading ID" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_chat_messages")
    .insert({
      reading_id: readingId,
      role,
      content,
      character_id: characterId,
    })
    .select("*")
    .single();

  return {
    data: data as ChatMessage | null,
    error: error?.message ?? null,
  };
}

/**
 * 크레딧 조회
 */
export async function getChatCredits(
  readingId: string
): Promise<{
  data: { chat_credits: number; chat_used: number } | null;
  error: string | null;
}> {
  const parsed = readingIdSchema.safeParse(readingId);
  if (!parsed.success) {
    return { data: null, error: "Invalid reading ID" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saju_readings")
    .select("chat_credits, chat_used")
    .eq("id", readingId)
    .single();

  return {
    data: data as { chat_credits: number; chat_used: number } | null,
    error: error?.message ?? null,
  };
}

/**
 * 크레딧 추가 (결제 후)
 */
export async function addChatCredits(
  readingId: string,
  amount: number
): Promise<{ error: string | null }> {
  const parsed = readingIdSchema.safeParse(readingId);
  if (!parsed.success) {
    return { error: "Invalid reading ID" };
  }

  if (amount <= 0) {
    return { error: "Amount must be positive" };
  }

  const supabase = await createClient();

  // 현재 크레딧 조회
  const { data: reading, error: readError } = await supabase
    .from("saju_readings")
    .select("chat_credits")
    .eq("id", readingId)
    .single();

  if (readError || !reading) {
    return { error: readError?.message ?? "Reading not found" };
  }

  const { error } = await supabase
    .from("saju_readings")
    .update({
      chat_credits: reading.chat_credits + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", readingId);

  return { error: error?.message ?? null };
}

/**
 * reading과 관련 채팅 메시지를 삭제합니다. (사주정보 수정 시)
 */
export async function deleteReading(
  readingId: string
): Promise<{ error: string | null }> {
  const parsed = readingIdSchema.safeParse(readingId);
  if (!parsed.success) {
    return { error: "Invalid reading ID" };
  }

  const supabase = await createClient();

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  // 소유권 확인 (일반 클라이언트 = RLS 적용)
  const { data: reading } = await supabase
    .from("saju_readings")
    .select("id")
    .eq("id", readingId)
    .eq("user_id", user.id)
    .single();

  if (!reading) {
    return { error: "Reading not found or access denied" };
  }

  await supabase
    .from("saju_chat_messages")
    .delete()
    .eq("reading_id", readingId);

  const { error } = await supabase
    .from("saju_readings")
    .delete()
    .eq("id", readingId)
    .eq("user_id", user.id);

  return { error: error?.message ?? null };
}
