/**
 * 고급 사주 분석 모듈
 * 사주팔자 + 자미두수 + 서양 별자리를 계산하여
 * AI 프롬프트에 전달할 구조화된 텍스트를 생성합니다.
 */
import {
  calculateSaju,
  createChart,
  calculateLiunian,
  getDaxianList,
  calculateNatal,
  ZODIAC_KO,
  PLANET_KO,
} from '@/lib/saju/saju-engine';
import type {
  SajuResult,
  PillarDetail,
  DaewoonItem,
  Gender,
  ZiweiChart,
  NatalChart,
  PlanetId,
  ZiweiPalace,
} from '@/lib/saju/saju-engine';

const PILLAR_NAMES = ['시주(時柱)', '일주(日柱)', '월주(月柱)', '년주(年柱)'];

/** 사주 + 자미두수 + 서양 별자리 통합 분석 텍스트 생성 */
export async function generateAdvancedSajuContext(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number | null,
  gender: 'male' | 'female',
): Promise<string> {
  const hour = birthHour ?? 12;
  const isMale = gender === 'male';

  // 1. 사주팔자
  const sajuResult = calculateSaju({
    year: birthYear,
    month: birthMonth,
    day: birthDay,
    hour,
    minute: 0,
    gender,
    unknownTime: birthHour === null,
  });

  const sections = [
    formatPillars(sajuResult),
    formatSipsin(sajuResult),
    formatUnseong(sajuResult),
    formatJigang(sajuResult),
    formatRelations(sajuResult),
    formatDaewoon(sajuResult, birthYear),
    formatSpecialSals(sajuResult),
    formatCurrentYearAnalysis(sajuResult),
  ];

  // 2. 자미두수
  try {
    const ziweiChart = await createChart(birthYear, birthMonth, birthDay, hour, 0, isMale);
    sections.push(await formatZiwei(ziweiChart, birthYear));
  } catch {
    // 자미두수 계산 실패 시 skip
  }

  // 3. 서양 별자리
  try {
    const natalChart = await calculateNatal({
      year: birthYear,
      month: birthMonth,
      day: birthDay,
      hour,
      minute: 0,
      gender,
    });
    sections.push(formatNatal(natalChart));
  } catch {
    // 서양 점성술 계산 실패 시 skip
  }

  return sections.join('\n\n');
}

// ─── 사주팔자 포맷 ───

function formatPillars(result: SajuResult): string {
  const lines = ['[사주 원국 (四柱八字)]'];
  const headers = ['', '시주', '일주', '월주', '년주'];
  const stems = ['천간:', ...result.pillars.map(p => p.pillar.stem)];
  const branches = ['지지:', ...result.pillars.map(p => p.pillar.branch)];

  lines.push(headers.join('\t'));
  lines.push(stems.join('\t'));
  lines.push(branches.join('\t'));

  const dayStem = result.pillars[1].pillar.stem;
  lines.push(`\n일간(日干): ${dayStem} — 이것이 "나" 자신입니다.`);

  return lines.join('\n');
}

function formatSipsin(result: SajuResult): string {
  const lines = ['[십신(十神) 관계 — 일간 기준]'];

  result.pillars.forEach((p, i: number) => {
    const name = PILLAR_NAMES[i];
    lines.push(`${name}: 천간 ${p.pillar.stem}(${p.stemSipsin}), 지지 ${p.pillar.branch}(${p.branchSipsin})`);
  });

  lines.push('');
  lines.push('십신 해석 가이드:');
  lines.push('- 비견/겁재(比劫): 나와 같은 기운 → 경쟁, 형제, 동료');
  lines.push('- 식신/상관(食傷): 내가 낳는 기운 → 표현력, 재능, 끼');
  lines.push('- 편재/정재(財星): 내가 지배하는 기운 → 돈, 아버지, (남)아내');
  lines.push('- 편관/정관(官星): 나를 지배하는 기운 → 직장, 명예, (여)남편');
  lines.push('- 편인/정인(印星): 나를 낳는 기운 → 학문, 어머니, 자격');

  return lines.join('\n');
}

