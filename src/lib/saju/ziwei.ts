/**
 * 자미두수(紫微斗數) 계산 엔진
 *
 * MIT License — 전통 자미두수 알고리즘을 독립적으로 구현.
 * 중국 전통 역학의 공개된 지식을 기반으로 합니다.
 *
 * Copyright (c) 2024-2026 두얼간이
 */

import type { ZiweiChart, ZiweiPalace, ZiweiStar, LiuNianInfo, DaxianItem } from './saju-engine';
import { solarToLunar } from 'manseryeok';

// ──────────────────────────────────────────────
// 상수 데이터
// ──────────────────────────────────────────────

/** 12궁 이름 */
const PALACE_NAMES = [
  '명궁', '형제궁', '부처궁', '자녀궁', '재백궁', '질액궁',
  '천이궁', '노복궁', '관록궁', '전택궁', '복덕궁', '부모궁',
];

/** 지지 */
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 천간 */
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 오행국 결정 표 — 궁간(천간) + 명궁 지지 납음으로 결정
 *  납음 오행 계산: (천간인덱스/2 + 지지인덱스/2) % 5 의 변형
 *  실제로는 명궁의 천간과 지지로 납음 오행을 구한 뒤 오행국 결정
 */
const WUXING_JU_NAMES: Record<number, { name: string; number: number }> = {
  0: { name: '水二局', number: 2 },
  1: { name: '木三局', number: 3 },
  2: { name: '金四局', number: 4 },
  3: { name: '土五局', number: 5 },
  4: { name: '火六局', number: 6 },
};

/**
 * 납음(纳音) 오행 테이블
 * 60갑자에 대한 납음 오행 인덱스 (0=금, 1=화, 2=목, 3=수, 4=토)
 * 2개씩 같은 납음을 가짐 (예: 甲子 乙丑 → 해중금 → 금)
 */
const NAYIN_TABLE: number[] = [
  // 甲子乙丑 해중금  丙寅丁卯 노중화  戊辰己巳 대림목  庚午辛未 노방토  壬申癸酉 검봉금
  0, 0, 1, 1, 2, 2, 4, 4, 0, 0,   // 0~9
  // 甲戌乙亥 산두화  丙子丁丑 간하수  戊寅己卯 성두토  庚辰辛巳 백납금  壬午癸未 양류목
  1, 1, 3, 3, 4, 4, 0, 0, 2, 2,   // 10~19
  // 甲申乙酉 천중수  丙戌丁亥 옥상토  戊子己丑 벽력화  庚寅辛卯 송백목  壬辰癸巳 장류수
  3, 3, 4, 4, 1, 1, 2, 2, 3, 3,   // 20~29
  // 甲午乙未 사중금  丙申丁酉 산하화  戊戌己亥 평지목  庚子辛丑 벽상토  壬寅癸卯 금박금
  0, 0, 1, 1, 2, 2, 4, 4, 0, 0,   // 30~39
  // 甲辰乙巳 복등화  丙午丁未 천하수  戊申己酉 대역토  庚戌辛亥 차천금  壬子癸丑 상자목
  1, 1, 3, 3, 4, 4, 0, 0, 2, 2,   // 40~49
  // 甲寅乙卯 대계수  丙辰丁巳 사중토  戊午己未 천상화  庚申辛酉 석류목  壬戌癸亥 대해수
  3, 3, 4, 4, 1, 1, 2, 2, 3, 3,   // 50~59
];

/** 납음 오행 → 오행국 매핑 (금=4, 화=6, 목=3, 수=2, 토=5) */
const NAYIN_TO_JUXING: Record<number, number> = {
  0: 4, // 금 → 금사국
  1: 6, // 화 → 화육국
  2: 3, // 목 → 목삼국
  3: 2, // 수 → 수이국
  4: 5, // 토 → 토오국
};

// ── 14주성(主星) 이름 ──
const MAIN_STARS_14 = [
  '자미', '천기', '태양', '무곡', '천동', '염정',
  '천부', '태음', '탐랑', '거문', '천상', '천량', '칠살', '파군',
];

