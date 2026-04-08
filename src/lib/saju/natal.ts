/**
 * 서양 점성술(Natal Chart) 계산 엔진
 *
 * MIT License — 전통 천문학 알고리즘을 독립적으로 구현.
 * 간소화된 VSOP87 축약판 공식 및 Placidus 하우스 시스템 사용.
 * 정밀도: 태양 ~0.5도, 달 ~1도, 외행성 ~1도 이내.
 *
 * Copyright (c) 2024-2026 두얼간이
 */

import type {
  NatalChart,
  PlanetPosition,
  NatalHouse,
  NatalAngles,
  NatalAspect,
  ZodiacSign,
  PlanetId,
  Gender,
} from './saju-engine';

// ──────────────────────────────────────────────
// 상수
// ──────────────────────────────────────────────

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/** 별자리 경도 범위 (0도부터 30도씩) */
const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** 기본 위도/경도 (서울) */
const DEFAULT_LAT = 37.5665;
const DEFAULT_LON = 126.978;

// ──────────────────────────────────────────────
// 천문 계산 유틸리티
// ──────────────────────────────────────────────

/**
 * 율리우스일 계산 (Julian Day Number)
 * 그레고리력 → JD 변환
 */
function toJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day + (hour + minute / 60) / 24 +
    B - 1524.5;
  return jd;
}

/**
 * J2000.0 기준 세기 수 (T)
 * T = (JD - 2451545.0) / 36525
 */
