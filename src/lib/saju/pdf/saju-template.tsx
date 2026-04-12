import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { SajuReading, FiveElementDistribution, MonthlyFortune } from "@/types/saju";
import {
  HEAVENLY_STEMS_HANJA,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES_HANJA,
  EARTHLY_BRANCHES,
} from "manseryeok";

// ─── Font Registration ──────────────────────────────────────────────────────

const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: path.join(fontsDir, "NotoSansKR-Regular.ttf") },
    { src: path.join(fontsDir, "NotoSansKR-Bold.ttf"), fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ─── Premium Color Palette ──────────────────────────────────────────────────

const NAVY = "#1B2A4A";
const NAVY_DARK = "#0F1D35";
const GOLD = "#C9A96E";
const GOLD_LIGHT = "#E8D5B0";
const GOLD_DARK = "#A68B5B";
const CREAM = "#FDF8F0";
const GRAY_900 = "#1A1A2E";
const GRAY_700 = "#3D3D56";
const GRAY_500 = "#6B6B82";
const GRAY_300 = "#C4C4D4";
const WHITE = "#FFFFFF";

const F = "NotoSansKR"; // fontFamily shorthand

const ELEMENT_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  wood: { bg: "#E8F5E9", text: "#2E7D32", accent: "#4CAF50" },
  fire: { bg: "#FFEBEE", text: "#C62828", accent: "#EF5350" },
  earth: { bg: "#FFF8E1", text: "#F57F17", accent: "#FFC107" },
  metal: { bg: "#F3E5F5", text: "#6A1B9A", accent: "#AB47BC" },
  water: { bg: "#E3F2FD", text: "#1565C0", accent: "#42A5F5" },
};

const ELEMENT_KO: Record<string, string> = {
  wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)",
};

