/**
 * 새 엔진 테스트 — 원본 @orrery/core 결과와 비교
 * 실행: npx tsx scripts/test-new-engine.mjs
 */

// dynamic import로 모든 모듈 로드
const engine = await import('../src/lib/saju/saju-engine.ts');
const ziwei = await import('../src/lib/saju/ziwei.ts');
const natal = await import('../src/lib/saju/natal.ts');

const { calculateSaju, getFourPillars, toHangul, ZODIAC_KO, PLANET_KO } = engine;
const { createChart } = ziwei;
const { calculateNatal } = natal;

const testCases = [
  { label: '1993-03-12 09:45 남', year: 1993, month: 3, day: 12, hour: 9, minute: 45, gender: 'M' },
  { label: '1990-01-15 06:30 여', year: 1990, month: 1, day: 15, hour: 6, minute: 30, gender: 'F' },
  { label: '1985-08-20 23:00 남', year: 1985, month: 8, day: 20, hour: 23, minute: 0, gender: 'M' },
  { label: '2000-12-31 12:00 여', year: 2000, month: 12, day: 31, hour: 12, minute: 0, gender: 'F' },
  { label: '1975-05-05 03:15 남', year: 1975, month: 5, day: 5, hour: 3, minute: 15, gender: 'M' },
  { label: '1988-06-15 14:30 여', year: 1988, month: 6, day: 15, hour: 14, minute: 30, gender: 'F' },
];

// 원본 @orrery/core 결과
const originalPillars = {
  '1993-03-12 09:45 남': ['癸酉','乙卯','壬辰','乙巳'],
  '1990-01-15 06:30 여': ['己巳','丁丑','庚辰','己卯'],
  '1985-08-20 23:00 남': ['乙丑','甲申','辛卯','己亥'],
  '2000-12-31 12:00 여': ['庚辰','戊子','癸亥','戊午'],
  '1975-05-05 03:15 남': ['乙卯','庚辰','辛亥','己丑'],
  '1988-06-15 14:30 여': ['戊辰','戊午','辛丑','乙未'],
};

const originalSaju = {
  '1993-03-12 09:45 남': {
    sipsin: [['傷官','偏財'], ['本元','偏官'], ['傷官','傷官'], ['劫財','正印']],
    unseong: ['絶', '墓', '死', '沐浴'],
    daewoon: ['甲寅(2세)', '癸丑(12세)', '壬子(22세)', '辛亥(32세)', '庚戌(42세)'],
  },
  '1990-01-15 06:30 여': {
    sipsin: [['正印','正財'], ['本元','偏印'], ['正官','正印'], ['正印','偏官']],
    unseong: ['胎', '養', '墓', '長生'],
    daewoon: ['戊寅(6세)', '己卯(16세)', '庚辰(26세)', '辛巳(36세)', '壬午(46세)'],
  },
  '1985-08-20 23:00 남': {
    sipsin: [['偏印','傷官'], ['本元','偏財'], ['正財','劫財'], ['偏財','偏印']],
    unseong: ['沐浴', '絶', '帝旺', '養'],
    daewoon: ['癸未(4세)', '壬午(14세)', '辛巳(24세)', '庚辰(34세)', '己卯(44세)'],
  },
};

const originalZiwei = {
  '1993-03-12 09:45 남': { ming: '戌', shen: '申', wuxing: '水二局' },
  '1990-01-15 06:30 여': { ming: '戌', shen: '辰', wuxing: '火六局' },
  '1985-08-20 23:00 남': { ming: '申', shen: '申', wuxing: '水二局' },
};

let totalTests = 0;
let passedTests = 0;

function check(name, expected, actual) {
  totalTests++;
  const pass = expected === actual;
  if (pass) {
    passedTests++;
    console.log(`    ✅ ${name}: ${actual}`);
  } else {
    console.log(`    ❌ ${name}: 기대=${expected}, 실제=${actual}`);
  }
  return pass;
}

console.log('='.repeat(80));
console.log('🧪 새 엔진 vs @orrery/core 비교 테스트');
console.log('='.repeat(80));

// ── 1. getFourPillars 비교 ──
console.log('\n📋 1. getFourPillars (4주 비교)');
console.log('-'.repeat(60));