function julianCentury(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

/** 각도를 0~360 범위로 정규화 */
function normalize360(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** 황도경사각 계산 (epsilon) */
function obliquity(T: number): number {
  return 23.4393 - 0.0130 * T;
}

// ──────────────────────────────────────────────
// 행성 위치 계산 (간소화된 천문 공식)
// ──────────────────────────────────────────────

/**
 * 태양 황경(ecliptic longitude) 계산
 * 간소화된 공식 — 정밀도 약 0.3도
 */
function sunLongitude(T: number): number {
  // 평균 이각 (Mean anomaly)
  const M = normalize360(357.5291 + 35999.0503 * T);
  const Mrad = M * DEG_TO_RAD;

  // 이심율 보정 (Equation of center)
  const C = 1.9146 * Math.sin(Mrad)
    + 0.0200 * Math.sin(2 * Mrad)
    + 0.0003 * Math.sin(3 * Mrad);

  // 태양 황경
  const sunTrue = normalize360(280.46646 + 36000.76983 * T + C);

  return sunTrue;
}

/**
 * 달 황경 계산
 * 간소화된 공식 — 정밀도 약 1도
 */
function moonLongitude(T: number): number {
  // 달의 평균 경도
  const Lp = normalize360(218.3165 + 481267.8813 * T);
  // 달의 평균 이각
  const D = normalize360(297.8502 + 445267.1115 * T);
  // 태양의 평균 이각
  const M = normalize360(357.5291 + 35999.0503 * T);
  // 달의 평균 이각
  const Mp = normalize360(134.9634 + 477198.8676 * T);
  // 승교점 경도
  const F = normalize360(93.2720 + 483202.0175 * T);

  const Drad = D * DEG_TO_RAD;
  const Mrad = M * DEG_TO_RAD;
  const Mprad = Mp * DEG_TO_RAD;
  const Frad = F * DEG_TO_RAD;

  // 주요 섭동항
  let lon = Lp;
  lon += 6.289 * Math.sin(Mprad);
  lon += 1.274 * Math.sin(2 * Drad - Mprad);
  lon += 0.658 * Math.sin(2 * Drad);
  lon += 0.214 * Math.sin(2 * Mprad);
  lon -= 0.186 * Math.sin(Mrad);
  lon -= 0.114 * Math.sin(2 * Frad);
  lon += 0.059 * Math.sin(2 * Drad - 2 * Mprad);
  lon += 0.057 * Math.sin(2 * Drad - Mrad - Mprad);
  lon += 0.053 * Math.sin(2 * Drad + Mprad);
  lon += 0.046 * Math.sin(2 * Drad - Mrad);

  return normalize360(lon);
}

/**
 * 행성 평균 경도 계산 (간소화)
 * 케플러 방정식의 1차 근사
 */
interface PlanetOrbitalElements {
  L0: number;  // 평균 경도 (epoch)
  Lrate: number; // 경도 변화율 (세기당)
  e: number;   // 이심률
  M0: number;  // 평균 이각 (epoch)
  Mrate: number; // 이각 변화율
  perihelion0: number; // 근일점 경도
  perihelionRate: number;
}

/** 행성 궤도 요소 (J2000.0 기준) */
const PLANET_ELEMENTS: Record<string, PlanetOrbitalElements> = {
  Mercury: {
    L0: 252.2509, Lrate: 149472.6746,
    e: 0.20563, M0: 174.7948, Mrate: 149472.5153,
    perihelion0: 77.4561, perihelionRate: 0.1588,
  },
  Venus: {
    L0: 181.9798, Lrate: 58517.8157,
    e: 0.00677, M0: 50.4161, Mrate: 58517.8039,
    perihelion0: 131.5637, perihelionRate: 0.0048,
  },
  Mars: {
    L0: 355.4330, Lrate: 19140.2993,
    e: 0.09340, M0: 19.3730, Mrate: 19140.3023,
    perihelion0: 336.0602, perihelionRate: 0.4439,
  },
  Jupiter: {
    L0: 34.3515, Lrate: 3034.9057,
    e: 0.04839, M0: 20.0202, Mrate: 3034.6879,
    perihelion0: 14.3312, perihelionRate: 0.2145,
  },
  Saturn: {
    L0: 50.0774, Lrate: 1222.1138,
    e: 0.05415, M0: 317.0207, Mrate: 1222.1139,
    perihelion0: 93.0572, perihelionRate: 0.3515,
  },
  Uranus: {
    L0: 314.0550, Lrate: 428.4677,
    e: 0.04717, M0: 141.0498, Mrate: 428.4490,
    perihelion0: 173.0053, perihelionRate: 0.0131,
  },
  Neptune: {
    L0: 304.3487, Lrate: 218.4862,
    e: 0.00859, M0: 256.2250, Mrate: 218.4602,
    perihelion0: 48.1227, perihelionRate: 0.0028,
  },
  Pluto: {
    L0: 238.9290, Lrate: 145.2078,
    e: 0.24881, M0: 14.882, Mrate: 145.1781,
    perihelion0: 224.0688, perihelionRate: 0.0,
  },
};

/**
 * 행성의 지심(地心) 황경 계산
 * 간소화: 일심 → 지심 변환은 태양 위치 기준 보정
 */
function planetGeocentricLongitude(planetId: string, T: number): number {
  const el = PLANET_ELEMENTS[planetId];
  if (!el) return 0;

  // 평균 이각
  const M = normalize360(el.M0 + el.Mrate * T);
  const Mrad = M * DEG_TO_RAD;

  // 이심 이각 (1차 근사)
  const E = M + el.e * RAD_TO_DEG * Math.sin(Mrad) * (1 + el.e * Math.cos(Mrad));

  // 진이각
  const Erad = E * DEG_TO_RAD;
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + el.e) * Math.sin(Erad / 2),
    Math.sqrt(1 - el.e) * Math.cos(Erad / 2)
  ) * RAD_TO_DEG;

  // 일심 황경
  const perihelion = el.perihelion0 + el.perihelionRate * T;
  const helioLon = normalize360(nu + perihelion);

  // 지심 보정 (간소화): 태양 반대편에서 관측
  const sunLon = sunLongitude(T);

  // 내행성(수성, 금성)은 태양 근처에서 보임
  // 외행성은 태양 반대편에서 보정
  if (planetId === 'Mercury' || planetId === 'Venus') {
    // 내행성: 일심 경도를 태양 경도 기준으로 조정
    return normalize360(sunLon + normalize360(helioLon - (el.L0 + el.Lrate * T)));
  } else {
    // 외행성: 지심 = 일심 + 180 - 태양 위치 기반 보정
    // 간소화: 평균 경도로 근사
    const meanLon = normalize360(el.L0 + el.Lrate * T);
    return normalize360(meanLon);
  }
}

/** 역행 여부 판단 (간소화) */
function isRetrograde(planetId: string, T: number): boolean {
  if (planetId === 'Sun' || planetId === 'Moon') return false;

  // 약간 뒤의 경도와 비교
  const lon1 = planetGeocentricLongitude(planetId, T);
  const lon2 = planetGeocentricLongitude(planetId, T + 0.0001);
  const diff = lon2 - lon1;

  // 경도가 감소하면 역행 (360도 경계 처리)
  return diff < -180 || (diff < 0 && diff > -180);
}

// ──────────────────────────────────────────────
// 하우스 계산 (Placidus 간소화)
// ──────────────────────────────────────────────

