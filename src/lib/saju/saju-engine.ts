/**
 * 사주팔자(四柱八字) 계산 엔진
 *
 * MIT License — 전통 만세력 알고리즘을 독립적으로 구현.
 * manseryeok 패키지(MIT)를 음력 변환 및 기본 사주 계산에 활용.
 *
 * Copyright (c) 2024-2026 두얼간이
 */

import {
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
} from 'manseryeok';

// ──────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'M' | 'F';
export type YinYang = 'yin' | 'yang';
export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  isLunar?: boolean;
  cityName?: string;
  unknownTime?: boolean;
}

export interface PillarDetail {
  stem: string;         // 천간 한자 (예: 甲)
  branch: string;       // 지지 한자 (예: 子)
  fullStem: string;     // 천간 한글 (예: 갑)
  fullBranch: string;   // 지지 한글 (예: 자)
  ganzi: string;        // 간지 조합 (예: 甲子)
  stemElement: Element;
  branchElement: Element;
  stemYinYang: YinYang;
}

export interface DaewoonItem {
  index: number;
  age: number;
  ganzi: string;
  stem: string;
  branch: string;
  startDate: Date;
  stemSipsin: string;
  branchSipsin: string;
  unseong: string;
}

/** 합충형파해 관계 항목 */
interface RelationItem {
  type: string;
  detail?: string;
}

/** 쌍 관계 (천간/지지 각각) */
export interface PairRelation {
  stem: RelationItem[];
  branch: RelationItem[];
}

export interface SajuResult {
  input: BirthInput;
  pillars: Array<{
    pillar: PillarDetail;
    stemSipsin: string;
    branchSipsin: string;
    unseong: string;
    spirit: string;
    hiddenStems: string[];
    jigang: string;
  }>;
  daewoon: DaewoonItem[];
  relations: {
    pairs: Map<string, PairRelation>;
    triple: RelationItem[];
    directional: RelationItem[];
  };
  ohang: Record<Element, number>;
  specialSals: {
    yangin: number[];
    baekho: boolean;
    goegang: boolean;
  };
}

// ──────────────────────────────────────────────
// 상수 데이터
// ──────────────────────────────────────────────

/** 천간(天干) 한자 */
const STEMS_HANJA = HEAVENLY_STEMS_HANJA; // ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
/** 천간(天干) 한글 */
const STEMS_HANGUL = HEAVENLY_STEMS;      // ['갑','을','병','정','무','기','경','신','임','계']
/** 지지(地支) 한자 */
const BRANCHES_HANJA = EARTHLY_BRANCHES_HANJA; // ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
/** 지지(地支) 한글 */
const BRANCHES_HANGUL = EARTHLY_BRANCHES;      // ['자','축','인','묘','진','사','오','미','신','유','술','해']

/** 오행 매핑: 한글 → 영문 */
const ELEMENT_MAP: Record<string, Element> = {
  '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water',
};

/** 음양 매핑: 한글 → 영문 */
const YINYANG_MAP: Record<string, YinYang> = {
  '양': 'yang', '음': 'yin',
};

/** 천간 오행 (甲乙=목, 丙丁=화, 戊己=토, 庚辛=금, 壬癸=수) */
const STEM_ELEMENT: Element[] = [
  'wood', 'wood', 'fire', 'fire', 'earth',
  'earth', 'metal', 'metal', 'water', 'water',
];

/** 지지 오행 */
const BRANCH_ELEMENT: Element[] = [
  'water', 'earth', 'wood', 'wood', 'earth', 'fire',
  'fire', 'earth', 'metal', 'metal', 'earth', 'water',
];

/** 천간 음양 (甲=양, 乙=음, ...) */
const STEM_YINYANG: YinYang[] = [
  'yang', 'yin', 'yang', 'yin', 'yang',
  'yin', 'yang', 'yin', 'yang', 'yin',
];

// ── 십신(十神) 관계표 ──
// 일간 오행을 기준으로 대상 오행과의 관계 + 음양으로 결정
// [같은 오행 양양/음음=비견, 양음/음양=겁재] [내가 생하는 양양/음음=식신, 양음/음양=상관]
// [내가 극하는 양양/음음=편재, 양음/음양=정재] [나를 극하는 양양/음음=편관, 양음/음양=정관]
// [나를 생하는 양양/음음=편인, 양음/음양=정인]

const OHANG_ORDER: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

/**
 * 오행 상생 순서: 목→화→토→금→수→목
 * 오행 상극 순서: 목→토→수→화→금→목
 */
function getOhangRelation(me: Element, target: Element): '비겁' | '식상' | '재성' | '관성' | '인성' {
  const myIdx = OHANG_ORDER.indexOf(me);
  const tgtIdx = OHANG_ORDER.indexOf(target);
  const diff = (tgtIdx - myIdx + 5) % 5;

  switch (diff) {
    case 0: return '비겁'; // 같은 오행
    case 1: return '식상'; // 내가 생하는 것
    case 2: return '재성'; // 내가 극하는 것
    case 3: return '관성'; // 나를 극하는 것
    case 4: return '인성'; // 나를 생하는 것
    default: return '비겁';
  }
}

/** 십신 한글→한자 매핑 */
const SIPSIN_HANJA: Record<string, string> = {
  '비견': '比肩', '겁재': '劫財',
  '식신': '食神', '상관': '傷官',
  '편재': '偏財', '정재': '正財',
  '편관': '偏官', '정관': '正官',
  '편인': '偏印', '정인': '正印',
  '일간(나)': '本元',
};