const ELEMENT_SYMBOL: Record<string, string> = {
  wood: "木", fire: "火", earth: "土", metal: "金", water: "水",
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    paddingTop: 50, paddingBottom: 65, paddingHorizontal: 45,
    fontSize: 10, fontFamily: F, color: GRAY_900, backgroundColor: CREAM,
  },
  coverPage: {
    paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0,
    fontFamily: F, backgroundColor: NAVY,
  },
  coverInner: {
    flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 60,
  },
  coverBorderTop: { position: "absolute", top: 30, left: 30, right: 30, height: 2, backgroundColor: GOLD },
  coverBorderBottom: { position: "absolute", bottom: 30, left: 30, right: 30, height: 2, backgroundColor: GOLD },
  coverBorderLeft: { position: "absolute", top: 30, left: 30, bottom: 30, width: 2, backgroundColor: GOLD },
  coverBorderRight: { position: "absolute", top: 30, right: 30, bottom: 30, width: 2, backgroundColor: GOLD },
  coverCornerTL: { position: "absolute", top: 24, left: 24, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: GOLD },
  coverCornerTR: { position: "absolute", top: 24, right: 24, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: GOLD },
  coverCornerBL: { position: "absolute", bottom: 24, left: 24, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: GOLD },
  coverCornerBR: { position: "absolute", bottom: 24, right: 24, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: GOLD },
  coverDivider: { width: 80, height: 2, backgroundColor: GOLD, marginVertical: 20 },
  coverLabel: { fontFamily: F, fontSize: 11, color: GOLD_LIGHT, letterSpacing: 6, marginBottom: 10 },
  coverTitle: { fontFamily: F, fontSize: 36, fontWeight: 700, color: WHITE, marginBottom: 4, letterSpacing: 3 },
  coverSubtitle: { fontFamily: F, fontSize: 12, color: GOLD, letterSpacing: 4 },
  coverName: { fontFamily: F, fontSize: 28, fontWeight: 700, color: GOLD, marginBottom: 8 },
  coverMeta: { fontFamily: F, fontSize: 11, color: GOLD_LIGHT, opacity: 0.85, marginBottom: 3 },
  coverDate: { fontFamily: F, position: "absolute", bottom: 50, fontSize: 9, color: GOLD_DARK, letterSpacing: 2 },
  // Section title
  sectionTitleContainer: { marginBottom: 20, alignItems: "center" },
  sectionTitleText: { fontFamily: F, fontSize: 20, fontWeight: 700, color: NAVY, letterSpacing: 2, marginBottom: 8 },
  sectionTitleDivider: { width: 50, height: 2, backgroundColor: GOLD },
  sectionSubtitle: { fontFamily: F, fontSize: 10, color: GOLD_DARK, letterSpacing: 3, marginTop: 6 },
  // Body text
  bodyText: { fontFamily: F, fontSize: 10, lineHeight: 1.8, color: GRAY_700, marginBottom: 8 },
  // Four pillars
  pillarRow: { flexDirection: "row", justifyContent: "center", gap: 14, marginBottom: 20 },
  pillarBox: { width: 105, alignItems: "center", backgroundColor: WHITE, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 10, borderWidth: 1, borderColor: GOLD_LIGHT },
  pillarBoxDay: { width: 105, alignItems: "center", backgroundColor: NAVY, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 10, borderWidth: 2, borderColor: GOLD },
  pillarLabel: { fontFamily: F, fontSize: 8, color: GRAY_500, marginBottom: 8, letterSpacing: 1 },
  pillarLabelDay: { fontFamily: F, fontSize: 8, color: GOLD_LIGHT, marginBottom: 8, letterSpacing: 1 },
  pillarStem: { fontFamily: F, fontSize: 24, fontWeight: 700, color: NAVY },
  pillarStemDay: { fontFamily: F, fontSize: 24, fontWeight: 700, color: GOLD },
  pillarHanja: { fontFamily: F, fontSize: 11, color: GRAY_500, marginTop: 2 },
  pillarHanjaDay: { fontFamily: F, fontSize: 11, color: GOLD_LIGHT, marginTop: 2 },
  pillarBranch: { fontFamily: F, fontSize: 24, fontWeight: 700, color: GOLD_DARK, marginTop: 6 },
  pillarBranchDay: { fontFamily: F, fontSize: 24, fontWeight: 700, color: WHITE, marginTop: 6 },
  pillarDivider: { width: 24, height: 1, backgroundColor: GOLD_LIGHT, marginVertical: 6 },
  pillarDividerDay: { width: 24, height: 1, backgroundColor: GOLD, marginVertical: 6 },
  dayMasterBadge: { fontFamily: F, fontSize: 7, color: GOLD, backgroundColor: NAVY_DARK, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6, letterSpacing: 1 },
  // Info card
  infoCard: { backgroundColor: WHITE, borderRadius: 10, padding: 16, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: GOLD },
  infoCardText: { fontFamily: F, fontSize: 10, lineHeight: 1.7, color: GRAY_700 },
  // Five elements
  elementContainer: { marginTop: 8 },
  elementRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  elementLabelContainer: { width: 75, flexDirection: "row", alignItems: "center", gap: 4 },
  elementEmoji: { fontFamily: F, fontSize: 12, fontWeight: 700, color: GOLD_DARK },
  elementLabel: { fontFamily: F, fontSize: 10, fontWeight: 700, color: GRAY_700 },
  elementBarBg: { flex: 1, height: 22, backgroundColor: WHITE, borderRadius: 11, borderWidth: 1, borderColor: GRAY_300, overflow: "hidden" },
  elementCount: { fontFamily: F, width: 35, fontSize: 10, fontWeight: 700, color: GRAY_700, textAlign: "right", marginLeft: 8 },
  // Text section
  textSectionContainer: { marginBottom: 8 },
  // Monthly fortune
  monthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  monthCard: { width: "47%", backgroundColor: WHITE, borderRadius: 10, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: GOLD_LIGHT },
  monthHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  monthBadge: { backgroundColor: NAVY, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  monthLabel: { fontFamily: F, fontSize: 10, fontWeight: 700, color: GOLD },
  monthText: { fontFamily: F, fontSize: 9, lineHeight: 1.6, color: GRAY_700 },
  // Lucky elements
  luckyRow: { flexDirection: "row", gap: 14, marginTop: 12 },
  luckyCard: { flex: 1, backgroundColor: NAVY, borderRadius: 12, padding: 18, alignItems: "center" },
  luckyIcon: { fontFamily: F, fontSize: 22, fontWeight: 700, color: GOLD, marginBottom: 8 },
  luckyTitle: { fontFamily: F, fontSize: 9, color: GOLD_LIGHT, marginBottom: 6, letterSpacing: 1 },
  luckyValue: { fontFamily: F, fontSize: 14, fontWeight: 700, color: GOLD },
  // Summary
  summaryBox: { backgroundColor: NAVY, borderRadius: 12, padding: 24, marginTop: 8 },
  summaryText: { fontFamily: F, fontSize: 11, lineHeight: 1.8, color: GOLD_LIGHT, textAlign: "center" },
  // Footer
  footer: { position: "absolute", bottom: 20, left: 45, right: 45, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: GOLD_LIGHT, paddingTop: 8 },
  footerBrand: { fontFamily: F, fontSize: 8, fontWeight: 700, color: GOLD_DARK, letterSpacing: 2 },
  footerPage: { fontFamily: F, fontSize: 8, color: GRAY_500 },
  // Page decorative top bar
  pageTopBar: { position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: GOLD },
});