function formatUnseong(result: SajuResult): string {
  const lines = ['[12운성 — 일간의 에너지 상태]'];

  result.pillars.forEach((p, i: number) => {
    lines.push(`${PILLAR_NAMES[i]}: ${p.unseong}`);
  });

  lines.push('');
  lines.push('운성 해석: 장생/관대/건록/제왕=강한 에너지, 쇠/병/사/묘=약한 에너지, 절/태/양=전환기');

  return lines.join('\n');
}

function formatJigang(result: SajuResult): string {
  const lines = ['[지장간(支藏干) — 지지 속 숨은 천간]'];

  result.pillars.forEach((p, i: number) => {
    const chars = p.jigang.split('');
    lines.push(`${PILLAR_NAMES[i]} ${p.pillar.branch}: ${chars.join(', ')} (정기: ${chars[chars.length - 1]})`);
  });

  return lines.join('\n');
}

function formatRelations(result: SajuResult): string {
  const lines = ['[합충형파해 관계 — 사주 내 기둥 간 상호작용]'];

  result.relations.pairs.forEach((rel, key) => {
    const [i, j] = key.split(',').map(Number);
    const name1 = PILLAR_NAMES[i];
    const name2 = PILLAR_NAMES[j];

    if (rel.stem.length > 0) {
      rel.stem.forEach(r => {
        lines.push(`천간 ${name1}-${name2}: ${r.type}${r.detail ? `(${r.detail})` : ''}`);
      });
    }
    if (rel.branch.length > 0) {
      rel.branch.forEach(r => {
        lines.push(`지지 ${name1}-${name2}: ${r.type}${r.detail ? `(${r.detail})` : ''}`);
      });
    }
  });

  if (result.relations.triple.length > 0) {
    result.relations.triple.forEach(r => {
      lines.push(`삼합: ${r.type}${r.detail ? `(${r.detail})` : ''}`);
    });
  }

  if (result.relations.directional.length > 0) {
    result.relations.directional.forEach(r => {
      lines.push(`방합: ${r.type}${r.detail ? `(${r.detail})` : ''}`);
    });
  }

  if (lines.length === 1) {
    lines.push('특별한 합충형파해 관계 없음');
  }

  return lines.join('\n');
}

function formatDaewoon(result: SajuResult, birthYear: number): string {
  const lines = ['[대운(大運) — 10년 주기 운세 흐름]'];
  const currentAge = new Date().getFullYear() - birthYear;

  result.daewoon.forEach((dw: DaewoonItem) => {
    const ageRange = `${dw.age}~${dw.age + 9}세`;
    const isCurrent = currentAge >= dw.age && currentAge < dw.age + 10;
    const marker = isCurrent ? ' ★현재 대운★' : '';
    lines.push(`${dw.index}. ${dw.ganzi} (${ageRange}) — 천간${dw.stemSipsin}, 지지${dw.branchSipsin}, 운성${dw.unseong}${marker}`);
  });

  return lines.join('\n');
}

function formatSpecialSals(result: SajuResult): string {
  const lines = ['[신살(神殺) — 특수 기운]'];
  const sals = result.specialSals;

  if (sals.yangin.length > 0) {
    lines.push(`양인살(羊刃殺): ${sals.yangin.map((i: number) => PILLAR_NAMES[i]).join(', ')} — 강한 추진력, 칼의 기운`);
  }
  if (sals.baekho) {
    lines.push('백호살(白虎殺): 있음 — 사고/수술 주의');
  }
  if (sals.goegang) {
    lines.push('괴강살(魁罡殺): 있음 — 극강의 자존심');
  }

  const dowhaBranches = ['子', '午', '卯', '酉'];
  const dowhaPositions = result.pillars
    .map((p, i: number) => dowhaBranches.includes(p.pillar.branch) ? i : -1)
    .filter((i: number) => i >= 0);
  if (dowhaPositions.length > 0) {
    lines.push(`도화살(桃花殺): ${dowhaPositions.map((i: number) => PILLAR_NAMES[i]).join(', ')} — 이성 매력`);
  }

  if (lines.length === 1) {
    lines.push('특이 신살 없음');
  }

  return lines.join('\n');
}