/** 12운성 한글→한자 매핑 */
const UNSEONG_HANJA: Record<string, string> = {
  '장생': '長生', '목욕': '沐浴', '관대': '冠帶', '건록': '乾祿',
  '제왕': '帝旺', '쇠': '衰', '병': '病', '사': '死',
  '묘': '墓', '절': '絶', '태': '胎', '양': '養',
};

/** 십신 이름 결정: 관계 + 같은 음양 여부 (한자 반환) */
function getSipsinName(relation: string, sameYinYang: boolean): string {
  const map: Record<string, [string, string]> = {
    '비겁': ['비견', '겁재'],
    '식상': ['식신', '상관'],
    '재성': ['편재', '정재'],
    '관성': ['편관', '정관'],
    '인성': ['편인', '정인'],
  };
  const pair = map[relation];
  if (!pair) return '比肩';
  const hangul = sameYinYang ? pair[0] : pair[1];
  return SIPSIN_HANJA[hangul] ?? hangul;
}

// ── 12운성(十二運星)표 ──
// 행 = 천간(甲~癸), 열 = 지지(子~亥)
// 장생 → 목욕 → 관대 → 건록 → 제왕 → 쇠 → 병 → 사 → 묘 → 절 → 태 → 양
const TWELVE_STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];

// 각 천간의 12운성 시작 지지 인덱스 (장생 위치)
// 甲: 亥(11), 乙: 午(6), 丙: 寅(2), 丁: 酉(9), 戊: 寅(2)
// 己: 酉(9), 庚: 巳(5), 辛: 子(0), 壬: 申(8), 癸: 卯(3)
const UNSEONG_START: number[] = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];

// 양간은 순행, 음간은 역행
function getUnseongIndex(stemIdx: number, branchIdx: number): number {
  const start = UNSEONG_START[stemIdx];
  const isYang = stemIdx % 2 === 0;
  if (isYang) {
    return (branchIdx - start + 12) % 12;
  } else {
    return (start - branchIdx + 12) % 12;
  }
}

// ── 12신살(十二神殺)표 ──
// 연지(年支) 기준으로 각 지지에 대한 신살
// 인오술(寅午戌)년: 겁살=亥, 재살=子, 천살=丑, 지살=寅, 연살=卯, 월살=辰, 망신살=巳, 장성=午, 반안=未, 역마=申, 육해=酉, 화개=戌
const SPIRIT_NAMES = ['겁살', '재살', '천살', '지살', '연살', '월살', '망신살', '장성', '반안', '역마', '육해', '화개'];

// 연지 → 겁살 시작 지지 인덱스
// 寅(2)/午(6)/戌(10)년 → 겁살=亥(11)
// 申(8)/子(0)/辰(4)년 → 겁살=巳(5)
// 巳(5)/酉(9)/丑(1)년 → 겁살=寅(2)
// 亥(11)/卯(3)/未(7)년 → 겁살=申(8)
function getSpiritStartBranch(yearBranchIdx: number): number {
  const group = yearBranchIdx % 4;
  // 인오술 그룹: yearBranchIdx=2,6,10 → group=2 → 겁살 시작 亥(11)
  // 신자진 그룹: yearBranchIdx=0,4,8 → group=0 → 겁살 시작 巳(5)
  // 사유축 그룹: yearBranchIdx=1,5,9 → group=1 → 겁살 시작 寅(2)
  // 해묘미 그룹: yearBranchIdx=3,7,11 → group=3 → 겁살 시작 申(8)
  const startMap: Record<number, number> = { 0: 5, 1: 2, 2: 11, 3: 8 };
  return startMap[group];
}

// ── 지장간(支藏干)표 ──
// 각 지지에 숨어있는 천간들 (여기, 중기, 정기 순서)
const HIDDEN_STEMS_TABLE: string[][] = [
  ['壬', '癸'],           // 子: 임, 계(정기)
  ['癸', '辛', '己'],     // 丑: 계, 신, 기(정기)
  ['戊', '丙', '甲'],     // 寅: 무, 병, 갑(정기)
  ['甲', '乙'],           // 卯: 갑, 을(정기)
  ['乙', '癸', '戊'],     // 辰: 을, 계, 무(정기)
  ['戊', '庚', '丙'],     // 巳: 무, 경, 병(정기)
  ['丙', '己', '丁'],     // 午: 병, 기, 정(정기)
  ['丁', '乙', '己'],     // 未: 정, 을, 기(정기)
  ['戊', '壬', '庚'],     // 申: 무, 임, 경(정기)
  ['庚', '辛'],           // 酉: 경, 신(정기)
  ['辛', '丁', '戊'],     // 戌: 신, 정, 무(정기)
  ['戊', '甲', '壬'],     // 亥: 무, 갑, 임(정기)
];

// ── 천간 합(天干合) ──
// 甲己합화토, 乙庚합화금, 丙辛합화수, 丁壬합화목, 戊癸합화화
const STEM_COMBINE: [number, number, string][] = [
  [0, 5, '甲己합(토)'], [1, 6, '乙庚합(금)'], [2, 7, '丙辛합(수)'],
  [3, 8, '丁壬합(목)'], [4, 9, '戊癸합(화)'],
];

// ── 천간 충(天干沖) ──
// 甲庚충, 乙辛충, 丙壬충, 丁癸충
const STEM_CLASH: [number, number, string][] = [
  [0, 6, '甲庚충'], [1, 7, '乙辛충'], [2, 8, '丙壬충'], [3, 9, '丁癸충'],
];

// ── 지지 육합(地支六合) ──
const BRANCH_COMBINE: [number, number, string][] = [
  [0, 1, '子丑합(토)'], [2, 11, '寅亥합(목)'], [3, 10, '卯戌합(화)'],
  [4, 9, '辰酉합(금)'], [5, 8, '巳申합(수)'], [6, 7, '午未합(화)'],
];