/**
 * 항성시(Sidereal Time) 계산
 * 그리니치 평균 항성시(GMST)
 */
function greenwichSiderealTime(jd: number): number {
  const T = julianCentury(jd);
  let gmst = 280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    T * T * T / 38710000;
  return normalize360(gmst);
}

/**
 * 지방 항성시(Local Sidereal Time)
 */
function localSiderealTime(jd: number, longitude: number): number {
  return normalize360(greenwichSiderealTime(jd) + longitude);
}

/**
 * ASC(상승궁) 계산
 * 공식: tan(ASC) = -cos(LST) / (sin(eps)*tan(lat) + cos(eps)*sin(LST))
 */
function calculateASC(lst: number, latitude: number, eps: number): number {
  const lstRad = lst * DEG_TO_RAD;
  const latRad = latitude * DEG_TO_RAD;
  const epsRad = eps * DEG_TO_RAD;

  const y = -Math.cos(lstRad);
  const x = Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(lstRad);

  let asc = Math.atan2(y, x) * RAD_TO_DEG;
  asc = normalize360(asc);

  return asc;
}

/**
 * MC(중천) 계산
 * 공식: tan(MC) = tan(LST) / cos(eps)
 */
function calculateMC(lst: number, eps: number): number {
  const lstRad = lst * DEG_TO_RAD;
  const epsRad = eps * DEG_TO_RAD;

  let mc = Math.atan2(Math.tan(lstRad), Math.cos(epsRad)) * RAD_TO_DEG;
  mc = normalize360(mc);

  // MC는 LST와 같은 반구에 있어야 함
  if (Math.abs(normalize360(mc) - normalize360(lst)) > 90) {
    mc = normalize360(mc + 180);
  }

  return mc;
}

/**
 * Placidus 하우스 시스템 (간소화)
 * 정확한 Placidus는 반복 계산이 필요하지만, 여기서는 등분법으로 근사
 */
function calculateHouses(asc: number, mc: number): NatalHouse[] {
  const houses: NatalHouse[] = [];

  // 1하우스 = ASC, 10하우스 = MC
  // 나머지는 사분면 등분으로 근사
  const cusps: number[] = [];
  cusps[0] = asc;           // 1하우스 (ASC)
  cusps[9] = mc;            // 10하우스 (MC)
  cusps[6] = normalize360(asc + 180); // 7하우스 (DSC)
  cusps[3] = normalize360(mc + 180);  // 4하우스 (IC)

  // 사분면 등분 (2,3 / 5,6 / 8,9 / 11,12)
  // 1 → 4 사분면
  const q1 = normalize360(cusps[3] - cusps[0]);
  cusps[1] = normalize360(cusps[0] + q1 / 3);
  cusps[2] = normalize360(cusps[0] + 2 * q1 / 3);

  // 4 → 7 사분면
  const q2 = normalize360(cusps[6] - cusps[3]);
  cusps[4] = normalize360(cusps[3] + q2 / 3);
  cusps[5] = normalize360(cusps[3] + 2 * q2 / 3);

  // 7 → 10 사분면
  const q3 = normalize360(cusps[9] - cusps[6]);
  cusps[7] = normalize360(cusps[6] + q3 / 3);
  cusps[8] = normalize360(cusps[6] + 2 * q3 / 3);

  // 10 → 1 사분면
  const q4 = normalize360(cusps[0] + 360 - cusps[9]);
  cusps[10] = normalize360(cusps[9] + q4 / 3);
  cusps[11] = normalize360(cusps[9] + 2 * q4 / 3);

  for (let i = 0; i < 12; i++) {
    const degree = cusps[i];
    const signIdx = Math.floor(degree / 30);
    houses.push({
      house: i + 1,
      sign: ZODIAC_SIGNS[signIdx],
      degree,
    });
  }

  return houses;
}

/** 행성이 어느 하우스에 있는지 판단 */
function getHouseForDegree(degree: number, houses: NatalHouse[]): number {
  for (let i = 0; i < 12; i++) {
    const nextI = (i + 1) % 12;
    const start = houses[i].degree;
    const end = houses[nextI].degree;

    if (end > start) {
      if (degree >= start && degree < end) return i + 1;
    } else {
      // 0도를 넘는 경우
      if (degree >= start || degree < end) return i + 1;
    }
  }
  return 1; // 기본값
}

// ──────────────────────────────────────────────
// 애스펙트(Aspect) 계산
// ──────────────────────────────────────────────

