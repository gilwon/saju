const GUEST_READING_PREFIX = "guest_reading_";

function getGuestKeys(): string[] {
  return Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i) ?? "")
    .filter((key) => key.startsWith(GUEST_READING_PREFIX));
}

export function getGuestReadingId(characterId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${GUEST_READING_PREFIX}${characterId}`);
}

export function setGuestReadingId(characterId: string, readingId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${GUEST_READING_PREFIX}${characterId}`, readingId);
}

export function getAllGuestReadingIds(): string[] {
  if (typeof window === "undefined") return [];
  return getGuestKeys()
    .map((key) => localStorage.getItem(key) ?? "")
    .filter(Boolean);
}

/** 로그인 후 마이그레이션 완료 시 호출합니다. */
export function clearGuestReadings(): void {
  if (typeof window === "undefined") return;
  getGuestKeys().forEach((key) => localStorage.removeItem(key));
}