// ── 지지 충(地支沖) ──
const BRANCH_CLASH: [number, number, string][] = [
  [0, 6, '子午충'], [1, 7, '丑未충'], [2, 8, '寅申충'],
  [3, 9, '卯酉충'], [4, 10, '辰戌충'], [5, 11, '巳亥충'],
];

// ── 지지 형(地支刑) ──
const BRANCH_PUNISHMENT: [number, number, string][] = [
  [2, 5, '寅巳형(무은지형)'], [5, 8, '巳申형(무은지형)'], [2, 8, '寅申형(무은지형)'],
  [1, 10, '丑戌형(지세지형)'], [10, 7, '戌未형(지세지형)'], [7, 1, '未丑형(지세지형)'],
  [0, 3, '子卯형(무례지형)'], [3, 0, '卯子형(무례지형)'],
  [4, 4, '辰辰형(자형)'], [6, 6, '午午형(자형)'], [9, 9, '酉酉형(자형)'], [11, 11, '亥亥형(자형)'],
];

// ── 지지 파(地支破) ──
const BRANCH_HARM: [number, number, string][] = [
  [0, 9, '子酉파'], [1, 4, '丑辰파'], [2, 11, '寅亥파'],
  [3, 6, '卯午파'], [5, 8, '巳申파'], [7, 10, '未戌파'],
];

// ── 지지 해(地支害) ──
const BRANCH_DESTRUCTION: [number, number, string][] = [
  [0, 7, '子未해'], [1, 6, '丑午해'], [2, 5, '寅巳해'],
  [3, 4, '卯辰해'], [8, 11, '申亥해'], [9, 10, '酉戌해'],
];

// ── 삼합(三合) ──
// 寅午戌=화국, 申子辰=수국, 巳酉丑=금국, 亥卯未=목국
const TRIPLE_GROUPS: [number[], string][] = [
  [[2, 6, 10], '寅午戌 삼합(화국)'],
  [[8, 0, 4], '申子辰 삼합(수국)'],
  [[5, 9, 1], '巳酉丑 삼합(금국)'],
  [[11, 3, 7], '亥卯未 삼합(목국)'],
];

// ── 방합(方合) ──
// 寅卯辰=동방목국, 巳午未=남방화국, 申酉戌=서방금국, 亥子丑=북방수국
const DIRECTIONAL_GROUPS: [number[], string][] = [
  [[2, 3, 4], '寅卯辰 방합(동방목국)'],
  [[5, 6, 7], '巳午未 방합(남방화국)'],
  [[8, 9, 10], '申酉戌 방합(서방금국)'],
  [[11, 0, 1], '亥子丑 방합(북방수국)'],
];

// ── 절기 데이터 ──
// 각 월의 절입 시기 (월의 시작 절기)
// 1월: 입춘(2/4경), 2월: 경칩(3/6경), 3월: 청명(4/5경), ...
// 월주 계산용 절기 기준일 (양력 기준 대략적인 날짜)
const JEOLGI_DATES: [number, number][] = [
  [2, 4],   // 1월 (인월): 입춘 ~2/4
  [3, 6],   // 2월 (묘월): 경칩 ~3/6
  [4, 5],   // 3월 (진월): 청명 ~4/5
  [5, 6],   // 4월 (사월): 입하 ~5/6
  [6, 6],   // 5월 (오월): 망종 ~6/6
  [7, 7],   // 6월 (미월): 소서 ~7/7
  [8, 7],   // 7월 (신월): 입추 ~8/7
  [9, 8],   // 8월 (유월): 백로 ~9/8
  [10, 8],  // 9월 (술월): 한로 ~10/8
  [11, 7],  // 10월 (해월): 입동 ~11/7
  [12, 7],  // 11월 (자월): 대설 ~12/7
  [1, 6],   // 12월 (축월): 소한 ~1/6
];

// ── 60갑자 ──
function getGanzi60(): string[] {
  const result: string[] = [];
  for (let i = 0; i < 60; i++) {
    result.push(STEMS_HANJA[i % 10] + BRANCHES_HANJA[i % 12]);
  }
  return result;
}

const GANZI_60 = getGanzi60();

// ──────────────────────────────────────────────
// 유틸리티 함수
// ──────────────────────────────────────────────

/** 한자 → 한글 변환 */
export function toHangul(hanja: string): string {
  let result = '';
  for (const ch of hanja) {
    const stemIdx = (STEMS_HANJA as readonly string[]).indexOf(ch);
    if (stemIdx >= 0) { result += STEMS_HANGUL[stemIdx]; continue; }
    const branchIdx = (BRANCHES_HANJA as readonly string[]).indexOf(ch);
    if (branchIdx >= 0) { result += BRANCHES_HANGUL[branchIdx]; continue; }
    result += ch;
  }
  return result;
}

/** 한글 → 한자 변환 */
function toHanja(hangul: string): string {
  let result = '';
  for (const ch of hangul) {
    const stemIdx = (STEMS_HANGUL as readonly string[]).indexOf(ch);
    if (stemIdx >= 0) { result += STEMS_HANJA[stemIdx]; continue; }
    const branchIdx = (BRANCHES_HANGUL as readonly string[]).indexOf(ch);
    if (branchIdx >= 0) { result += BRANCHES_HANJA[branchIdx]; continue; }
    result += ch;
  }
  return result;
}

/** 천간 한자의 인덱스 반환 */
function stemIndex(ch: string): number {
  let idx = (STEMS_HANJA as readonly string[]).indexOf(ch);
  if (idx >= 0) return idx;
  idx = (STEMS_HANGUL as readonly string[]).indexOf(ch);
  return idx;
}

