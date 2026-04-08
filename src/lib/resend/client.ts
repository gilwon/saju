import { Resend } from "resend";

// Lazy init: RESEND_API_KEY 없어도 빌드/런타임 에러 안 남
let _resend: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// 기존 코드 호환용 (사용하는 곳에서 null 체크 필요)
export const resend = undefined as unknown as Resend;
