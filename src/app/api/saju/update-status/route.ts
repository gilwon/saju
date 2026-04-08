import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const readingId = req.nextUrl.searchParams.get('readingId');
  if (!readingId) {
    return NextResponse.json({ error: 'Missing readingId' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('saju_readings')
    .select('status')
    .eq('id', readingId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
  }

  return NextResponse.json({ status: data.status });
}

export async function POST(req: NextRequest) {
  const { readingId, status } = await req.json();

  if (!readingId || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createClient();

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('saju_readings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', readingId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