function formatCurrentYearAnalysis(result: SajuResult): string {
  const currentYear = new Date().getFullYear();
  // 현재 연도의 간지 계산
  const yearGanIdx = (currentYear - 4) % 10;
  const yearZhiIdx = (currentYear - 4) % 12;
  const ganArr = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhiArr = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const yearGanzi = `${ganArr[yearGanIdx]}${zhiArr[yearZhiIdx]}`;

  const lines = [`[${currentYear}년 ${yearGanzi}년 세운 분석]`];

  const birthYear = result.input.year;
  const currentAge = currentYear - birthYear;
  const currentDaewoon = result.daewoon.find(
    (dw: DaewoonItem) => currentAge >= dw.age && currentAge < dw.age + 10
  );

  if (currentDaewoon) {
    lines.push(`현재 대운: ${currentDaewoon.ganzi} (${currentDaewoon.age}~${currentDaewoon.age + 9}세)`);
    lines.push(`대운 십신: 천간 ${currentDaewoon.stemSipsin}, 지지 ${currentDaewoon.branchSipsin}`);
    lines.push(`대운 운성: ${currentDaewoon.unseong}`);
  }

  // 오행 분석
  const ohangLabels: Record<string, string> = {
    wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
  };
  lines.push('');
  lines.push(`${currentYear}년 세운: ${yearGanzi}`);
  const yearStemElement = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'][yearGanIdx];
  lines.push(`${ohangLabels[yearStemElement]} 에너지가 강한 해.`);

  return lines.join('\n');
}

// ─── 자미두수 포맷 ───

