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
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('saju_readings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', readingId);

  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    query = query.is('user_id', null);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