// ─── Helper: get hanja for a stem/branch ────────────────────────────────────

function stemHanja(stem: string): string {
  const idx = (HEAVENLY_STEMS as readonly string[]).indexOf(stem);
  return idx >= 0 ? HEAVENLY_STEMS_HANJA[idx] : "";
}

function branchHanja(branch: string): string {
  const idx = (EARTHLY_BRANCHES as readonly string[]).indexOf(branch);
  return idx >= 0 ? EARTHLY_BRANCHES_HANJA[idx] : "";
}

// ─── Decorative Components ──────────────────────────────────────────────────

function PageTopBar() {
  return <View style={styles.pageTopBar} fixed />;
}

function PageFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerBrand}>사주랩</Text>
      <Text
        style={styles.footerPage}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      <View style={styles.sectionTitleDivider} />
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── Cover Page ─────────────────────────────────────────────────────────────

const HOUR_TO_SIJI_LABEL: Record<number, string> = {
  23: "자시(子時)", 0: "자시(子時)", 1: "축시(丑時)", 2: "축시(丑時)",
  3: "인시(寅時)", 4: "인시(寅時)", 5: "묘시(卯時)", 6: "묘시(卯時)",
  7: "진시(辰時)", 8: "진시(辰時)", 9: "사시(巳時)", 10: "사시(巳時)",
  11: "오시(午時)", 12: "오시(午時)", 13: "미시(未時)", 14: "미시(未時)",
  15: "신시(申時)", 16: "신시(申時)", 17: "유시(酉時)", 18: "유시(酉時)",
  19: "술시(戌時)", 20: "술시(戌時)", 21: "해시(亥時)", 22: "해시(亥時)",
};

function CoverPage({ reading }: { reading: SajuReading }) {
  const sijiLabel = reading.birth_hour != null ? HOUR_TO_SIJI_LABEL[reading.birth_hour] ?? "" : "";
  const birthStr = `${reading.birth_year}년 ${reading.birth_month}월 ${reading.birth_day}일${sijiLabel ? ` ${sijiLabel}` : ""}`;
  const date = reading.created_at
    ? new Date(reading.created_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverBorderTop} />
      <View style={styles.coverBorderBottom} />
      <View style={styles.coverBorderLeft} />
      <View style={styles.coverBorderRight} />
      <View style={styles.coverCornerTL} />
      <View style={styles.coverCornerTR} />
      <View style={styles.coverCornerBL} />
      <View style={styles.coverCornerBR} />

      <View style={styles.coverInner}>
        <Text style={styles.coverLabel}>FOUR PILLARS OF DESTINY</Text>
        <Text style={styles.coverTitle}>종합 사주분석</Text>
        <Text style={styles.coverSubtitle}>COMPREHENSIVE ANALYSIS REPORT</Text>

        <View style={styles.coverDivider} />

        <Text style={styles.coverName}>{reading.name}</Text>
        <Text style={styles.coverMeta}>{birthStr}</Text>
        <Text style={styles.coverMeta}>
          {reading.gender === "male" ? "남성" : "여성"} · {reading.is_lunar ? "음력" : "양력"}
        </Text>

        <Text style={styles.coverDate}>GENERATED {date}</Text>
      </View>
    </Page>
  );
}

// ─── Four Pillars Section ───────────────────────────────────────────────────

