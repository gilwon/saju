import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { analyzeSaju } from '@/lib/saju/calculator';
import { generateCompatibility } from '@/lib/saju/ai/analyzer';
import type { FourPillarsDetail } from 'manseryeok';
import type {
  FiveElementDistribution,
  Gender,
} from '@/types/saju';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { compatibilityId } = body;

    if (!compatibilityId) {
      return NextResponse.json(
        { error: 'compatibilityId is required' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 궁합 레코드 조회
    const { data: compat, error: compatError } = await supabase
      .from('saju_compatibility')
      .select('*')
      .eq('id', compatibilityId)
      .single();

    if (compatError || !compat) {
      return NextResponse.json(
        { error: 'Compatibility record not found' },
        { status: 404 },
      );
    }

    // 결제 확인
    if (compat.status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment required. Current status: ' + compat.status },
        { status: 403 },
      );
    }

    // 본인 사주 reading 조회
    const { data: reading, error: readError } = await supabase
      .from('saju_readings')
      .select('*')
      .eq('id', compat.reading_id)
      .single();

    if (readError || !reading) {
      return NextResponse.json(
        { error: 'Original reading not found' },
        { status: 404 },
      );
    }

    // status를 generating으로 변경
    await supabase
      .from('saju_compatibility')
      .update({ status: 'generating', updated_at: new Date().toISOString() })
      .eq('id', compatibilityId);

    // 상대방 사주 계산
    const partnerSaju = analyzeSaju({
      year: compat.partner_birth_year,
      month: compat.partner_birth_month,
      day: compat.partner_birth_day,
      hour: compat.partner_birth_hour ?? undefined,
      minute: compat.partner_birth_minute,
      isLunar: compat.partner_is_lunar,
      isLeapMonth: compat.partner_is_leap_month,
    });

    // 본인 사주 데이터
    if (!reading.four_pillars || !reading.five_elements) {
      return NextResponse.json(
        { error: 'Original saju data not found. Run preview first.' },
        { status: 400 },
      );
    }

    // AI 궁합 분석 생성
    const analysis = await generateCompatibility({
      person1: {
        name: reading.name,
        gender: reading.gender as Gender,
        pillars: reading.four_pillars as unknown as FourPillarsDetail,
        elements: reading.five_elements as FiveElementDistribution,
      },
      person2: {
        name: compat.partner_name,
        gender: compat.partner_gender as Gender,
        pillars: partnerSaju.pillars,
        elements: partnerSaju.elements,
      },
    });

    // DB 업데이트
    const { error: updateError } = await supabase
      .from('saju_compatibility')
      .update({
        partner_four_pillars: partnerSaju.pillars.toObject(),
        partner_five_elements: partnerSaju.elements,
        analysis: analysis as unknown as Record<string, unknown>,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', compatibilityId);

    if (updateError) {
      await supabase
        .from('saju_compatibility')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', compatibilityId);

      return NextResponse.json(
        { error: 'Failed to save compatibility analysis' },
        { status: 500 },
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('[saju/compatibility] Error:', error);

    // 실패 시 status 복구
    try {
      const body = await req.clone().json();
      if (body.compatibilityId) {
        const supabase = await createClient();
        await supabase
          .from('saju_compatibility')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', body.compatibilityId);
      }
    } catch {
      // ignore cleanup error
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