/**
 * 자미성 위치 결정 표
 * [오행국수][음력일] → 자미성이 위치하는 지지 인덱스
 *
 * 공식: 자미성 위치 = (오행국수 기반 변환)
 * 실제 전통 공식:
 *   quotient = ceil(lunarDay / juNumber)
 *   remainder = lunarDay % juNumber
 *   조건에 따라 순행/역행으로 자미 위치 결정
 */
function getZiweiPosition(juNumber: number, lunarDay: number): number {
  // 전통 자미성 안성법(安星法)
  // 1. 음력 생일을 오행국수로 나눔
  const quotient = Math.ceil(lunarDay / juNumber);
  const remainder = lunarDay % juNumber;

  // 2. 몫으로 기본 위치 계산 (寅=2에서 시작하여 순행)
  let base = (quotient + 1) % 12; // 寅(2)을 기준으로 조정

  // 3. 나머지에 따라 보정
  if (remainder === 0) {
    // 나누어 떨어지면 보정 없음
    base = (quotient + 1) % 12;
  } else {
    // 몫이 홀수면 순행, 짝수면 역행으로 나머지만큼 이동
    if (quotient % 2 === 1) {
      base = (quotient + 1 + remainder) % 12;
    } else {
      base = (quotient + 1 - remainder + 12) % 12;
    }
  }

  return base;
}

// ── 14주성 배치 순서 (자미성 기준 역행) ──
// 자미, 천기는 자미에서 역행, 나머지는 특정 규칙
// 자미계열: 자미→천기(역1)→(건너뜀)→태양(역3)→무곡(역4)→천동(역5)→염정(역6)
// 천부계열: 천부→태음(역1)→탐랑(역2)→거문(역3)→천상(역4)→천량(역5)→칠살(역6)→(건너뜀2)→파군

/** 자미계 6성 — 자미성 위치에서 역행 배치 */
const ZIWEI_SERIES_OFFSETS = [0, -1, -3, -4, -5, -6]; // 자미, 천기, 태양, 무곡, 천동, 염정
const ZIWEI_SERIES_NAMES = ['자미', '천기', '태양', '무곡', '천동', '염정'];

/** 천부계 8성 — 천부성 위치에서 순행 배치 */
// 천부 위치 = 자미 위치의 대칭 (寅=2 기준 대칭)
const TIANFU_SERIES_NAMES = ['천부', '태음', '탐랑', '거문', '천상', '천량', '칠살', '파군'];
const TIANFU_SERIES_OFFSETS = [0, 1, 2, 3, 4, 5, 6, 8]; // 천부에서 순행

/** 천부 위치 계산: 자미 위치의 대칭점 */
function getTianfuPosition(ziweiPos: number): number {
  // 천부는 자미와 寅(2)을 축으로 대칭
  // 공식: 천부 = (4 - 자미 + 12) % 12  → 辰(4)을 축으로
  return (4 - ziweiPos + 12) % 12;
}

// ── 성요 밝기(廟旺) 테이블 ──
// 각 주성이 각 궁(지지)에서의 밝기
// 묘(廟)=가장 밝음, 왕(旺), 득(得), 리(利), 평(平), 불(不), 함(陷)=가장 어두움
const BRIGHTNESS_MAP: Record<string, string[]> = {
  // 각 지지(子~亥) 순서로 밝기
  '자미': ['왕', '묘', '득', '왕', '묘', '득', '왕', '묘', '득', '왕', '묘', '득'],
  '천기': ['득', '묘', '리', '왕', '묘', '평', '득', '묘', '리', '왕', '묘', '평'],
  '태양': ['함', '득', '왕', '묘', '왕', '묘', '리', '불', '함', '함', '득', '왕'],
  '무곡': ['왕', '묘', '득', '리', '묘', '평', '왕', '묘', '득', '리', '묘', '평'],
  '천동': ['왕', '득', '리', '묘', '평', '함', '왕', '득', '리', '묘', '평', '함'],
  '염정': ['평', '리', '묘', '왕', '득', '묘', '평', '리', '묘', '왕', '득', '묘'],
  '천부': ['묘', '득', '묘', '왕', '득', '왕', '묘', '득', '묘', '왕', '득', '왕'],
  '태음': ['묘', '왕', '득', '리', '함', '함', '불', '득', '왕', '묘', '묘', '왕'],
  '탐랑': ['왕', '리', '묘', '왕', '득', '리', '묘', '왕', '평', '리', '묘', '왕'],
  '거문': ['왕', '묘', '리', '묘', '왕', '득', '왕', '묘', '리', '묘', '왕', '득'],
  '천상': ['묘', '득', '왕', '묘', '리', '왕', '묘', '득', '왕', '묘', '리', '왕'],
  '천량': ['묘', '왕', '묘', '득', '왕', '리', '묘', '왕', '묘', '득', '왕', '리'],
  '칠살': ['왕', '묘', '평', '리', '묘', '왕', '왕', '묘', '평', '리', '묘', '왕'],
  '파군': ['득', '리', '왕', '묘', '평', '왕', '득', '리', '왕', '묘', '평', '왕'],
};

