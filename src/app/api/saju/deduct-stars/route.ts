import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { userId, amount, readingId } = await req.json();

  if (!userId || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createClient();

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 잔액 조회
  const { data: stars } = await supabase
    .from('user_stars')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (!stars || stars.balance < amount) {
    return NextResponse.json({ error: 'Insufficient stars' }, { status: 400 });
  }

  const newBalance = stars.balance - amount;

  // 잔액 차감
  const { error: updateError } = await supabase
    .from('user_stars')
    .update({ balance: newBalance })
    .eq('user_id', userId);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to deduct stars' }, { status: 500 });
  }

  // 거래 이력 기록
  await supabase.from('star_transactions').insert({
    user_id: userId,
    amount: -amount,
    balance_after: newBalance,
    type: 'report',
    reading_id: readingId || null,
  });

  return NextResponse.json({ balance: newBalance });
}
