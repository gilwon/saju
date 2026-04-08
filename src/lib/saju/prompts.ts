import type { FourPillarsDetail } from 'manseryeok';
import type {
  FiveElementDistribution,
  ConcernType,
  Gender,
} from '@/types/saju';
import { extractSajuSummary, getElementStrength } from './calculator';
import { CONCERN_LABELS } from '@/types/saju';

// ─── 사주 분석 프롬프트 ───

/**
 * 종합 사주분석 시스템 프롬프트를 생성합니다.
 */
export function buildSajuAnalysisPrompt(params: {
  name: string;
  gender: Gender;
  birthYear: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number | null;
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
  concerns: ConcernType[];
  currentYear: number;
  advancedContext?: string;
}): { system: string; user: string } {
  const { name, gender, birthYear, birthMonth, birthDay, birthHour, pillars, elements, concerns, currentYear, advancedContext } =
    params;

  const summary = extractSajuSummary(pillars, elements);
  const strength = getElementStrength(elements);
  const age = currentYear - birthYear + 1; // 한국 나이
  const genderLabel = gender === 'male' ? '남성' : '여성';
  const concernLabels = concerns.map((c) => CONCERN_LABELS[c]).join(', ');

  // 고민에 따른 상세 분석 지시
  const concernInstructions = concerns
    .map((c) => {
      switch (c) {
        case 'love':
          return '- "love": 연애운, 이상형, 결혼 시기, 배우자 성향을 상세히 분석하세요.';
        case 'career':
          return '- "career": 적성, 추천 직업/업종, 승진/이직 시기, 사업운을 상세히 분석하세요.';
        case 'wealth':
          return '- "wealth": 재물운, 돈 관리 성향, 투자 성향, 재물이 들어오는 시기를 상세히 분석하세요.';
        case 'health':
          return '- "health": 취약 장기, 주의할 질병, 건강 관리 방법을 상세히 분석하세요.';
        case 'relationship':
          return '- "love"와 별개로 "personality" 및 각 섹션에서 대인관계, 사회성, 인간관계 패턴을 상세히 분석하세요.';
        case 'other':
          return '- 전체적인 운세를 균형 있게 분석하세요.';
      }
    })
    .join('\n');

  const system = `당신은 30년 경력의 한국 전통 사주명리학 전문가입니다.
주어진 사주 데이터를 바탕으로 정확하고 구체적인 분석을 제공합니다.

## 분석 원칙
1. 사주명리학뿐 아니라, 자미두수(紫微斗數)와 서양 점성술(별자리)의 관점도 통합하여 분석하세요.
2. 사주 데이터(사주팔자, 오행 분포, 일간)를 근거로 분석하세요.
3. 긍정적인 면과 주의할 점을 균형 있게 서술하세요.
4. 추상적인 표현보다 구체적이고 실용적인 조언을 제공하세요.
5. 한국어 존칭을 사용하고, 따뜻하고 격려하는 톤을 유지하세요.
6. 각 섹션은 최소 500자, 최대 1500자로 충분히 깊이 있게 작성하세요. 많은 내용을 담아주세요.
7. 미신적 공포감을 주는 표현은 피하세요.
8. 반드시 분석 대상의 이름을 사용하여 호칭하세요 (예: "${name}님"). "남성분", "여성분" 같은 표현은 절대 사용하지 마세요.
9. 월별 운세도 각 월마다 최소 100자 이상 구체적으로 작성하세요.
10. 절대 추측하지 마세요. "~가능성이 높다", "~일 수 있다", "~에 해당할 수 있습니다" 같은 불확실한 표현 금지. 제공된 데이터를 기반으로 단정적으로 분석하세요. 별자리, 자미두수 데이터가 제공되면 그것을 정확히 사용하고, 생년월일로부터 직접 확정하세요.

## 고민 분야별 상세 분석 지시
사용자가 관심을 표시한 분야는 다른 섹션보다 2배 이상 상세하게 작성하세요:
${concernInstructions}

## 작성 지침
- "personality" 섹션 첫 문장에 반드시 "${name}님"으로 시작하고, 일주 이름(예: "갑자일주", "임인일주")을 명시하여 일주의 특성을 설명하세요.
- 각 섹션에서 사주 용어(일간, 일주, 편재, 정관, 식신 등)를 자연스럽게 활용하세요.
- 오행 균형/불균형에 따른 구체적인 조언을 포함하세요.
- "tenGods" 섹션에서는 일간 기준 십신(비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인)의 배치를 분석하고 의미를 설명하세요.
- "majorCycles" 섹션에서는 10년 대운 흐름과 현재 대운의 영향, 향후 10-20년 운세 방향을 분석하세요.
- "relationship" 섹션에서는 대인관계 패턴, 사회성, 직장 내 관계, 가족 관계를 상세히 분석하세요.
- "actionAdvice" 섹션에서는 올해 실천하면 좋을 구체적인 조언, 피해야 할 것, 행운을 부르는 습관 등을 실용적으로 안내하세요.

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 포함하지 마세요.

\`\`\`json
{
  "personality": "${name}님으로 시작. 일주(日柱) 이름과 특성, 사주명리학 기반 성격 분석 + 자미두수 관점의 성격 보완 + 별자리 관점의 성격 분석. (500-1500자)",
  "tenGods": "십신(十神) 배치 분석. 비견/겁재/식신/상관/편재/정재/편관/정관/편인/정인 중 어떤 것이 강하고 약한지, 그것이 삶에 미치는 영향. (500-1000자)",
  "love": "연애/결혼운 분석. 사주명리학 + 자미두수 부부궁 관점. 이상형, 결혼 시기, 배우자 성향, 연애 패턴. (500-1500자)",
  "career": "직업/진로 분석. 적성, 추천 직업/업종, 승진/이직 시기, 사업운. 자미두수 관록궁 참고. (500-1500자)",
  "wealth": "재물/금전운 분석. 돈 관리 성향, 투자 성향, 재물이 들어오는 시기. 자미두수 재백궁 참고. (500-1500자)",
  "health": "건강 분석. 취약 장기, 주의할 질병, 오행 기반 건강 관리법. 자미두수 질액궁 참고. (500-1000자)",
  "relationship": "대인관계·사회운. 직장/사회에서의 관계 패턴, 귀인운, 소인운, 가족 관계. (500-1000자)",
  "majorCycles": "대운(大運) 흐름. 과거 10년 회고, 현재 대운 분석, 향후 10-20년 운세 방향성과 전환점. (500-1000자)",
  "yearlyFortune": "${currentYear}년 올해의 운세. 전반적 흐름, 상반기/하반기 차이, 주의할 시기, 기회가 오는 시기. (500-1500자)",
  "monthlyFortune": [
    { "month": 1, "fortune": "1월 운세 (100자 이상, 구체적 조언 포함)" },
    { "month": 2, "fortune": "2월 운세" },
    ...
    { "month": 12, "fortune": "12월 운세" }
  ],
  "luckyElements": {
    "color": "행운의 색상 (2-3가지, 이유 포함)",
    "direction": "행운의 방향 (이유 포함)",
    "number": "행운의 숫자 (2-3개, 이유 포함)"
  },
  "actionAdvice": "올해의 실천 조언. 꼭 해야 할 것 3가지, 피해야 할 것 3가지, 행운을 부르는 구체적 습관과 방법. (500-1000자)",
  "summary": "전체 사주를 종합 요약 (200-400자)"
}
\`\`\``;

  const birthDateStr = birthMonth && birthDay
    ? `${birthYear}년 ${birthMonth}월 ${birthDay}일`
    : `${birthYear}년`;
  const birthTimeStr = birthHour != null
    ? (() => {
        const sijiMap: Record<number, string> = {
          23: '자시(子時)', 0: '자시(子時)', 1: '축시(丑時)', 2: '축시(丑時)',
          3: '인시(寅時)', 4: '인시(寅時)', 5: '묘시(卯時)', 6: '묘시(卯時)',
          7: '진시(辰時)', 8: '진시(辰時)', 9: '사시(巳時)', 10: '사시(巳時)',
          11: '오시(午時)', 12: '오시(午時)', 13: '미시(未時)', 14: '미시(未時)',
          15: '신시(申時)', 16: '신시(申時)', 17: '유시(酉時)', 18: '유시(酉時)',
          19: '술시(戌時)', 20: '술시(戌時)', 21: '해시(亥時)', 22: '해시(亥時)',
        };
        return sijiMap[birthHour] ?? `${birthHour}시`;
      })()
    : '시간 미상';

  const user = `## 분석 대상 정보
- 이름: ${name}
- 성별: ${genderLabel}
- 생년월일: ${birthDateStr} ${birthTimeStr}
- 나이: 만 ${currentYear - birthYear}세, 한국 나이 ${age}세
- 관심 분야: ${concernLabels}

## 사주 데이터
- 사주팔자 (한글): ${summary.fourPillars.korean}
- 사주팔자 (한자): ${summary.fourPillars.hanja}
- 일간 (Day Master): ${summary.dayMaster.stem} (${summary.dayMaster.element})
- 성격 키워드: ${summary.personalityKeywords.join(', ')}

## 오행 분포 (총 8글자)
- 목(木): ${elements.wood}개
- 화(火): ${elements.fire}개
- 토(土): ${elements.earth}개
- 금(金): ${elements.metal}개
- 수(水): ${elements.water}개
- 가장 강한 오행: ${strength.strongest}
- 가장 약한 오행: ${strength.weakest}
- 균형 상태: ${strength.balance}

## 사주 기둥 상세
- 연주: ${summary.fourPillars.detail.year.heavenlyStem}${summary.fourPillars.detail.year.earthlyBranch}
- 월주: ${summary.fourPillars.detail.month.heavenlyStem}${summary.fourPillars.detail.month.earthlyBranch}
- 일주: ${summary.fourPillars.detail.day.heavenlyStem}${summary.fourPillars.detail.day.earthlyBranch}
- 시주: ${summary.fourPillars.detail.hour.heavenlyStem}${summary.fourPillars.detail.hour.earthlyBranch}

${advancedContext ? `## 자미두수 · 별자리 분석 데이터 (계산 완료, 그대로 사용할 것)\n${advancedContext}` : ''}

위 데이터를 바탕으로 ${currentYear}년 종합 사주분석을 JSON으로 작성해주세요. 제공된 데이터는 모두 계산 완료된 확정 값입니다. 추측하지 말고 데이터를 그대로 인용하여 분석하세요.`;

  return { system, user };
}

// ─── 미리보기 프롬프트 (무료, 짧은 요약) ───

/**
 * 무료 미리보기용 짧은 분석 프롬프트를 생성합니다.
 */
export function buildPreviewPrompt(params: {
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
  gender: Gender;
}): { system: string; user: string } {
  const { pillars, elements, gender } = params;
  const summary = extractSajuSummary(pillars, elements);
  const genderLabel = gender === 'male' ? '남성' : '여성';

  const system = `당신은 한국 전통 사주명리학 전문가입니다.
주어진 사주 데이터를 바탕으로 핵심 성격과 올해의 운세를 2-3문장으로 매우 간결하게 요약하세요.
흥미를 끌 수 있도록 작성하되, 전체 분석은 유료 서비스에서 확인할 수 있다는 뉘앙스를 담으세요.
순수 텍스트로만 응답하세요 (JSON 아님). 150자 이내.`;

  const user = `성별: ${genderLabel}
사주: ${summary.fourPillars.korean}
일간: ${summary.dayMaster.stem} (${summary.dayMaster.element})
오행 밸런스: ${summary.elementStrength.balance}
가장 강한 오행: ${summary.elementStrength.strongest}`;

  return { system, user };
}

// ─── 궁합 분석 프롬프트 ───

/**
 * 궁합 분석 프롬프트를 생성합니다.
 */
export function buildCompatibilityPrompt(params: {
  person1: {
    name: string;
    gender: Gender;
    pillars: FourPillarsDetail;
    elements: FiveElementDistribution;
  };
  person2: {
    name: string;
    gender: Gender;
    pillars: FourPillarsDetail;
    elements: FiveElementDistribution;
  };
}): { system: string; user: string } {
  const { person1, person2 } = params;
  const summary1 = extractSajuSummary(person1.pillars, person1.elements);
  const summary2 = extractSajuSummary(person2.pillars, person2.elements);

  const system = `당신은 30년 경력의 한국 전통 사주명리학 궁합 전문가입니다.
두 사람의 사주 데이터를 바탕으로 궁합을 분석합니다.

## 분석 원칙
1. 일간(日干) 관계, 오행 상생/상극을 기반으로 분석하세요.
2. 긍정적인 면을 먼저 서술하고, 주의할 점도 균형 있게 다루세요.
3. 구체적이고 실용적인 관계 조언을 제공하세요.
4. 점수는 50-95 사이에서 합리적으로 매기세요.

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요.

\`\`\`json
{
  "score": 85,
  "summary": "궁합 종합 요약 (200-300자)",
  "strengths": ["강점 1", "강점 2", "강점 3"],
  "challenges": ["도전 1", "도전 2"],
  "advice": "관계를 더 좋게 만들기 위한 조언 (200-300자)"
}
\`\`\``;

  const user = `## 첫 번째 사람: ${person1.name} (${person1.gender === 'male' ? '남성' : '여성'})
- 사주: ${summary1.fourPillars.korean} (${summary1.fourPillars.hanja})
- 일간: ${summary1.dayMaster.stem} (${summary1.dayMaster.element})
- 오행: 목${person1.elements.wood} 화${person1.elements.fire} 토${person1.elements.earth} 금${person1.elements.metal} 수${person1.elements.water}

## 두 번째 사람: ${person2.name} (${person2.gender === 'male' ? '남성' : '여성'})
- 사주: ${summary2.fourPillars.korean} (${summary2.fourPillars.hanja})
- 일간: ${summary2.dayMaster.stem} (${summary2.dayMaster.element})
- 오행: 목${person2.elements.wood} 화${person2.elements.fire} 토${person2.elements.earth} 금${person2.elements.metal} 수${person2.elements.water}

두 사람의 궁합을 JSON으로 분석해주세요.`;

  return { system, user };
}

