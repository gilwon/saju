"use client";

import { useEffect } from "react";
import { getAllGuestReadingIds, clearGuestReadings } from "@/utils/guest-session";
import { migrateGuestReadings } from "@/services/saju/actions";

/** 로그인 직후 게스트 readings를 현재 계정으로 연결합니다. */
export default function GuestMigrator({ isLoggedIn }: { isLoggedIn: boolean }) {
  useEffect(() => {
    if (!isLoggedIn) return;
    const ids = getAllGuestReadingIds();
    if (!ids.length) return;
    migrateGuestReadings(ids).then(({ error }) => {
      if (!error) clearGuestReadings();
    });
  }, [isLoggedIn]);

  return null;
}