function FourPillarsSection({ reading }: { reading: SajuReading }) {
  const fp = reading.four_pillars;
  if (!fp) return null;

  const pillars = [
    { label: "시주 · 時柱", pillar: fp.hour, isDay: false },
    { label: "일주 · 日柱", pillar: fp.day, isDay: true },
    { label: "월주 · 月柱", pillar: fp.month, isDay: false },
    { label: "연주 · 年柱", pillar: fp.year, isDay: false },
  ];

  return (
    <View>
      <SectionTitle title="사주팔자" subtitle="FOUR PILLARS" />
      <View style={styles.pillarRow}>
        {pillars.map((p) => (
          <View key={p.label} style={p.isDay ? styles.pillarBoxDay : styles.pillarBox}>
            <Text style={p.isDay ? styles.pillarLabelDay : styles.pillarLabel}>{p.label}</Text>
            <Text style={p.isDay ? styles.pillarStemDay : styles.pillarStem}>
              {p.pillar.heavenlyStem}
            </Text>
            <Text style={p.isDay ? styles.pillarHanjaDay : styles.pillarHanja}>
              {stemHanja(p.pillar.heavenlyStem)}
            </Text>
            <View style={p.isDay ? styles.pillarDividerDay : styles.pillarDivider} />
            <Text style={p.isDay ? styles.pillarBranchDay : styles.pillarBranch}>
              {p.pillar.earthlyBranch}
            </Text>
            <Text style={p.isDay ? styles.pillarHanjaDay : styles.pillarHanja}>
              {branchHanja(p.pillar.earthlyBranch)}
            </Text>
            {p.isDay && <Text style={styles.dayMasterBadge}>일간 · DAY MASTER</Text>}
          </View>
        ))}
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoCardText}>
          일간(日干) {fp.day.heavenlyStem}({stemHanja(fp.day.heavenlyStem)})은 사주에서 나 자신을 의미하는 핵심 요소입니다.
          일간을 중심으로 다른 기둥과의 관계를 통해 성격, 적성, 운세를 해석합니다.
        </Text>
      </View>
    </View>
  );
}

// ─── Five Elements Section ──────────────────────────────────────────────────

