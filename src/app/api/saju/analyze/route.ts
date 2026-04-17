import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { buildSajuAnalysisPrompt, parseAIResponse } from '@/lib/saju/prompts';
import { generateAdvancedSajuContext } from '@/lib/saju/advanced-analysis';
import { createFallbackResponse } from '@/lib/ai/model';
import type { FourPillarsDetail } from 'manseryeok';
import type {
  FiveElementDistribution,
  Gender,
  ConcernType,
  SajuAnalysis,
} from '@/types/saju';

export async function POST(req: NextRequest) {
  let readingId: string | undefined;
  const supabase = await createClient();

  try {
    const body = await req.json();
    readingId = body.readingId;

    if (!readingId) {
      return NextResponse.json(
        { error: 'readingId is required' },
        { status: 400 },
      );
    }

    // reading 조회
    const { data: reading, error: readError } = await supabase
      .from('saju_readings')
      .select('*')
      .eq('id', readingId)
      .single();

    if (readError || !reading) {
      return NextResponse.json(
        { error: 'Reading not found' },
        { status: 404 },
      );
    }

    // 소유권 확인 (status 변경 전에 수행)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      // 로그인 유저: 자신의 reading인지 확인
      if (reading.user_id !== authUser.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // 게스트: user_id가 null이어야 함
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

    // 결제 확인
    if (reading.status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment required. Current status: ' + reading.status },
        { status: 403 },
      );
    }

    // status를 generating으로 변경
    await supabase
      .from('saju_readings')
      .update({ status: 'generating', updated_at: new Date().toISOString() })
      .eq('id', readingId);

    if (!reading.four_pillars || !reading.five_elements) {
      return NextResponse.json(
        { error: 'Saju data not found. Run preview first.' },
        { status: 400 },
      );
    }

    const currentYear = new Date().getFullYear();

    // 자미두수 + 별자리 고급 분석 데이터 계산
    let advancedContext = '';
    try {
      advancedContext = await generateAdvancedSajuContext(
        reading.birth_year,
        reading.birth_month,
        reading.birth_day,
        reading.birth_hour,
        reading.gender as 'male' | 'female',
      );
    } catch {
      // 고급 분석 실패 시 기본 데이터만 사용
    }

    const { system, user } = buildSajuAnalysisPrompt({
      name: reading.name,
      gender: reading.gender as Gender,
      birthYear: reading.birth_year,
      birthMonth: reading.birth_month,
      birthDay: reading.birth_day,
      birthHour: reading.birth_hour,
      pillars: reading.four_pillars as unknown as FourPillarsDetail,
      elements: reading.five_elements as FiveElementDistribution,
      concerns: (reading.concerns ?? []) as ConcernType[],
      currentYear,
      advancedContext,
    });

    // 클로저에서 사용할 변수 캡처
    const capturedReadingId = readingId;
    const capturedSupabase = supabase;

    // Google Gemini → Groq 자동 폴백 스트리밍
    return await createFallbackResponse({
      system,
      prompt: user,
      maxOutputTokens: 12000,
      temperature: 0.7,
      onFinishText: async (text) => {
        try {
          const analysis = parseAIResponse<SajuAnalysis>(text);
          await capturedSupabase
            .from('saju_readings')
            .update({
              full_analysis: analysis as unknown as Record<string, unknown>,
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', capturedReadingId);
        } catch (err) {
          console.error('[saju/analyze] onFinish 저장 실패:', err);
          await capturedSupabase
            .from('saju_readings')
            .update({ status: 'failed', updated_at: new Date().toISOString() })
            .eq('id', capturedReadingId);
        }
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[saju/analyze] Error:', message);

    if (readingId) {
      try {
        await supabase
          .from('saju_readings')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', readingId);
      } catch {
        // ignore cleanup error
      }
    }

    return NextResponse.json(
      { error: message || 'Internal server error' },
      { status: 500 },
    );
  }
}
