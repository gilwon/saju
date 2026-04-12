import {
  verifyWebhookSignature,
  type PaddleWebhookPayload,
} from '@/lib/paddle/webhook';
import { createAdminClient } from '@/utils/supabase/admin';

const CREDIT_MAP: Record<string, number> = {
  stars30: 30,
  stars70: 70,
  starsPremium: 250,
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('Paddle-Signature') || '';

  // 1. 시그니처 검증
  const isValid = await verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.error('[Paddle Webhook] 시그니처 검증 실패');
    return new Response('Invalid signature', { status: 401 });
  }

  // 2. 이벤트 파싱
  const event: PaddleWebhookPayload = JSON.parse(rawBody);

  // 3. transaction.completed만 처리
  if (event.event_type !== 'transaction.completed') {
    return new Response('ok', { status: 200 });
  }

  const supabase = createAdminClient();
  const { userId, productType } = event.data.custom_data || {};

  if (!userId || !productType || !CREDIT_MAP[productType]) {
    console.error('[Paddle Webhook] 필수 데이터 누락:', { userId, productType });
    return new Response('Missing required data', { status: 400 });
  }

  const credits = CREDIT_MAP[productType];

  // 4. RPC 호출 (멱등, atomic)
  const { data: rpcResult, error: rpcError } = await supabase
    .rpc('add_stars_idempotent', {
      p_user_id: userId,
      p_amount: credits,
      p_paddle_transaction_id: event.data.id,
      p_product_type: productType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

  if (rpcError) {
    console.error('[Paddle Webhook] RPC 실패:', rpcError);
    return new Response('DB update failed', { status: 500 });
  }

  const { new_balance, is_duplicate } = rpcResult[0];

  if (is_duplicate) {
    console.log(`[Paddle Webhook] 중복 처리 감지, 무시: ${event.data.id}`);
    return new Response('ok', { status: 200 });
  }

  console.log(`[Paddle Webhook] 별 ${credits}개 충전 완료: userId=${userId}, balance=${new_balance}`);
  return new Response('ok', { status: 200 });
}