/** 지지 한자의 인덱스 반환 */
function branchIndex(ch: string): number {
  let idx = (BRANCHES_HANJA as readonly string[]).indexOf(ch);
  if (idx >= 0) return idx;
  idx = (BRANCHES_HANGUL as readonly string[]).indexOf(ch);
  return idx;
}

/** manseryeok의 오행 문자열을 Element로 변환 */
function toElement(korElement: string): Element {
  return ELEMENT_MAP[korElement] ?? 'earth';
}

/** manseryeok의 음양 문자열을 YinYang으로 변환 */
function toYinYang(korYinYang: string): YinYang {
  return YINYANG_MAP[korYinYang] ?? 'yang';
}

// ──────────────────────────────────────────────
// 핵심 계산 함수
// ──────────────────────────────────────────────

// ── JDN(줄리안 날짜 수) 기반 일진 계산 ──
// 기준: 2000-01-07 = 甲子일 (JDN 2451551)
const JDN_JIAZI_REF = 2451551; // 2000-01-07 甲子일

function julianDayNumber(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2
    + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

/** 시간 → 지지 인덱스 (23시는 子시가 아니라 아직 亥시) */
function hourToBranchIndex(hour: number, minute: number = 0): number {
  // @orrery/core 호환 시진 경계 — 홀수시 30분에 전환
  // 예: 03:00~03:29 = 丑시, 03:30~ = 寅시
  // 23:00~23:29 = 亥시, 23:30~ = 子시
  const totalMinutes = hour * 60 + minute;
  if (totalMinutes < 90) return 0;            // ~01:29 = 子시
  if (totalMinutes < 210) return 1;           // 01:30~03:29 = 丑시
  if (totalMinutes < 330) return 2;           // 03:30~05:29 = 寅시
  if (totalMinutes < 450) return 3;           // 05:30~07:29 = 卯시
  if (totalMinutes < 570) return 4;           // 07:30~09:29 = 辰시
  if (totalMinutes < 690) return 5;           // 09:30~11:29 = 巳시
  if (totalMinutes < 810) return 6;           // 11:30~13:29 = 午시
  if (totalMinutes < 930) return 7;           // 13:30~15:29 = 未시
  if (totalMinutes < 1050) return 8;          // 15:30~17:29 = 申시
  if (totalMinutes < 1170) return 9;          // 17:30~19:29 = 酉시
  if (totalMinutes < 1290) return 10;         // 19:30~21:29 = 戌시
  if (totalMinutes < 1410) return 11;         // 21:30~23:29 = 亥시
  return 0;                                   // 23:30~ = 子시
}

/** 월간 천간인덱스 계산 */
function monthStemIndex(yearStemIdx: number, monthBranchIdx: number): number {
  const inMonthStem = (yearStemIdx % 5) * 2 + 2; // 인월(寅月) 천간 시작
  const monthOffset = (monthBranchIdx - 2 + 12) % 12; // 인월로부터의 거리
  return (inMonthStem + monthOffset) % 10;
}

/** 시간 천간인덱스 계산 */
function hourStemIndex(dayStemIdx: number, hourBranchIdx: number): number {
  return ((dayStemIdx % 5) * 2 + hourBranchIdx) % 10;
}

/**
 * 양력 날짜 기준으로 사주 절기 월과 사주 연도를 결정
 *
 * 절기 순서 (양력 기준):
 *  소한(1/6) → 입춘(2/4) → 경칩(3/6) → 청명(4/5) → 입하(5/6) → 망종(6/6) →
 *  소서(7/7) → 입추(8/7) → 백로(9/8) → 한로(10/8) → 입동(11/7) → 대설(12/7)
 *
 * 양력 날짜 순으로 재배열하여 올바르게 비교합니다.
 */
function getSajuYearAndMonthBranch(year: number, month: number, day: number): { sajuYear: number; monthBranchIdx: number } {
  // 양력 순서로 정렬된 절기 테이블: [양력월, 양력일, 절기 인월 기준 오프셋(인=0,묘=1,...,축=11)]
  // 소한(1/6)=축월(11), 입춘(2/4)=인월(0), 경칩(3/6)=묘월(1), ...
  const SORTED_JEOLGI: [number, number, number][] = [
    [1, 6, 11],   // 소한 → 축월
    [2, 4, 0],    // 입춘 → 인월
    [3, 6, 1],    // 경칩 → 묘월
    [4, 5, 2],    // 청명 → 진월
    [5, 6, 3],    // 입하 → 사월
    [6, 6, 4],    // 망종 → 오월
    [7, 7, 5],    // 소서 → 미월
    [8, 7, 6],    // 입추 → 신월
    [9, 8, 7],    // 백로 → 유월
    [10, 8, 8],   // 한로 → 술월
    [11, 7, 9],   // 입동 → 해월
    [12, 7, 10],  // 대설 → 자월
  ];

  // 지지 매핑: 오프셋 → 지지인덱스 (인=2, 묘=3, ..., 자=0, 축=1)
  const branchMap = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];

  // 역순으로 검색: 현재 날짜 이전의 가장 가까운 절기를 찾음
  let offsetIdx = -1;
  for (let i = SORTED_JEOLGI.length - 1; i >= 0; i--) {
    const [jm, jd] = SORTED_JEOLGI[i];
    if (month > jm || (month === jm && day >= jd)) {
      offsetIdx = i;
      break;
    }
  }

  // 1월 6일 이전이면 전년도 대설(12/7) 이후 = 자월(10)
  // 하지만 실제로는 전년도 축월은 아님 — 이건 소한 전이므로 전년도 자월
  let monthOffset: number;
  if (offsetIdx < 0) {
    // 소한(1/6) 이전 → 전년도 자월(대설 12/7 이후)
    monthOffset = 10; // 자월
  } else {
    monthOffset = SORTED_JEOLGI[offsetIdx][2];
  }

  const monthBranchIdx = branchMap[monthOffset];

  // 사주 연도: 입춘(2/4) 기준
  let sajuYear = year;
  if (month < 2 || (month === 2 && day < 4)) {
    sajuYear = year - 1;
  }

  return { sajuYear, monthBranchIdx };
}

