import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * 요청 단위로 캐싱되는 서버 사용자 조회.
 * layout + page 등 동일 요청 내 여러 Server Component에서 호출해도
 * Supabase Auth 네트워크 호출은 1회만 발생합니다.
 */
export const getServerUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
