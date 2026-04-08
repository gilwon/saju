/**
 * 원본 @orrery/core vs 새 엔진 비교 테스트
 * 실행: node scripts/compare-engines.mjs
 */

// ditfinder의 @orrery/core 직접 import (ESM)
const orreryPath = '/Users/browoo/Documents/ditfinder/node_modules/@orrery/core/dist/index.js';
const orrery = await import(orreryPath);

const testCases = [
  { label: '1993-03-12 09:45 남', year: 1993, month: 3, day: 12, hour: 9, minute: 45, gender: 'M' },
  { label: '1990-01-15 06:30 여', year: 1990, month: 1, day: 15, hour: 6, minute: 30, gender: 'F' },
  { label: '1985-08-20 23:00 남', year: 1985, month: 8, day: 20, hour: 23, minute: 0, gender: 'M' },
  { label: '2000-12-31 12:00 여', year: 2000, month: 12, day: 31, hour: 12, minute: 0, gender: 'F' },
  { label: '1975-05-05 03:15 남', year: 1975, month: 5, day: 5, hour: 3, minute: 15, gender: 'M' },
  { label: '1988-06-15 14:30 여', year: 1988, month: 6, day: 15, hour: 14, minute: 30, gender: 'F' },
];

console.log('='.repeat(80));
console.log('🔍 @orrery/core 원본 엔진 출력 수집');
console.log('='.repeat(80));

// ── 1. getFourPillars ──
console.log('\n📋 1. getFourPillars (사주 4주)');
console.log('-'.repeat(60));

for (const tc of testCases) {
  try {
    const result = orrery.getFourPillars(tc.year, tc.month, tc.day, tc.hour, tc.minute);
    console.log(`  [${tc.label}] → ${JSON.stringify(result)}`);
  } catch (e) {
    console.log(`  [${tc.label}] 에러: ${e.message}`);
  }
}

// ── 2. calculateSaju ──
console.log('\n📋 2. calculateSaju (전체 분석)');
console.log('-'.repeat(60));

for (const tc of testCases) {
  try {
    const result = orrery.calculateSaju({
      year: tc.year, month: tc.month, day: tc.day,
      hour: tc.hour, minute: tc.minute, gender: tc.gender,
    });

    console.log(`\n  [${tc.label}]`);
    const names = ['시주', '일주', '월주', '년주'];
    for (let i = 0; i < (result.pillars?.length || 0); i++) {
      const p = result.pillars[i];
      if (p?.pillar) {
        console.log(`    ${names[i]}: ${p.pillar.ganzi} 십신:${p.stemSipsin||'-'}/${p.branchSipsin||'-'} 운성:${p.unseong||'-'}`);
      }
    }
    if (result.daewoon?.length > 0) {
      console.log(`    대운: ${result.daewoon.slice(0,5).map(d => `${d.ganzi}(${d.age}세)`).join(', ')}`);
    }
    if (result.ohang) {
      console.log(`    오행: 목${result.ohang.wood||0} 화${result.ohang.fire||0} 토${result.ohang.earth||0} 금${result.ohang.metal||0} 수${result.ohang.water||0}`);
    }
  } catch (e) {
    console.log(`  [${tc.label}] 에러: ${e.message}`);
  }
}

// ── 3. 자미두수 ──
console.log('\n📋 3. createChart (자미두수)');
console.log('-'.repeat(60));

for (const tc of testCases.slice(0, 3)) {
  try {
    const chart = orrery.createChart(tc.year, tc.month, tc.day, tc.hour, tc.minute, tc.gender === 'M');
    console.log(`\n  [${tc.label}]`);
    console.log(`    명궁:${chart.mingGongZhi} 신궁:${chart.shenGongZhi} 오행국:${chart.wuXingJu?.name}`);
  } catch (e) {
    console.log(`  [${tc.label}] 에러: ${e.message}`);
  }
}

// ── 4. 점성술 ──
console.log('\n📋 4. calculateNatal (점성술)');
console.log('-'.repeat(60));

for (const tc of testCases.slice(0, 3)) {
  try {
    const natal = orrery.calculateNatal({
      year: tc.year, month: tc.month, day: tc.day,
      hour: tc.hour, minute: tc.minute, gender: tc.gender,
    });
    console.log(`\n  [${tc.label}]`);
    if (natal.planets) {
      for (const p of natal.planets.slice(0, 3)) {
        const sign = orrery.ZODIAC_KO?.[p.sign] || p.sign;
        console.log(`    ${orrery.PLANET_KO?.[p.id] || p.id}: ${sign} ${p.degree?.toFixed(2)}°`);
      }
    }
  } catch (e) {
    console.log(`  [${tc.label}] 에러: ${e.message}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('원본 출력 수집 완료');
console.log('='.repeat(80));