function FiveElementsSection({ elements }: { elements: FiveElementDistribution }) {
  const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
  const maxCount = Math.max(elements.wood, elements.fire, elements.earth, elements.metal, elements.water, 1);

  const items: { key: keyof FiveElementDistribution; count: number }[] = [
    { key: "wood", count: elements.wood },
    { key: "fire", count: elements.fire },
    { key: "earth", count: elements.earth },
    { key: "metal", count: elements.metal },
    { key: "water", count: elements.water },
  ];

  return (
    <View style={styles.elementContainer}>
      <SectionTitle title="오행 분석" subtitle="FIVE ELEMENTS" />
      {items.map((item) => {
        const widthPercent = (item.count / maxCount) * 100;
        const colors = ELEMENT_COLORS[item.key];
        return (
          <View key={item.key} style={styles.elementRow}>
            <View style={styles.elementLabelContainer}>
              <Text style={styles.elementEmoji}>{ELEMENT_SYMBOL[item.key]}</Text>
              <Text style={styles.elementLabel}>{ELEMENT_KO[item.key]}</Text>
            </View>
            <View style={styles.elementBarBg}>
              <View
                style={{
                  width: `${Math.max(widthPercent, 8)}%`,
                  height: 20,
                  backgroundColor: colors.accent,
                  borderRadius: 10,
                }}
              />
            </View>
            <Text style={styles.elementCount}>{item.count}/{total}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Text Section ───────────────────────────────────────────────────────────

function TextSection({ title, subtitle, content }: { title: string; subtitle?: string; content: string }) {
  if (!content) return null;
  const paragraphs = content.split("\n").filter((l) => l.trim() !== "");

  return (
    <View>
      <View wrap={false}>
        <SectionTitle title={title} subtitle={subtitle} />
      </View>
      <View style={styles.textSectionContainer}>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.bodyText}>{p.trim()}</Text>
        ))}
      </View>
    </View>
  );
}

// ─── Monthly Fortune Section ────────────────────────────────────────────────

function MonthlyFortuneSection({ months, label }: { months: MonthlyFortune[]; label?: string }) {
  if (!months || months.length === 0) return null;

  return (
    <View>
      {label && <SectionTitle title="월별 운세" subtitle="MONTHLY FORTUNE" />}
      <View style={styles.monthGrid}>
        {months.map((m) => (
          <View key={m.month} style={styles.monthCard} wrap={false}>
            <View style={styles.monthHeader}>
              <View style={styles.monthBadge}>
                <Text style={styles.monthLabel}>{m.month}월</Text>
              </View>
            </View>
            <Text style={styles.monthText}>{m.fortune}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Lucky Elements Section ─────────────────────────────────────────────────

function LuckyElementsSection({ color, direction, number }: { color: string; direction: string; number: string }) {
  return (
    <View wrap={false}>
      <SectionTitle title="행운의 요소" subtitle="LUCKY ELEMENTS" />
      <View style={styles.luckyRow}>
        <View style={styles.luckyCard}>
          <Text style={styles.luckyIcon}>色</Text>
          <Text style={styles.luckyTitle}>행운의 색상</Text>
          <Text style={styles.luckyValue}>{color}</Text>
        </View>
        <View style={styles.luckyCard}>
          <Text style={styles.luckyIcon}>方</Text>
          <Text style={styles.luckyTitle}>행운의 방향</Text>
          <Text style={styles.luckyValue}>{direction}</Text>
        </View>
        <View style={styles.luckyCard}>
          <Text style={styles.luckyIcon}>數</Text>
          <Text style={styles.luckyTitle}>행운의 숫자</Text>
          <Text style={styles.luckyValue}>{number}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Summary Section ────────────────────────────────────────────────────────

function SummarySection({ content }: { content: string }) {
  if (!content) return null;

  return (
    <View wrap={false}>
      <SectionTitle title="종합 코멘트" subtitle="SUMMARY" />
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{content}</Text>
      </View>
    </View>
  );
}

// ─── Main Document ──────────────────────────────────────────────────────────

interface SajuPdfProps {
  reading: SajuReading;
}

export function SajuPdf({ reading }: SajuPdfProps) {
  const analysis = reading.full_analysis;
  const fortuneYear = reading.created_at
    ? new Date(reading.created_at).getFullYear()
    : new Date().getFullYear();

  return (
    <Document
      title={`종합 사주분석 - ${reading.name}`}
      author="사주랩"
      subject="사주분석 리포트"
      creator="사주랩"
    >
      <CoverPage reading={reading} />

      <Page size="A4" style={styles.page}>
        <PageTopBar />
        <FourPillarsSection reading={reading} />
        {reading.five_elements && <FiveElementsSection elements={reading.five_elements} />}
        <PageFooter />
      </Page>

      {analysis?.personality && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title="성격 · 기질 분석" subtitle="PERSONALITY" content={analysis.personality} />
          <PageFooter />
        </Page>
      )}

      {analysis?.tenGods && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title="십신 분석" subtitle="TEN GODS · 十神" content={analysis.tenGods} />
          <PageFooter />
        </Page>
      )}

      {analysis?.relationship && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title="대인관계 · 사회운" subtitle="RELATIONSHIP" content={analysis.relationship} />
          <PageFooter />
        </Page>
      )}

      {analysis?.love && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title="연애 · 결혼운" subtitle="LOVE & MARRIAGE" content={analysis.love} />
          <PageFooter />
        </Page>
      )}

      {analysis?.career && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title="직업 · 사업운" subtitle="CAREER" content={analysis.career} />
          <PageFooter />
        </Page>
      )}

      {analysis?.wealth && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title="재물운" subtitle="WEALTH FORTUNE" content={analysis.wealth} />
          <PageFooter />
        </Page>
      )}

      {analysis?.health && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title="건강운" subtitle="HEALTH" content={analysis.health} />
          <PageFooter />
        </Page>
      )}

      {analysis?.majorCycles && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title="대운 흐름" subtitle="MAJOR FORTUNE CYCLES · 大運" content={analysis.majorCycles} />
          <PageFooter />
        </Page>
      )}

      {analysis?.yearlyFortune && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title={`${fortuneYear}년 총운`} subtitle="YEARLY FORTUNE" content={analysis.yearlyFortune} />
          <PageFooter />
        </Page>
      )}

      {analysis?.monthlyFortune && analysis.monthlyFortune.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <MonthlyFortuneSection months={analysis.monthlyFortune.slice(0, 6)} label="상반기" />
          <PageFooter />
        </Page>
      )}

      {analysis?.monthlyFortune && analysis.monthlyFortune.length > 6 && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <MonthlyFortuneSection months={analysis.monthlyFortune.slice(6)} label="하반기" />
          <PageFooter />
        </Page>
      )}

      {analysis?.actionAdvice && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TextSection title="올해의 실천 조언" subtitle="ACTION ADVICE" content={analysis.actionAdvice} />
          <PageFooter />
        </Page>
      )}

      <Page size="A4" style={styles.page}>
        <PageTopBar />
        {analysis?.luckyElements && (
          <LuckyElementsSection
            color={analysis.luckyElements.color}
            direction={analysis.luckyElements.direction}
            number={analysis.luckyElements.number}
          />
        )}
        {analysis?.summary && <SummarySection content={analysis.summary} />}
        <PageFooter />
      </Page>
    </Document>
  );
}
