const KST_STANDARD_LONGITUDE = 127.5;

export function adjustToTrueSolarTime(
  hour: number,
  minute: number,
  longitude: number
): { hour: number; minute: number } {
  // 경도 1도 = 4분 차이
  const diffMinutes = (longitude - KST_STANDARD_LONGITUDE) * 4;

  let totalMinutes = hour * 60 + minute + Math.round(diffMinutes);

  // 24시간 범위로 정규화
  while (totalMinutes < 0) totalMinutes += 1440;
  while (totalMinutes >= 1440) totalMinutes -= 1440;

  return {
    hour: Math.floor(totalMinutes / 60),
    minute: totalMinutes % 60,
  };
}