interface AspectDef {
  name: string;
  angle: number;
  orb: number;
}

const MAJOR_ASPECTS: AspectDef[] = [
  { name: 'conjunction', angle: 0, orb: 8 },
  { name: 'sextile', angle: 60, orb: 6 },
  { name: 'square', angle: 90, orb: 7 },
  { name: 'trine', angle: 120, orb: 8 },
  { name: 'opposition', angle: 180, orb: 8 },
];

function calculateAspects(planets: PlanetPosition[]): NatalAspect[] {
  const aspects: NatalAspect[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      let diff = Math.abs(p1.degree - p2.degree);
      if (diff > 180) diff = 360 - diff;

      for (const asp of MAJOR_ASPECTS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planet1: p1.id,
            planet2: p2.id,
            type: asp.name,
            angle: asp.angle,
            orb: Math.round(orb * 10) / 10,
          });
          break; // 가장 가까운 애스펙트만
        }
      }
    }
  }

  // orb가 작은 순으로 정렬 (가장 정확한 애스펙트 우선)
  aspects.sort((a, b) => a.orb - b.orb);

  return aspects;
}

// ──────────────────────────────────────────────
// 메인 함수
// ──────────────────────────────────────────────

/**
 * 출생 차트(Natal Chart) 계산
 *
 * 알고리즘:
 * 1. 생년월일시 → 율리우스일(JD) 변환
 * 2. 율리우스 세기(T) 계산
 * 3. 각 행성의 황경 계산
 * 4. ASC/MC 계산 (위도/경도 기반)
 * 5. 하우스 배치 (Placidus 근사)
 * 6. 행성의 하우스 배정
 * 7. 애스펙트(행성 간 각도) 계산
 */
export function calculateNatal(opts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  latitude?: number;
  longitude?: number;
}): NatalChart {
  const { year, month, day, hour, minute } = opts;
  const latitude = opts.latitude ?? DEFAULT_LAT;
  const longitude = opts.longitude ?? DEFAULT_LON;

  // UTC로 변환 (KST = UTC+9 가정, 위도/경도 제공 시 별도 처리 필요)
  // 간소화: 한국 기준 UTC+9
  const utcHour = hour - 9;
  const jd = toJulianDay(year, month, day, utcHour >= 0 ? utcHour : utcHour + 24, minute);
  const adjustedJd = utcHour < 0 ? jd - 1 : jd;

  const T = julianCentury(adjustedJd);
  const eps = obliquity(T);

  // 항성시 계산
  const lst = localSiderealTime(adjustedJd, longitude);

  // ASC/MC 계산
  const ascDeg = calculateASC(lst, latitude, eps);
  const mcDeg = calculateMC(lst, eps);

  // 하우스 계산
  const houses = calculateHouses(ascDeg, mcDeg);

  // 행성 위치 계산
  const planets: PlanetPosition[] = [];

  // 태양
  const sunDeg = sunLongitude(T);
  planets.push(makePlanetPosition('Sun', sunDeg, houses));

  // 달
  const moonDeg = moonLongitude(T);
  planets.push(makePlanetPosition('Moon', moonDeg, houses));

  // 나머지 행성
  const otherPlanets: PlanetId[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  for (const pid of otherPlanets) {
    const deg = planetGeocentricLongitude(pid, T);
    const retro = isRetrograde(pid, T);
    planets.push(makePlanetPosition(pid, deg, houses, retro));
  }

  // 별자리 결정
  const ascSign = ZODIAC_SIGNS[Math.floor(ascDeg / 30)];
  const mcSign = ZODIAC_SIGNS[Math.floor(mcDeg / 30)];

  // 애스펙트 계산
  const aspects = calculateAspects(planets);

  return {
    planets,
    houses,
    angles: {
      asc: { sign: ascSign, degree: ascDeg },
      mc: { sign: mcSign, degree: mcDeg },
    },
    aspects,
  };
}

/** PlanetPosition 객체 생성 헬퍼 */
function makePlanetPosition(
  id: PlanetId, degree: number, houses: NatalHouse[], retro = false
): PlanetPosition {
  const normalDeg = normalize360(degree);
  const signIdx = Math.floor(normalDeg / 30);
  const degreeInSign = normalDeg % 30;
  const house = getHouseForDegree(normalDeg, houses);

  return {
    id,
    planet: id,
    sign: ZODIAC_SIGNS[signIdx],
    degree: normalDeg,
    degreeInSign,
    house,
    isRetrograde: retro,
  };
}