// ── 사화(四化) 테이블 ──
// 각 천간에 대한 화록/화권/화과/화기 대상 성
const SIHUA_TABLE: Record<string, [string, string, string, string]> = {
  //        화록    화권    화과    화기
  '甲': ['염정', '파군', '무곡', '태양'],
  '乙': ['천기', '천량', '자미', '태음'],
  '丙': ['천동', '천기', '문창', '염정'],
  '丁': ['태음', '천동', '천기', '거문'],
  '戊': ['탐랑', '태음', '우필', '천기'],
  '己': ['무곡', '탐랑', '천량', '문곡'],
  '庚': ['태양', '무곡', '태음', '천동'],
  '辛': ['거문', '태양', '문곡', '문창'],
  '壬': ['천량', '자미', '좌보', '무곡'],
  '癸': ['파군', '거문', '태음', '탐랑'],
};

// ── 보조성(輔星) ──
const MINOR_STARS = ['문창', '문곡', '좌보', '우필', '천괴', '천월', '화성', '영성', '천공', '지겁'];

// ──────────────────────────────────────────────
// 유틸리티
// ──────────────────────────────────────────────

/** 60갑자 인덱스 계산 */
function ganZhiIndex(ganIdx: number, zhiIdx: number): number {
  // 간지 조합: 갑자=0, 을축=1, ... 60개
  for (let i = 0; i < 60; i++) {
    if (i % 10 === ganIdx && i % 12 === zhiIdx) return i;
  }
  return 0;
}

/** 음력 월/시간 → 명궁 지지 인덱스 계산
 *  전통 공식: 寅(2)에서 음력월수만큼 순행한 뒤, 시진수만큼 역행
 *  = (寅 + 음력월 - 1) + (12 - 시진인덱스) = (13 + 음력월 - 시진) % 12
 */
function getMingGongZhi(lunarMonth: number, hourBranchIdx: number): number {
  return (13 + lunarMonth - hourBranchIdx) % 12;
}

/** 신궁 지지 인덱스 계산
 *  공식: 신궁 = (명궁 + 시진) 기준으로 대칭
 */
function getShenGongZhi(lunarMonth: number, hourBranchIdx: number): number {
  // 전통 공식: 신궁 = (음력월 + 시진 + 1) % 12 → 寅 기준 조정
  return (lunarMonth + hourBranchIdx + 1) % 12;
}

/** 시간(0~23) → 시진(지지) 인덱스 변환 */
function hourToBranchIdx(hour: number): number {
  // 子시(23~1)=0, 丑시(1~3)=1, 寅시(3~5)=2, ...
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}

/** 궁의 천간 배정 (년간 기준 오호둔갑법 五虎遁甲法) */
function getPalaceGan(yearGanIdx: number, zhiIdx: number): number {
  // 년간에 따른 인월(寅月) 시작 천간
  // 甲/己년 → 丙(2), 乙/庚년 → 戊(4), 丙/辛년 → 庚(6), 丁/壬년 → 壬(8), 戊/癸년 → 甲(0)
  const startGanMap: Record<number, number> = { 0: 2, 1: 4, 2: 6, 3: 8, 4: 0 };
  const startGan = startGanMap[yearGanIdx % 5];
  // 寅(2)부터 시작하여 지지 인덱스 차이만큼 순행
  return (startGan + (zhiIdx - 2 + 12) % 12) % 10;
}