/**
 * 사주 사기둥 계산 (직접 구현 — 절기 기반)
 * @returns [년주, 월주, 일주, 시주] 간지 한자 문자열 배열
 */
export function getFourPillars(
  year: number, month: number, day: number, hour: number, minute: number
): [string, string, string, string] {
  // 1. 절기 기반 사주 연도와 월 지지 결정
  const { sajuYear, monthBranchIdx } = getSajuYearAndMonthBranch(year, month, day);

  // 2. 년주: (년-4) % 60
  const yearStemIdx = ((sajuYear - 4) % 10 + 10) % 10;
  const yearBranchIdx = ((sajuYear - 4) % 12 + 12) % 12;
  const yearGanzi = STEMS_HANJA[yearStemIdx] + BRANCHES_HANJA[yearBranchIdx];

  // 3. 월주
  const mStemIdx = monthStemIndex(yearStemIdx, monthBranchIdx);
  const monthGanzi = STEMS_HANJA[mStemIdx] + BRANCHES_HANJA[monthBranchIdx];

  // 4. 일주 (JDN 기반)
  const jdn = julianDayNumber(year, month, day);
  const dayGanziIdx = ((jdn - JDN_JIAZI_REF) % 60 + 60) % 60;
  const dayStemIdx = dayGanziIdx % 10;
  const dayBranchIdx = dayGanziIdx % 12;
  const dayGanzi = STEMS_HANJA[dayStemIdx] + BRANCHES_HANJA[dayBranchIdx];

  // 5. 시주
  const hBranchIdx = hourToBranchIndex(hour, minute);
  const hStemIdx = hourStemIndex(dayStemIdx, hBranchIdx);
  const hourGanzi = STEMS_HANJA[hStemIdx] + BRANCHES_HANJA[hBranchIdx];

  return [yearGanzi, monthGanzi, dayGanzi, hourGanzi];
}

/**
 * 십신(十神) 계산
 * @param dayStem - 일간 (한자 또는 한글)
 * @param targetStem - 대상 천간 (한자 또는 한글)
 * @returns 십신 이름
 */
export function getRelation(dayStem: string, targetStem: string): string | null {
  const dayIdx = stemIndex(dayStem);
  const targetIdx = stemIndex(targetStem);
  if (dayIdx < 0 || targetIdx < 0) return null;

  const dayElement = STEM_ELEMENT[dayIdx];
  const targetElement = STEM_ELEMENT[targetIdx];
  const dayYY = STEM_YINYANG[dayIdx];
  const targetYY = STEM_YINYANG[targetIdx];

  const relation = getOhangRelation(dayElement, targetElement);
  const sameYY = dayYY === targetYY;
  return getSipsinName(relation, sameYY);
}

/**
 * 지장간(支藏干) 반환
 * @param branch - 지지 한자 또는 한글
 * @returns 지장간 문자열 (한자)
 */
export function getHiddenStems(branch: string): string {
  const idx = branchIndex(branch);
  if (idx < 0) return '';
  return HIDDEN_STEMS_TABLE[idx].join('');
}

/**
 * 12운성(十二運星) 계산
 * @param stem - 천간 (한자 또는 한글)
 * @param branch - 지지 (한자 또는 한글)
 */
export function getTwelveMeteor(stem: string, branch: string): string {
  const sIdx = stemIndex(stem);
  const bIdx = branchIndex(branch);
  if (sIdx < 0 || bIdx < 0) return '';
  const stageIdx = getUnseongIndex(sIdx, bIdx);
  const hangul = TWELVE_STAGES[stageIdx];
  return UNSEONG_HANJA[hangul] ?? hangul;
}

/**
 * 12신살(十二神殺) 계산
 * @param yearBranch - 연지 (한자 또는 한글)
 * @param targetBranch - 대상 지지
 */
export function getTwelveSpirit(yearBranch: string, targetBranch: string): string {
  const yearIdx = branchIndex(yearBranch);
  const targetIdx = branchIndex(targetBranch);
  if (yearIdx < 0 || targetIdx < 0) return '';

  const startIdx = getSpiritStartBranch(yearIdx);
  const spiritIdx = (targetIdx - startIdx + 12) % 12;
  return SPIRIT_NAMES[spiritIdx];
}

/**
 * 대운(大運) 계산
 *
 * 알고리즘:
 * 1. 년간(年干)의 음양 + 성별로 순행/역행 결정
 *    남양(男陽)/여음(女陰) = 순행, 남음(男陰)/여양(女陽) = 역행
 * 2. 월주를 기준으로 60갑자를 순/역으로 진행
 * 3. 대운 시작 나이 = 생일에서 다음(순행)/이전(역행) 절기까지 일수 ÷ 3 (내림)
 */