async function formatZiwei(chart: ZiweiChart, birthYear: number): Promise<string> {
  const lines = ['[자미두수(紫微斗數) — 동양 별자리 운명 분석]'];
  const palaceList: ZiweiPalace[] = Object.values(chart.palaces);

  // 명궁 찾기 (mingGongZhi와 일치하는 궁)
  const mingPalace = palaceList.find(p => p.zhi === chart.mingGongZhi);
  if (mingPalace) {
    const stars = mingPalace.stars.map(s => `${s.name}(${s.brightness})`).join(', ');
    lines.push(`명궁(命宮): ${mingPalace.name} — ${stars || '주성 없음'}`);
  }

  // 신궁 찾기
  const shenPalace = palaceList.find(p => p.isShenGong);
  if (shenPalace) {
    const stars = shenPalace.stars.map(s => `${s.name}(${s.brightness})`).join(', ');
    lines.push(`신궁(身宮): ${shenPalace.name} — ${stars || '주성 없음'}`);
  }

  // 오행국
  lines.push(`오행국: ${chart.wuXingJu.name}`);

  // 12궁 요약
  lines.push('');
  lines.push('12궁 배치:');
  palaceList.forEach(palace => {
    if (palace.stars.length === 0) return;
    const starStr = palace.stars.map(s => {
      let label = s.name;
      if (s.brightness) label += `(${s.brightness})`;
      if (s.siHua) label += `[${s.siHua}]`;
      return label;
    }).join(', ');
    const isMing = palace.zhi === chart.mingGongZhi ? ' ★명궁' : '';
    const isShen = palace.isShenGong ? ' ★신궁' : '';
    lines.push(`  ${palace.name}${isMing}${isShen}: ${starStr}`);
  });

  // 대한(대운) 흐름
  try {
    const daxianList = await getDaxianList(chart);
    const currentAge = new Date().getFullYear() - birthYear;
    lines.push('');
    lines.push('자미두수 대한(大限):');
    daxianList.forEach(dx => {
      const isCurrent = currentAge >= dx.ageStart && currentAge <= dx.ageEnd;
      const marker = isCurrent ? ' ★현재★' : '';
      lines.push(`  ${dx.ageStart}~${dx.ageEnd}세: ${dx.palaceName} ${dx.ganZhi} — ${dx.mainStars.join(', ') || '없음'}${marker}`);
    });
  } catch {
    // skip
  }

  // 유년 분석
  try {
    const currentYear = new Date().getFullYear();
    const liunian = await calculateLiunian(chart, currentYear);
    lines.push('');
    lines.push(`${currentYear}년 유년(流年) 분석:`);
    lines.push(`  유년 명궁 위치: ${liunian.natalPalaceAtMing} (${liunian.mingGongZhi})`);
    const siHuaEntries = Object.entries(liunian.siHua);
    if (siHuaEntries.length > 0) {
      lines.push(`  사화(四化): ${siHuaEntries.map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }
    lines.push(`  현재 대한: ${liunian.daxianPalaceName} (${liunian.daxianAgeStart}~${liunian.daxianAgeEnd}세)`);
  } catch {
    // skip
  }

  return lines.join('\n');
}

// ─── 서양 별자리 포맷 ───

function formatNatal(chart: NatalChart): string {
  const lines = ['[서양 점성술 — 별자리·행성 분석]'];

  // 태양/달/ASC 별자리
  const sun = chart.planets.find(p => p.id === 'Sun');
  const moon = chart.planets.find(p => p.id === 'Moon');

  if (sun) {
    lines.push(`태양 별자리: ${ZODIAC_KO[sun.sign]} (${sun.sign}) — 핵심 자아, 외부에 보이는 성격`);
  }
  if (moon) {
    lines.push(`달 별자리: ${ZODIAC_KO[moon.sign]} (${moon.sign}) — 내면의 감정, 무의식적 반응`);
  }

  // ASC (상승궁)
  if (chart.angles) {
    lines.push(`상승궁(ASC): ${ZODIAC_KO[chart.angles.asc.sign]} — 첫인상, 외부에 비치는 이미지`);
    lines.push(`중천(MC): ${ZODIAC_KO[chart.angles.mc.sign]} — 사회적 이미지, 커리어 방향`);
  }

  // 행성 배치
  lines.push('');
  lines.push('행성 배치:');
  chart.planets.forEach(planet => {
    const name = PLANET_KO[planet.id as PlanetId] || planet.id;
    const sign = ZODIAC_KO[planet.sign] || planet.sign;
    const retro = planet.isRetrograde ? ' (역행)' : '';
    lines.push(`  ${name}: ${sign} ${Math.floor(planet.degreeInSign)}도 (${planet.house}하우스)${retro}`);
  });

  // 주요 애스펙트
  if (chart.aspects && chart.aspects.length > 0) {
    lines.push('');
    lines.push('주요 애스펙트 (행성 간 각도 관계):');
    const ASPECT_KO: Record<string, string> = {
      conjunction: '합(0°) — 에너지 결합/강화',
      sextile: '육합(60°) — 조화로운 기회',
      square: '스퀘어(90°) — 긴장과 도전',
      trine: '트라인(120°) — 행운과 재능',
      opposition: '충(180°) — 대립과 균형',
    };

    chart.aspects.slice(0, 10).forEach(asp => {
      const p1 = PLANET_KO[asp.planet1 as PlanetId] || asp.planet1;
      const p2 = PLANET_KO[asp.planet2 as PlanetId] || asp.planet2;
      const type = ASPECT_KO[asp.type] || asp.type;
      lines.push(`  ${p1} - ${p2}: ${type}`);
    });
  }

  return lines.join('\n');
}

export type { SajuResult };
