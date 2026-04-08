const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * 추천 코드 생성: "SAJU" + 4자리 랜덤 영숫자
 */
export function generateReferralCode(): string {
  let code = "SAJU";
  for (let i = 0; i < 4; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}
