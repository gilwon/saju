import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { amount, readingId } = await req.json();

  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive integer' }, { status: 400 });
  }

  const supabase = await createClient();

  // 인증 확인 — body의 userId를 신뢰하지 않고 서버 세션에서 직접 획득
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  // RPC 호출 (atomic)
  const { data: rpcResult, error: rpcError } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .rpc('deduct_star', { p_user_id: userId, p_amount: amount }) as any;

  if (rpcError || !rpcResult?.[0]?.success) {
    return NextResponse.json({ error: 'Insufficient stars or deduction failed' }, { status: 400 });
  }

  const newBalance = rpcResult[0].new_balance;

  // 거래 이력 기록 (RPC에서 처리 안 하므로 여기서 직접)
  await supabase.from('star_transactions').insert({
    user_id: userId,
    amount: -amount,
    balance_after: newBalance,
    type: 'report',
    reading_id: readingId || null,
  });

  return NextResponse.json({ balance: newBalance });
}
