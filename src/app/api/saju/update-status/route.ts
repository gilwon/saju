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

// 클라이언트가 설정 가능한 status 목록 (paid/completed는 서버/결제 웹훅에서만 설정)
const ALLOWED_CLIENT_STATUSES = ['pending', 'preview'] as const;
type AllowedClientStatus = typeof ALLOWED_CLIENT_STATUSES[number];

export async function POST(req: NextRequest) {
  const { readingId, status } = await req.json();

  if (!readingId || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 허용된 status만 클라이언트에서 설정 가능 (paid/completed 등 결제 관련 status 우회 방지)
  if (!ALLOWED_CLIENT_STATUSES.includes(status as AllowedClientStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 게스트 소유권 검증을 위해 먼저 reading 조회
  if (!user) {
    const { data: reading } = await supabase
      .from('saju_readings')
      .select('user_id, guest_session_id')
      .eq('id', readingId)
      .single();

    if (reading) {
      if (reading.user_id !== null) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // guest_session_id 쿠키 검증 (null인 기존 레거시 reading은 관대하게 허용)
      const guestSessionId = req.cookies.get('guest_session_id')?.value;
      const readingGuestSessionId = (reading as Record<string, unknown>).guest_session_id as string | null;
      if (readingGuestSessionId !== null && readingGuestSessionId !== guestSessionId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  let query = supabase
    .from('saju_readings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', readingId);

  if (user) {
    // 로그인 유저: 자신의 reading만 수정 가능
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
