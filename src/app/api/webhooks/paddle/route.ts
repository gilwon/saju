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

  // 4. user_stars 잔액 업데이트 (upsert)
  // 먼저 현재 잔액 조회
  const { data: existing } = await supabase
    .from('user_stars')
    .select('balance')
    .eq('user_id', userId)
    .single();

  const currentBalance = existing?.balance ?? 0;
  const newBalance = currentBalance + credits;

  if (existing) {
    const { error } = await supabase
      .from('user_stars')
      .update({ balance: newBalance })
      .eq('user_id', userId);

    if (error) {
      console.error('[Paddle Webhook] 잔액 업데이트 실패:', error);
      return new Response('DB update failed', { status: 500 });
    }
  } else {
    // 신규 유저 (가입 보너스 3 + 충전분)
    const { error } = await supabase
      .from('user_stars')
      .insert({ user_id: userId, balance: 3 + credits });

    if (error) {
      console.error('[Paddle Webhook] 유저 생성 실패:', error);
      return new Response('DB insert failed', { status: 500 });
    }
  }

  // 5. 거래 이력 기록
  await supabase.from('star_transactions').insert({
    user_id: userId,
    amount: credits,
    balance_after: existing ? newBalance : 3 + credits,
    type: 'purchase',
    paddle_transaction_id: event.data.id,
    product_type: productType,
  });

  console.log(`[Paddle Webhook] 별 ${credits}개 충전 완료: userId=${userId}`);
  return new Response('ok', { status: 200 });
}