// ─── AI 응답 파싱 유틸 ───

/**
 * JSON 문자열 값 내부의 리터럴 제어 문자를 이스케이프합니다.
 * AI가 JSON string 안에 줄바꿈(\n), 탭(\t) 등을 그대로 출력할 때 발생하는
 * "Bad control character in string literal" 오류를 방지합니다.
 */
export function sanitizeJsonControlChars(json: string): string {
  let inString = false;
  let escaped = false;
  let result = '';

  for (let i = 0; i < json.length; i++) {
    const char = json[i];

    if (escaped) {
      escaped = false;
      result += char;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
      result += char;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString && char.charCodeAt(0) < 0x20) {
      switch (char) {
        case '\n': result += '\\n'; break;
        case '\r': result += '\\r'; break;
        case '\t': result += '\\t'; break;
        case '\b': result += '\\b'; break;
        case '\f': result += '\\f'; break;
        // 그 외 제어 문자는 제거
      }
      continue;
    }

    result += char;
  }

  return result;
}

/**
 * AI 응답에서 JSON을 추출합니다.
 * 코드블록(```json ... ```) 안의 JSON이나 순수 JSON 모두 처리합니다.
 */
export function parseAIResponse<T>(response: string): T {
  let jsonStr = response.trim();

  // 1) 완전한 코드블록: ```[json]\n...\n```
  const fullBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fullBlock) {
    jsonStr = fullBlock[1].trim();
  } else {
    // 2) 시작 마커만 있는 경우 (응답 중간 잘림)
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  }

  // 3) JSON 객체/배열 경계만 추출 (앞뒤 여분 텍스트 제거)
  const objMatch = jsonStr.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (objMatch) jsonStr = objMatch[1];

  // 4) JSON 문자열 값 내 리터럴 제어 문자 이스케이프
  jsonStr = sanitizeJsonControlChars(jsonStr);

  // 5) trailing comma 제거: }, ] 또는 }, } 패턴
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

  try {
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    throw new Error(
      `AI 응답 JSON 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    );
  }
}
