import { PADDLE_CONFIG } from './config';

/**
 * Paddle 웹훅 시그니처를 검증합니다.
 *
 * Paddle v2 웹훅은 `Paddle-Signature` 헤더를 통해
 * ts(타임스탬프)와 h1(HMAC-SHA256 시그니처)을 전달합니다.
 *
 * @see https://developer.paddle.com/webhooks/signature-verification
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): Promise<boolean> {
  const secret = PADDLE_CONFIG.webhookSecret;
  if (!secret) {
    console.error('[Paddle Webhook] PADDLE_WEBHOOK_SECRET이 설정되지 않았습니다.');
    return false;
  }

  try {
    // Paddle-Signature 헤더 파싱: "ts=1234567890;h1=abc123..."
    const parts = signature.split(';');
    const tsStr = parts.find((p) => p.startsWith('ts='))?.replace('ts=', '');
    const h1 = parts.find((p) => p.startsWith('h1='))?.replace('h1=', '');

    if (!tsStr || !h1) {
      console.error('[Paddle Webhook] 시그니처 형식이 올바르지 않습니다.');
      return false;
    }

    // 타임스탬프 검증 (5분 이내)
    const timestamp = parseInt(tsStr, 10);
    const now = Math.floor(Date.now() / 1000);
    const MAX_AGE_SECONDS = 5 * 60;

    if (Math.abs(now - timestamp) > MAX_AGE_SECONDS) {
      console.error('[Paddle Webhook] 타임스탬프가 너무 오래되었습니다.');
      return false;
    }

    // HMAC-SHA256 서명 검증
    const signedPayload = `${tsStr}:${rawBody}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload),
    );
    const computedHash = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return computedHash === h1;
  } catch (error) {
    console.error('[Paddle Webhook] 시그니처 검증 실패:', error);
    return false;
  }
}

/**
 * Paddle 웹훅 이벤트 타입
 */
export type PaddleWebhookEventType =
  | 'transaction.completed'
  | 'transaction.payment_failed'
  | 'subscription.activated'
  | 'subscription.canceled'
  | 'subscription.updated';

/**
 * Paddle 웹훅 페이로드 (필요한 필드만)
 */
export interface PaddleWebhookPayload {
  event_type: PaddleWebhookEventType;
  event_id: string;
  occurred_at: string;
  data: {
    id: string;                          // 트랜잭션 ID
    status: string;
    customer_id?: string;
    custom_data?: {
      userId?: string;
      productType?: string;
      readingId?: string;
    };
    items?: Array<{
      price: {
        id: string;
        product_id: string;
      };
      quantity: number;
    }>;
  };
}