/** 60갑자에서 납음 오행 인덱스 구하기 */
function getNayinElement(ganIdx: number, zhiIdx: number): number {
  const idx = ganZhiIndex(ganIdx, zhiIdx);
  return NAYIN_TABLE[idx];
}

// ──────────────────────────────────────────────
// 메인 함수
// ──────────────────────────────────────────────

/**
 * 자미두수 명반(命盤) 생성
 *
 * 알고리즘:
 * 1. 양력 → 음력 변환
 * 2. 명궁/신궁 지지 결정
 * 3. 오행국 결정 (명궁의 간지 납음)
 * 4. 자미성 위치 → 14주성 배치
 * 5. 보조성 배치
 * 6. 사화(四化) 적용
 * 7. 12궁 명명
 */
export function createChart(
  year: number, month: number, day: number,
  hour: number, minute: number, isMale: boolean
): ZiweiChart {
  // 1. 음력 변환
  const lunar = solarToLunar(year, month, day);
  const lunarYear = lunar.year ?? year;
  const lunarMonth = lunar.month ?? month;
  const lunarDay = lunar.day ?? day;

  // 년간/년지 인덱스 (음력 년도 기준)
  const yearGanIdx = ((lunarYear - 4) % 10 + 10) % 10;     // 甲=0 기준
  const yearZhiIdx = ((lunarYear - 4) % 12 + 12) % 12;     // 子=0 기준

  // 시진 인덱스
  const hourBranchIdx = hourToBranchIdx(hour);

  // 2. 명궁/신궁 지지 결정
  const mingGongZhiIdx = getMingGongZhi(lunarMonth, hourBranchIdx);
  const shenGongZhiIdx = getShenGongZhi(lunarMonth, hourBranchIdx);

  // 3. 명궁의 천간 결정 (오호둔갑법)
  const mingGongGanIdx = getPalaceGan(yearGanIdx, mingGongZhiIdx);

  // 4. 오행국 결정 (명궁의 간지 납음)
  const nayinElement = getNayinElement(mingGongGanIdx, mingGongZhiIdx);
  const juNumber = NAYIN_TO_JUXING[nayinElement];
  const wuXingJuIdx = Object.entries(WUXING_JU_NAMES).find(
    ([, v]) => v.number === juNumber
  )?.[0];
  const wuXingJu = WUXING_JU_NAMES[Number(wuXingJuIdx ?? 3)];

  // 5. 자미성 위치 결정
  const ziweiPos = getZiweiPosition(juNumber, lunarDay);

  // 6. 12궁 구성
  const palaces: Record<string, ZiweiPalace> = {};

  for (let i = 0; i < 12; i++) {
    // 궁의 지지 인덱스: 명궁에서 순행
    const zhiIdx = (mingGongZhiIdx + i) % 12;
    const ganIdx = getPalaceGan(yearGanIdx, zhiIdx);
    const palaceName = PALACE_NAMES[i];

    palaces[palaceName] = {
      name: palaceName,
      zhi: ZHI[zhiIdx],
      ganZhi: GAN[ganIdx] + ZHI[zhiIdx],
      stars: [],
      isShenGong: zhiIdx === shenGongZhiIdx,
    };
  }

  // 7. 자미계 6성 배치
  for (let i = 0; i < ZIWEI_SERIES_NAMES.length; i++) {
    const starName = ZIWEI_SERIES_NAMES[i];
    const pos = (ziweiPos + ZIWEI_SERIES_OFFSETS[i] + 12) % 12;

    // 이 위치에 해당하는 궁 찾기
    const palace = Object.values(palaces).find(p => ZHI.indexOf(p.zhi) === pos);
    if (palace) {
      const brightness = BRIGHTNESS_MAP[starName]?.[pos] ?? '평';
      palace.stars.push({ name: starName, brightness });
    }
  }

  // 8. 천부계 8성 배치
  const tianfuPos = getTianfuPosition(ziweiPos);
  for (let i = 0; i < TIANFU_SERIES_NAMES.length; i++) {
    const starName = TIANFU_SERIES_NAMES[i];
    const pos = (tianfuPos + TIANFU_SERIES_OFFSETS[i]) % 12;

    const palace = Object.values(palaces).find(p => ZHI.indexOf(p.zhi) === pos);
    if (palace) {
      const brightness = BRIGHTNESS_MAP[starName]?.[pos] ?? '평';
      palace.stars.push({ name: starName, brightness });
    }
  }

  // 9. 보조성 배치 (간소화)
  placeMinorStars(palaces, yearGanIdx, yearZhiIdx, lunarMonth, hourBranchIdx, lunarDay);

  // 10. 사화(四化) 적용 — 년간 기준
  const yearGan = GAN[yearGanIdx];
  const siHua = SIHUA_TABLE[yearGan];
  if (siHua) {
    const siHuaNames = ['화록', '화권', '화과', '화기'];
    siHua.forEach((starName, i) => {
      // 해당 성이 있는 궁에 사화 표시
      for (const palace of Object.values(palaces)) {
        const star = palace.stars.find(s => s.name === starName);
        if (star) {
          star.siHua = siHuaNames[i];
          break;
        }
      }
    });
  }

  return {
    mingGongZhi: ZHI[mingGongZhiIdx],
    shenGongZhi: ZHI[shenGongZhiIdx],
    wuXingJu,
    palaces,
  };
}

