const GUEST_READING_PREFIX = "guest_reading_";

/** 특정 캐릭터의 게스트 readingId를 localStorage에서 가져옵니다. */
export function getGuestReadingId(characterId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${GUEST_READING_PREFIX}${characterId}`);
}

/** 특정 캐릭터의 게스트 readingId를 localStorage에 저장합니다. */
export function setGuestReadingId(characterId: string, readingId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${GUEST_READING_PREFIX}${characterId}`, readingId);
}

/** 저장된 모든 게스트 readingId 목록을 반환합니다. */
export function getAllGuestReadingIds(): string[] {
  if (typeof window === "undefined") return [];
  const ids: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(GUEST_READING_PREFIX)) {
      const val = localStorage.getItem(key);
      if (val) ids.push(val);
    }
  }
  return ids;
}

/** 로그인 후 마이그레이션 완료 시 게스트 데이터를 삭제합니다. */
export function clearGuestReadings(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(GUEST_READING_PREFIX)) keys.push(key);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