for (const tc of testCases) {
  console.log(`\n  [${tc.label}]`);
  try {
    const result = getFourPillars(tc.year, tc.month, tc.day, tc.hour, tc.minute);
    const expected = originalPillars[tc.label];
    if (expected) {
      for (let i = 0; i < 4; i++) {
        const names = ['년주', '월주', '일주', '시주'];
        check(names[i], expected[i], result[i]);
      }
    }
  } catch (e) {
    console.log(`    에러: ${e.message}`);
  }
}

// ── 2. calculateSaju 비교 ──
console.log('\n\n📋 2. calculateSaju (십신/운성/대운)');
console.log('-'.repeat(60));

for (const tc of testCases.slice(0, 3)) {
  console.log(`\n  [${tc.label}]`);
  try {
    const result = calculateSaju({
      year: tc.year, month: tc.month, day: tc.day,
      hour: tc.hour, minute: tc.minute, gender: tc.gender,
    });

    const orig = originalSaju[tc.label];
    if (orig && result.pillars) {
      const names = ['시주', '일주', '월주', '년주'];
      for (let i = 0; i < Math.min(result.pillars.length, 4); i++) {
        const p = result.pillars[i];
        console.log(`    ${names[i]}: ${p.pillar?.ganzi} 십신:${p.stemSipsin}/${p.branchSipsin} 운성:${p.unseong}`);
        if (orig.sipsin?.[i]) {
          check(`${names[i]} 천간십신`, orig.sipsin[i][0], p.stemSipsin);
          check(`${names[i]} 지지십신`, orig.sipsin[i][1], p.branchSipsin);
        }
        if (orig.unseong?.[i]) {
          check(`${names[i]} 운성`, orig.unseong[i], p.unseong);
        }
      }
      if (orig.daewoon && result.daewoon) {
        console.log(`    대운:`);
        for (let i = 0; i < Math.min(orig.daewoon.length, result.daewoon.length); i++) {
          const newDw = `${result.daewoon[i].ganzi}(${result.daewoon[i].age}세)`;
          check(`대운${i+1}`, orig.daewoon[i], newDw);
        }
      }
    }
  } catch (e) {
    console.log(`    에러: ${e.message}`);
  }
}

// ── 3. 자미두수 비교 ──
console.log('\n\n📋 3. createChart (자미두수)');
console.log('-'.repeat(60));

for (const tc of testCases.slice(0, 3)) {
  console.log(`\n  [${tc.label}]`);
  try {
    const chart = createChart(tc.year, tc.month, tc.day, tc.hour, tc.minute, tc.gender === 'M');
    const orig = originalZiwei[tc.label];
    if (orig) {
      check('명궁', orig.ming, chart.mingGongZhi);
      check('신궁', orig.shen, chart.shenGongZhi);
      check('오행국', orig.wuxing, chart.wuXingJu?.name);
    }
  } catch (e) {
    console.log(`    에러: ${e.message}`);
  }
}

// ── 4. 점성술 ──
console.log('\n\n📋 4. calculateNatal (점성술)');
console.log('-'.repeat(60));

for (const tc of testCases.slice(0, 3)) {
  console.log(`\n  [${tc.label}]`);
  try {
    const result = calculateNatal({
      year: tc.year, month: tc.month, day: tc.day,
      hour: tc.hour, minute: tc.minute, gender: tc.gender,
    });
    if (result.planets) {
      for (const p of result.planets.slice(0, 4)) {
        console.log(`    ${p.id}: ${p.sign} ${p.degree?.toFixed(2)}°`);
      }
      totalTests++;
      passedTests++;
      console.log(`    ✅ 계산 성공 (행성 ${result.planets.length}개)`);
    }
  } catch (e) {
    totalTests++;
    console.log(`    에러: ${e.message}`);
  }
}

// ── 결과 ──
console.log('\n' + '='.repeat(80));
console.log(`🏆 결과: ${passedTests}/${totalTests} 통과 (${(passedTests/totalTests*100).toFixed(1)}%)`);
if (passedTests === totalTests) {
  console.log('🎉 모든 테스트 통과!');
} else {
  console.log(`⚠️  ${totalTests - passedTests}개 불일치`);
}
console.log('='.repeat(80));