export function getDaewoon(
  isMale: boolean, year: number, month: number, day: number, hour: number, minute: number
): DaewoonItem[] {
  const [yearGanzi, monthGanzi, dayGanzi] = getFourPillars(year, month, day, hour, minute);

  // 년간의 음양으로 순행/역행 결정
  const yearStemIdx = stemIndex(yearGanzi[0]);
  const isYearStemYang = yearStemIdx % 2 === 0;
  // 순행: (남자 && 양년간) || (여자 && 음년간)
  const isForward = (isMale && isYearStemYang) || (!isMale && !isYearStemYang);

  // 월주의 60갑자 인덱스
  const monthGanziIdx = GANZI_60.indexOf(monthGanzi);

  // 대운 시작 나이 계산
  const startAge = calculateDaewoonStartAge(year, month, day, isForward);

  const result: DaewoonItem[] = [];
  const dayStemHanja = dayGanzi[0];

  for (let i = 1; i <= 10; i++) {
    const ganziIdx = isForward
      ? (monthGanziIdx + i) % 60
      : (monthGanziIdx - i + 60) % 60;
    const ganzi = GANZI_60[ganziIdx];
    const stem = ganzi[0];
    const branch = ganzi[1];
    const age = startAge + (i - 1) * 10;

    result.push({
      index: i,
      age,
      ganzi,
      stem,
      branch,
      startDate: new Date(year + age, 0, 1),
      stemSipsin: getRelation(dayStemHanja, stem) ?? '',
      branchSipsin: getRelation(dayStemHanja, HIDDEN_STEMS_TABLE[branchIndex(branch)]?.slice(-1)[0] ?? '') ?? '',
      unseong: getTwelveMeteor(dayStemHanja, branch),
    });
  }

  return result;
}

/** 양력 순서로 정렬된 절기 날짜 (대운 시작 나이 계산용) */
const JEOLGI_SORTED: [number, number][] = [
  [1, 6],   // 소한
  [2, 4],   // 입춘
  [3, 6],   // 경칩
  [4, 5],   // 청명
  [5, 6],   // 입하
  [6, 6],   // 망종
  [7, 7],   // 소서
  [8, 7],   // 입추
  [9, 8],   // 백로
  [10, 8],  // 한로
  [11, 7],  // 입동
  [12, 7],  // 대설
];

/**
 * 대운 시작 나이 계산
 * 생일에서 다음(순행)/이전(역행) 절기까지의 일수를 3으로 나눈 값 (내림)
 */