/**
 * 보조성 배치 (문창, 문곡, 좌보, 우필, 천괴, 천월, 화성, 영성 등)
 */
function placeMinorStars(
  palaces: Record<string, ZiweiPalace>,
  yearGanIdx: number,
  yearZhiIdx: number,
  lunarMonth: number,
  hourBranchIdx: number,
  lunarDay: number
): void {
  // 문창(文昌): 시지에서 역행으로 배치
  // 공식: (10 - 시진인덱스 + 12) % 12
  const wenchangPos = (10 - hourBranchIdx + 12) % 12;
  placeStarAtZhi(palaces, '문창', wenchangPos);

  // 문곡(文曲): 시지에서 순행으로 배치
  // 공식: (4 + 시진인덱스) % 12
  const wenquPos = (4 + hourBranchIdx) % 12;
  placeStarAtZhi(palaces, '문곡', wenquPos);

  // 좌보(左輔): 음력 월 기준 순행
  // 공식: (lunarMonth + 3) % 12
  const zuoPos = (lunarMonth + 3) % 12;
  placeStarAtZhi(palaces, '좌보', zuoPos);

  // 우필(右弼): 음력 월 기준 역행
  // 공식: (11 - lunarMonth + 12) % 12 → (10 - lunarMonth + 12) % 12
  const youPos = (10 - lunarMonth + 12) % 12;
  placeStarAtZhi(palaces, '우필', youPos);

  // 천괴(天魁): 년간 기준
  const tianKuiMap: Record<number, number> = { 0: 1, 1: 0, 2: 11, 3: 11, 4: 1, 5: 0, 6: 7, 7: 8, 8: 3, 9: 3 };
  placeStarAtZhi(palaces, '천괴', tianKuiMap[yearGanIdx] ?? 0);

  // 천월(天鉞): 년간 기준
  const tianYueMap: Record<number, number> = { 0: 7, 1: 8, 2: 9, 3: 9, 4: 7, 5: 8, 6: 1, 7: 2, 8: 5, 9: 5 };
  placeStarAtZhi(palaces, '천월', tianYueMap[yearGanIdx] ?? 0);

  // 화성(火星): 년지 기준 + 시진
  const huoBase: Record<number, number> = { 0: 2, 1: 3, 2: 1, 3: 9 };
  const huoGroup = yearZhiIdx % 4;
  const huoPos = ((huoBase[huoGroup] ?? 2) + hourBranchIdx) % 12;
  placeStarAtZhi(palaces, '화성', huoPos);

  // 영성(鈴星): 년지 기준 + 시진
  const lingBase: Record<number, number> = { 0: 10, 1: 10, 2: 3, 3: 10 };
  const lingGroup = yearZhiIdx % 4;
  const lingPos = ((lingBase[lingGroup] ?? 10) + hourBranchIdx) % 12;
  placeStarAtZhi(palaces, '영성', lingPos);

  // 천공(天空), 지겁(地劫)
  const kongPos = (hourBranchIdx + 1) % 12;
  placeStarAtZhi(palaces, '천공', kongPos);
  const jiePos = (11 - hourBranchIdx + 12) % 12;
  placeStarAtZhi(palaces, '지겁', jiePos);
}

