import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { analyzeSaju } from '@/lib/saju/calculator';
import { generatePreview } from '@/lib/saju/ai/analyzer';
import type { Gender } from '@/types/saju';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { readingId } = body;

    if (!readingId) {
      return NextResponse.json(
        { error: 'readingId is required' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

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

    // 만세력 계산
    const { pillars, elements } = analyzeSaju({
      year: reading.birth_year,
      month: reading.birth_month,
      day: reading.birth_day,
      hour: reading.birth_hour ?? undefined,
      minute: reading.birth_minute ?? 0,
      isLunar: reading.is_lunar,
      isLeapMonth: reading.is_leap_month,
    });

    // AI 미리보기 생성
    const previewText = await generatePreview({
      pillars,
      elements,
      gender: reading.gender as Gender,
    });

    // DB 업데이트
    const { error: updateError } = await supabase
      .from('saju_readings')
      .update({
        four_pillars: pillars.toObject(),
        five_elements: elements,
        preview_summary: previewText,
        status: 'preview',
        updated_at: new Date().toISOString(),
      })
      .eq('id', readingId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update reading' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      pillars: pillars.toObject(),
      elements,
      previewText,
    });
  } catch (error) {
    console.error('[saju/preview] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
