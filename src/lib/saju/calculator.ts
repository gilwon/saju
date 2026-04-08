import {
  calculateFourPillars,
  getHeavenlyStemElement,
  getEarthlyBranchElement,
  type BirthInfo,
  type FourPillarsDetail,
  type FiveElement,
} from 'manseryeok';
import type { FiveElementDistribution } from '@/types/saju';
import { adjustToTrueSolarTime } from './true-solar-time';

// ─── 오행 분포 계산 ───

/** FiveElement("목"|"화"|"토"|"금"|"수")를 영문 키로 변환 */
const ELEMENT_KEY_MAP: Record<FiveElement, keyof FiveElementDistribution> = {
  '목': 'wood',
  '화': 'fire',
  '토': 'earth',
  '금': 'metal',
  '수': 'water',
};

/**
 * 사주 8글자(4천간 + 4지지)의 오행 분포를 계산합니다.
 * 각 기둥의 천간/지지 오행을 카운트합니다.
 */
export function calculateFiveElements(
  pillars: FourPillarsDetail,
): FiveElementDistribution {
  const dist: FiveElementDistribution = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 4기둥(연/월/일/시)의 천간, 지지 오행 카운트
  const pillarKeys = ['year', 'month', 'day', 'hour'] as const;

  for (const key of pillarKeys) {
    const pillar = pillars[key];
    const stemElement = getHeavenlyStemElement(pillar.heavenlyStem);
    const branchElement = getEarthlyBranchElement(pillar.earthlyBranch);

    dist[ELEMENT_KEY_MAP[stemElement]]++;
    dist[ELEMENT_KEY_MAP[branchElement]]++;
  }

  return dist;
}

// ─── 사주 계산 + 오행 분석 ───

/**
 * 사주 계산과 오행 분석을 한번에 수행합니다.
 * longitude가 주어지면 진태양시 보정을 적용합니다.
 */
export function analyzeSaju(
  birthInfo: BirthInfo,
  longitude?: number
): {
  pillars: FourPillarsDetail;
  elements: FiveElementDistribution;
} {
  let adjustedInfo = birthInfo;

  if (longitude !== undefined && birthInfo.hour !== undefined) {
    const adjusted = adjustToTrueSolarTime(
      birthInfo.hour,
      birthInfo.minute ?? 0,
      longitude
    );
    adjustedInfo = {
      ...birthInfo,
      hour: adjusted.hour,
      minute: adjusted.minute,
    };
  }

  const pillars = calculateFourPillars(adjustedInfo);
  const elements = calculateFiveElements(pillars);

  return { pillars, elements };
}

// ─── 오행 강약 판단 ───

/** 오행 강약 분석 결과 */
export interface ElementStrength {
  strongest: string;
  weakest: string;
  balance: string;
}

/**
 * 오행 분포에서 가장 강한/약한 요소와 전체 밸런스를 판단합니다.
 */
export function getElementStrength(
  elements: FiveElementDistribution,
): ElementStrength {
  const entries: [string, number][] = [
    ['목(木)', elements.wood],
    ['화(火)', elements.fire],
    ['토(土)', elements.earth],
    ['금(金)', elements.metal],
    ['수(水)', elements.water],
  ];

  // 가장 강한/약한 오행
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];

  // 밸런스 판단: 최대값 - 최소값 기준
  const maxCount = sorted[0][1];
  const minCount = sorted[sorted.length - 1][1];
  const diff = maxCount - minCount;

  let balance: string;
  if (diff <= 1) {
    balance = '매우 균형잡힌 오행';
  } else if (diff <= 2) {
    balance = '비교적 균형잡힌 오행';
  } else if (diff <= 3) {
    balance = '다소 치우친 오행';
  } else {
    balance = '크게 치우친 오행';
  }

  return { strongest, weakest, balance };
}

// ─── 일간(일주 천간) 기반 성격 키워드 ───

/** 천간별 성격 키워드 맵 */
const DAY_MASTER_KEYWORDS: Record<string, string[]> = {
  '갑': ['리더십', '진취적', '독립적', '정의감', '자존심이 강함', '큰 나무처럼 꿋꿋함'],
  '을': ['유연함', '적응력', '섬세함', '인내력', '풀처럼 부드러움', '외유내강'],
  '병': ['밝은 성격', '열정적', '솔직함', '낙관적', '태양 같은 존재감', '화끈함'],
  '정': ['따뜻함', '감성적', '배려심', '예술적 감각', '촛불 같은 온기', '꼼꼼함'],
  '무': ['안정적', '신뢰감', '포용력', '묵직함', '산처럼 든든함', '중심을 잡는 힘'],
  '기': ['현실적', '실용적', '세심함', '근면성실', '옥토 같은 생산력', '겸손함'],
  '경': ['결단력', '강인함', '원칙주의', '책임감', '쇠처럼 단단함', '칼 같은 판단'],
  '신': ['정교함', '완벽주의', '예리함', '심미안', '보석 같은 빛남', '날카로운 직감'],
  '임': ['지혜로움', '포용력', '자유로움', '넓은 시야', '바다 같은 깊이', '적응력'],
  '계': ['총명함', '직감력', '순수함', '창의력', '비(雨)처럼 스며드는 힘', '영리함'],
};

/**
 * 일간(일주 천간) 기반 성격 키워드를 반환합니다.
 */
export function getDayMasterKeywords(dayMaster: string): string[] {
  return DAY_MASTER_KEYWORDS[dayMaster] ?? ['정보 없음'];
}

/**
 * 사주 분석에 필요한 핵심 데이터를 한번에 추출합니다.
 * AI 프롬프트에 넣기 좋은 구조화된 데이터를 반환합니다.
 */
export function extractSajuSummary(
  pillars: FourPillarsDetail,
  elements: FiveElementDistribution,
) {
  const dayMaster = pillars.day.heavenlyStem;
  const dayMasterElement = getHeavenlyStemElement(dayMaster);
  const strength = getElementStrength(elements);
  const keywords = getDayMasterKeywords(dayMaster);

  // DB에서 읽은 JSON은 plain object라 manseryeok 메서드가 없음
  const p = pillars as unknown as Record<string, unknown>;
  const hasMethods = typeof p.toHanjaString === 'function';

  const pillarsKorean = hasMethods
    ? (pillars as unknown as { toString: () => string }).toString()
    : `${pillars.year?.heavenlyStem || ''}${pillars.year?.earthlyBranch || ''} ${pillars.month?.heavenlyStem || ''}${pillars.month?.earthlyBranch || ''} ${pillars.day?.heavenlyStem || ''}${pillars.day?.earthlyBranch || ''} ${pillars.hour?.heavenlyStem || ''}${pillars.hour?.earthlyBranch || ''}`;
  const pillarsHanja = hasMethods
    ? (pillars as unknown as { toHanjaString: () => string }).toHanjaString()
    : pillarsKorean;
  const pillarsDetail = hasMethods
    ? (pillars as unknown as { toHanjaObject: () => FourPillarsDetail }).toHanjaObject()
    : pillars;

  return {
    fourPillars: {
      korean: pillarsKorean,
      hanja: pillarsHanja,
      detail: pillarsDetail as FourPillarsDetail,
    },
    dayMaster: {
      stem: dayMaster,
      element: dayMasterElement,
      elementKey: ELEMENT_KEY_MAP[dayMasterElement],
    },
    fiveElements: elements,
    elementStrength: strength,
    personalityKeywords: keywords,
  };
}