/** 특정 지지 인덱스 위치의 궁에 성요 배치 */
function placeStarAtZhi(palaces: Record<string, ZiweiPalace>, starName: string, zhiIdx: number): void {
  const palace = Object.values(palaces).find(p => ZHI.indexOf(p.zhi) === zhiIdx);
  if (palace) {
    palace.stars.push({ name: starName, brightness: '평' });
  }
}

// ──────────────────────────────────────────────
// 유년(流年) 분석
// ──────────────────────────────────────────────

/**
 * 유년(流年) 분석 — 특정 연도의 자미두수 운세
 *
 * 유년 명궁 = 해당 연도의 지지와 같은 궁
 * 유년 사화 = 해당 연도의 천간에 따른 사화
 */
export function calculateLiunian(chart: ZiweiChart, targetYear: number): LiuNianInfo {
  const yearGanIdx = (targetYear - 4) % 10;
  const yearZhiIdx = (targetYear - 4) % 12;
  const yearGan = GAN[yearGanIdx];
  const yearZhi = ZHI[yearZhiIdx];

  // 유년 명궁 = 해당 연도의 지지
  const mingGongZhi = yearZhi;

  // 해당 지지에 있는 본명반(natal) 궁 이름
  const natalPalace = Object.values(chart.palaces).find(p => p.zhi === mingGongZhi);
  const natalPalaceAtMing = natalPalace?.name ?? '명궁';

  // 유년 사화
  const siHuaNames = ['화록', '화권', '화과', '화기'];
  const siHuaStars = SIHUA_TABLE[yearGan] ?? ['', '', '', ''];
  const siHua: Record<string, string> = {};
  siHuaStars.forEach((star, i) => {
    if (star) siHua[siHuaNames[i]] = star;
  });

  // 현재 대한(대운) 찾기
  const daxianList = getDaxianList(chart);
  const birthYear = targetYear; // 근사값 (실제로는 차트에서 추출해야 함)
  // 대한은 오행국수에 기반하여 시작
  const currentDaxian = daxianList[0]; // 기본값

  return {
    year: targetYear,
    stem: yearGan,
    branch: yearZhi,
    mingGongZhi,
    natalPalaceAtMing,
    siHua,
    daxianPalaceName: currentDaxian?.palaceName ?? '',
    daxianAgeStart: currentDaxian?.ageStart ?? 0,
    daxianAgeEnd: currentDaxian?.ageEnd ?? 0,
  };
}

// ──────────────────────────────────────────────
// 대한(大限) — 자미두수의 대운
// ──────────────────────────────────────────────

/**
 * 대한(大限) 목록 생성
 *
 * 오행국수에 따라 시작 나이가 다름:
 * - 수이국: 2세 시작
 * - 목삼국: 3세 시작
 * - 금사국: 4세 시작
 * - 토오국: 5세 시작
 * - 화육국: 6세 시작
 *
 * 각 대한은 10년간 지속, 명궁에서 시작하여 순행/역행
 */
export function getDaxianList(chart: ZiweiChart): DaxianItem[] {
  const startAge = chart.wuXingJu.number;
  const palaceList = Object.values(chart.palaces);
  const result: DaxianItem[] = [];

  for (let i = 0; i < 12; i++) {
    const palace = palaceList[i % palaceList.length];
    if (!palace) continue;

    const ageStart = startAge + i * 10;
    const ageEnd = ageStart + 9;
    const mainStars = palace.stars
      .filter(s => MAIN_STARS_14.includes(s.name))
      .map(s => `${s.name}(${s.brightness})`);

    result.push({
      ageStart,
      ageEnd,
      palaceName: palace.name,
      ganZhi: palace.ganZhi,
      mainStars,
    });
  }

  return result;
}