function calculateDaewoonStartAge(year: number, month: number, day: number, isForward: boolean): number {
  const birthDate = new Date(year, month - 1, day);

  if (isForward) {
    // 순행: 다음 절기까지의 일수
    let found = false;
    for (const [jm, jd] of JEOLGI_SORTED) {
      if (jm > month || (jm === month && jd > day)) {
        const jeolgiDate = new Date(year, jm - 1, jd);
        const diffDays = Math.round((jeolgiDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        return Math.floor(Math.abs(diffDays) / 3);
      }
    }
    // 12월 대설 이후 → 내년 소한
    const jeolgiDate = new Date(year + 1, 0, 6); // 1/6 소한
    const diffDays = Math.round((jeolgiDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(Math.abs(diffDays) / 3);
  } else {
    // 역행: 이전 절기까지의 일수
    for (let i = JEOLGI_SORTED.length - 1; i >= 0; i--) {
      const [jm, jd] = JEOLGI_SORTED[i];
      if (jm < month || (jm === month && jd <= day)) {
        const jeolgiDate = new Date(year, jm - 1, jd);
        const diffDays = Math.round((birthDate.getTime() - jeolgiDate.getTime()) / (1000 * 60 * 60 * 24));
        return Math.floor(Math.abs(diffDays) / 3);
      }
    }
    // 소한(1/6) 이전 → 작년 대설
    const jeolgiDate = new Date(year - 1, 11, 7); // 12/7 대설
    const diffDays = Math.round((birthDate.getTime() - jeolgiDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(Math.abs(diffDays) / 3);
  }
}

// ──────────────────────────────────────────────
// 관계 분석 (합충형파해)
// ──────────────────────────────────────────────

function analyzeRelations(pillarGanzis: string[]): SajuResult['relations'] {
  const pairs = new Map<string, PairRelation>();
  const triple: RelationItem[] = [];
  const directional: RelationItem[] = [];

  // 4기둥의 천간/지지 인덱스
  const stemIndices = pillarGanzis.map(g => stemIndex(g[0]));
  const branchIndices = pillarGanzis.map(g => branchIndex(g[1]));

  // 쌍별 관계 분석
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const key = `${i},${j}`;
      const stemRels: RelationItem[] = [];
      const branchRels: RelationItem[] = [];

      // 천간 합
      for (const [a, b, detail] of STEM_COMBINE) {
        if ((stemIndices[i] === a && stemIndices[j] === b) ||
            (stemIndices[i] === b && stemIndices[j] === a)) {
          stemRels.push({ type: '합', detail });
        }
      }

      // 천간 충
      for (const [a, b, detail] of STEM_CLASH) {
        if ((stemIndices[i] === a && stemIndices[j] === b) ||
            (stemIndices[i] === b && stemIndices[j] === a)) {
          stemRels.push({ type: '충', detail });
        }
      }

      // 지지 육합
      for (const [a, b, detail] of BRANCH_COMBINE) {
        if ((branchIndices[i] === a && branchIndices[j] === b) ||
            (branchIndices[i] === b && branchIndices[j] === a)) {
          branchRels.push({ type: '합', detail });
        }
      }

      // 지지 충
      for (const [a, b, detail] of BRANCH_CLASH) {
        if ((branchIndices[i] === a && branchIndices[j] === b) ||
            (branchIndices[i] === b && branchIndices[j] === a)) {
          branchRels.push({ type: '충', detail });
        }
      }

      // 지지 형
      for (const [a, b, detail] of BRANCH_PUNISHMENT) {
        if (branchIndices[i] === a && branchIndices[j] === b) {
          branchRels.push({ type: '형', detail });
        }
      }

      // 지지 파
      for (const [a, b, detail] of BRANCH_HARM) {
        if ((branchIndices[i] === a && branchIndices[j] === b) ||
            (branchIndices[i] === b && branchIndices[j] === a)) {
          branchRels.push({ type: '파', detail });
        }
      }

      // 지지 해
      for (const [a, b, detail] of BRANCH_DESTRUCTION) {
        if ((branchIndices[i] === a && branchIndices[j] === b) ||
            (branchIndices[i] === b && branchIndices[j] === a)) {
          branchRels.push({ type: '해', detail });
        }
      }

      if (stemRels.length > 0 || branchRels.length > 0) {
        pairs.set(key, { stem: stemRels, branch: branchRels });
      }
    }
  }

  // 삼합 검사
  for (const [group, detail] of TRIPLE_GROUPS) {
    const branchSet = new Set(branchIndices);
    if (group.every(b => branchSet.has(b))) {
      triple.push({ type: '삼합', detail });
    }
  }

  // 방합 검사
  for (const [group, detail] of DIRECTIONAL_GROUPS) {
    const branchSet = new Set(branchIndices);
    if (group.every(b => branchSet.has(b))) {
      directional.push({ type: '방합', detail });
    }
  }

  return { pairs, triple, directional };
}

// ──────────────────────────────────────────────
// 특수 신살
// ──────────────────────────────────────────────

function analyzeSpecialSals(pillarGanzis: string[]): SajuResult['specialSals'] {
  const dayStemIdx = stemIndex(pillarGanzis[1][0]); // 일간
  const branchIndicesArr = pillarGanzis.map(g => branchIndex(g[1]));

  // 양인살: 일간의 건록 다음 지지에 해당하는 기둥
  // 양간만 해당. 양인 = 건록 + 1
  const yangin: number[] = [];
  if (dayStemIdx % 2 === 0) { // 양간
    const yanginBranch = (UNSEONG_START[dayStemIdx] + 3 + 1) % 12; // 건록(3) + 1
    // 정정: 12운성에서 건록은 index 3 → 양인은 제왕(index 4)의 지지
    const yanginBranchCorrect = getYanginBranch(dayStemIdx);
    branchIndicesArr.forEach((bi, i) => {
      if (bi === yanginBranchCorrect) yangin.push(i);
    });
  }

  // 괴강살: 일주가 庚辰, 庚戌, 壬辰, 壬戌
  const dayGanzi = pillarGanzis[1];
  const goegang = ['庚辰', '庚戌', '壬辰', '壬戌'].includes(dayGanzi);

  // 백호살: 간단히 일지가 寅(호랑이)인 경우를 기본으로
  // 실제로는 연지 기준 특정 조합이지만, 간소화
  const baekho = checkBaekho(branchIndicesArr[3], branchIndicesArr[1]); // 연지, 일지

  return { yangin, baekho, goegang };
}

/** 양인살 지지 계산 */
function getYanginBranch(stemIdx: number): number {
  // 양간의 양인 위치 (제왕 지지)
  // 甲→卯(3), 丙→午(6), 戊→午(6), 庚→酉(9), 壬→子(0)
  const map: Record<number, number> = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };
  return map[stemIdx] ?? -1;
}

/** 백호살 체크 (연지-일지 조합) */
function checkBaekho(yearBranchIdx: number, dayBranchIdx: number): boolean {
  // 연지 기준 백호살 지지: 子→午, 丑→未, 寅→申, 卯→酉, 辰→戌, 巳→亥, ...
  // 간소화: 충 관계에 있으면 백호로 판단
  return Math.abs(yearBranchIdx - dayBranchIdx) === 6 ||
         Math.abs(yearBranchIdx - dayBranchIdx) === 6;
}

// ──────────────────────────────────────────────
// 메인 계산 함수
// ──────────────────────────────────────────────

/**
 * 사주팔자 종합 계산
 *
 * manseryeok 패키지로 기본 사주(연월일시 사기둥)를 계산하고,
 * 십신/12운성/12신살/지장간/합충형파해/대운을 독립 구현하여 추가합니다.
 */
export function calculateSaju(input: BirthInput): SajuResult {
  const { year, month, day, hour, minute, gender } = input;
  const isMale = gender === 'male' || gender === 'M';

  // 1. 기본 사주 계산 (절기 기반 직접 계산)
  const [yearGanzi, monthGanzi, dayGanzi, hourGanzi] = getFourPillars(year, month, day, hour, minute);

  // 간지 문자열 배열 [시주, 일주, 월주, 연주] — 테스트 호환 순서
  const ganziArr = [hourGanzi, dayGanzi, monthGanzi, yearGanzi];

  // 일간 (일주의 천간)
  const dayStemHanja = ganziArr[1][0];

  // 2. 각 기둥별 상세 정보 구성
  const pillars = ganziArr.map((ganzi, i) => {
    const stem = ganzi[0]; // 천간 한자
    const branch = ganzi[1]; // 지지 한자
    const sIdx = stemIndex(stem);
    const bIdx = branchIndex(branch);

    const pillar: PillarDetail = {
      stem,
      branch,
      fullStem: STEMS_HANGUL[sIdx],
      fullBranch: BRANCHES_HANGUL[bIdx],
      ganzi,
      stemElement: STEM_ELEMENT[sIdx],
      branchElement: BRANCH_ELEMENT[bIdx],
      stemYinYang: STEM_YINYANG[sIdx],
    };

    // 천간 십신
    const stemSipsin = i === 1 ? '本元' : (getRelation(dayStemHanja, stem) ?? '');

    // 지지 십신 (지장간의 정기 기준)
    const hiddenStemsArr = HIDDEN_STEMS_TABLE[bIdx] ?? [];
    const jeonggi = hiddenStemsArr[hiddenStemsArr.length - 1] ?? '';
    const branchSipsin = getRelation(dayStemHanja, jeonggi) ?? '';

    // 12운성
    const unseong = getTwelveMeteor(dayStemHanja, branch);

    // 12신살 (연지 기준)
    const yearBranch = ganziArr[3][1]; // 연주의 지지
    const spirit = getTwelveSpirit(yearBranch, branch);

    return {
      pillar,
      stemSipsin,
      branchSipsin,
      unseong,
      spirit,
      hiddenStems: hiddenStemsArr,
      jigang: hiddenStemsArr.join(''),
    };
  });

  // 3. 대운 계산
  const daewoon = getDaewoon(isMale, year, month, day, hour, minute);

  // 4. 합충형파해 관계 분석
  const relations = analyzeRelations(ganziArr);

  // 5. 오행 분포 계산
  const ohang: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  ganziArr.forEach(ganzi => {
    const sElement = STEM_ELEMENT[stemIndex(ganzi[0])];
    const bElement = BRANCH_ELEMENT[branchIndex(ganzi[1])];
    ohang[sElement]++;
    ohang[bElement]++;
  });

  // 6. 특수 신살
  const specialSals = analyzeSpecialSals(ganziArr);

  return {
    input,
    pillars,
    daewoon,
    relations,
    ohang,
    specialSals,
  };
}

// ──────────────────────────────────────────────
// 자미두수 관련 타입/함수 (ziwei.ts에서 구현)
// ──────────────────────────────────────────────

export interface ZiweiChart {
  mingGongZhi: string;
  shenGongZhi: string;
  wuXingJu: { name: string; number: number };
  palaces: Record<string, ZiweiPalace>;
}

export interface ZiweiPalace {
  name: string;
  zhi: string;
  ganZhi: string;
  stars: ZiweiStar[];
  isShenGong?: boolean;
}

export interface ZiweiStar {
  name: string;
  brightness: string;
  siHua?: string;
}

export interface LiuNianInfo {
  year: number;
  stem: string;
  branch: string;
  mingGongZhi: string;
  natalPalaceAtMing: string;
  siHua: Record<string, string>;
  daxianPalaceName: string;
  daxianAgeStart: number;
  daxianAgeEnd: number;
}

export interface DaxianItem {
  ageStart: number;
  ageEnd: number;
  palaceName: string;
  ganZhi: string;
  mainStars: string[];
}

// ──────────────────────────────────────────────
// 서양 점성술 관련 타입
// ──────────────────────────────────────────────

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type PlanetId =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

export interface PlanetPosition {
  id: PlanetId;
  planet: PlanetId;
  sign: ZodiacSign;
  degree: number;
  degreeInSign: number;
  house: number;
  isRetrograde: boolean;
}

export interface NatalHouse {
  house: number;
  sign: ZodiacSign;
  degree: number;
}

export interface NatalAngles {
  asc: { sign: ZodiacSign; degree: number };
  mc: { sign: ZodiacSign; degree: number };
}

export interface NatalAspect {
  planet1: PlanetId;
  planet2: PlanetId;
  type: string;
  angle: number;
  orb: number;
}

export interface NatalChart {
  planets: PlanetPosition[];
  houses: NatalHouse[];
  angles: NatalAngles;
  aspects: NatalAspect[];
}

// ──────────────────────────────────────────────
// 자미두수/점성술 함수 - ziwei.ts와 natal.ts에서 import
// ──────────────────────────────────────────────

// 자미두수 (lazy import로 순환 의존성 방지)
export async function createChart(
  year: number, month: number, day: number, hour: number, minute: number, isMale: boolean
): Promise<ZiweiChart> {
  const { createChart: createZiweiChart } = await import('./ziwei');
  return createZiweiChart(year, month, day, hour, minute, isMale);
}

export async function calculateLiunian(chart: ZiweiChart, targetYear: number): Promise<LiuNianInfo> {
  const { calculateLiunian: calcLiunian } = await import('./ziwei');
  return calcLiunian(chart, targetYear);
}

export async function getDaxianList(chart: ZiweiChart): Promise<DaxianItem[]> {
  const { getDaxianList: getDaxian } = await import('./ziwei');
  return getDaxian(chart);
}

// 서양 점성술
export async function calculateNatal(opts: {
  year: number; month: number; day: number;
  hour: number; minute: number; gender: Gender;
  latitude?: number; longitude?: number;
}): Promise<NatalChart> {
  const { calculateNatal: calcNatal } = await import('./natal');
  return calcNatal(opts);
}

export const ZODIAC_KO: Record<ZodiacSign, string> = {
  Aries: '양자리', Taurus: '황소자리', Gemini: '쌍둥이자리', Cancer: '게자리',
  Leo: '사자자리', Virgo: '처녀자리', Libra: '천칭자리', Scorpio: '전갈자리',
  Sagittarius: '사수자리', Capricorn: '염소자리', Aquarius: '물병자리', Pisces: '물고기자리',
};

export const PLANET_KO: Record<PlanetId, string> = {
  Sun: '태양', Moon: '달', Mercury: '수성', Venus: '금성', Mars: '화성',
  Jupiter: '목성', Saturn: '토성', Uranus: '천왕성', Neptune: '해왕성', Pluto: '명왕성',
};
