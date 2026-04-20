"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import type { SajuProfile, Gender } from "@/types/saju";

const profileInputSchema = z.object({
  name: z.string().min(1).max(50),
  gender: z.enum(["male", "female"]),
  birthYear: z.number().int().min(1900).max(2100),
  birthMonth: z.number().int().min(1).max(12),
  birthDay: z.number().int().min(1).max(31),
  birthHour: z.number().int().min(0).max(23).nullable(),
  isLunar: z.boolean(),
  isLeapMonth: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export async function getProfiles(): Promise<{
  data: SajuProfile[];
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from("saju_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return {
    data: (data ?? []) as SajuProfile[],
    error: error?.message ?? null,
  };
}

export async function createProfile(
  input: ProfileInput
): Promise<{ data: SajuProfile | null; error: string | null }> {
  const parsed = profileInputSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "로그인이 필요합니다." };

  const form = parsed.data;
  const { data, error } = await supabase
    .from("saju_profiles")
    .insert({
      user_id: user.id,
      name: form.name,
      gender: form.gender,
      birth_year: form.birthYear,
      birth_month: form.birthMonth,
      birth_day: form.birthDay,
      birth_hour: form.birthHour,
      is_lunar: form.isLunar,
      is_leap_month: form.isLeapMonth,
    })
    .select("*")
    .single();

  return {
    data: data as SajuProfile | null,
    error: error?.message ?? null,
  };
}

export async function updateProfile(
  id: string,
  input: ProfileInput
): Promise<{ error: string | null }> {
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return { error: "잘못된 ID입니다." };

  const parsed = profileInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const form = parsed.data;
  const { error } = await supabase
    .from("saju_profiles")
    .update({
      name: form.name,
      gender: form.gender,
      birth_year: form.birthYear,
      birth_month: form.birthMonth,
      birth_day: form.birthDay,
      birth_hour: form.birthHour,
      is_lunar: form.isLunar,
      is_leap_month: form.isLeapMonth,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  return { error: error?.message ?? null };
}

export async function deleteProfile(
  id: string
): Promise<{ error: string | null }> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { error: "잘못된 ID입니다." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("saju_profiles")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return { error: error?.message ?? null };
}
