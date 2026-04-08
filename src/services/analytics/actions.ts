"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/adminGuard";

// ===== 헬퍼 =====

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

// ===== Overview (개요) =====

export async function getOverviewMetrics(from: string, to: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  // 전체 사용자 수 (auth.users 기반, 페이지네이션)
  let totalUsers = 0;
  let page = 1;
  while (true) {
    const { data: batch } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (!batch?.users?.length) break;
    totalUsers += batch.users.length;
    if (batch.users.length < 1000) break;
    page++;
  }

  // 기간 내 신규 가입자 (auth.users created_at 기반)
  const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const allUsers = usersData?.users || [];
  const newSignups = allUsers.filter(
    (u) => u.created_at >= from && u.created_at <= to
  ).length;

  // DAU: 오늘 saju_readings 또는 saju_chat_messages에 활동한 고유 유저
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayReadings } = await supabase
    .from("saju_readings")
    .select("user_id")
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`);
  const { data: todayChats } = await supabase
    .from("saju_chat_messages")
    .select("reading_id")
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`);
  const todayUserIds = new Set<string>();
  (todayReadings || []).forEach((r) => { if (r.user_id) todayUserIds.add(r.user_id); });
  // chat_messages는 reading_id로 연결 → 별도 처리 (간접 DAU)
  const dau = todayUserIds.size || (todayChats || []).length > 0 ? Math.max(todayUserIds.size, 1) : 0;

  // WAU: 최근 7일 활동 유저
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: weekReadings } = await supabase
    .from("saju_readings")
    .select("user_id")
    .gte("created_at", weekAgo.toISOString());
  const weekUserIds = new Set<string>();
  (weekReadings || []).forEach((r) => { if (r.user_id) weekUserIds.add(r.user_id); });
  const wau = weekUserIds.size;

  // MAU: 최근 30일 활동 유저
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const { data: monthReadings } = await supabase
    .from("saju_readings")
    .select("user_id")
    .gte("created_at", monthAgo.toISOString());
  const monthUserIds = new Set<string>();
  (monthReadings || []).forEach((r) => { if (r.user_id) monthUserIds.add(r.user_id); });
  const mau = monthUserIds.size;

  // 총 대화 수 (기간 내)
  const { count: totalChats } = await supabase
    .from("saju_chat_messages")
    .select("id", { count: "exact", head: true })
    .gte("created_at", from)
    .lte("created_at", to);

  // 총 사주분석 수 (기간 내)
  const { count: totalReadings } = await supabase
    .from("saju_readings")
    .select("id", { count: "exact", head: true })
    .gte("created_at", from)
    .lte("created_at", to);

  // 별 보유 사용자 수 (유료 사용자 추정)
  const { data: starUsers } = await supabase
    .from("user_stars")
    .select("user_id, balance");
  const paidUsers = (starUsers || []).filter((s) => s.balance > 0).length;

  return {
    dau,
    wau,
    mau,
    totalUsers,
    newSignups,
    totalChats: totalChats || 0,
    totalReadings: totalReadings || 0,
    paidUsers,
  };
}

export async function getDailyTrend(from: string, to: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  // 일별 신규 가입자 (auth.users)
  const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const allUsers = usersData?.users || [];
  const periodUsers = allUsers.filter(
    (u) => u.created_at >= from && u.created_at <= to
  );

  // 일별 대화 수
  const { data: messages } = await supabase
    .from("saju_chat_messages")
    .select("created_at")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: true });

  // 일별 사주분석 수
  const { data: readings } = await supabase
    .from("saju_readings")
    .select("created_at, user_id")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: true });

  const dayMap = new Map<string, { signups: number; messages: number; readings: number; activeUsers: Set<string> }>();

  periodUsers.forEach((u) => {
    const date = formatDate(u.created_at);
    if (!dayMap.has(date)) dayMap.set(date, { signups: 0, messages: 0, readings: 0, activeUsers: new Set() });
    dayMap.get(date)!.signups++;
  });

  (messages || []).forEach((m) => {
    const date = formatDate(m.created_at);
    if (!dayMap.has(date)) dayMap.set(date, { signups: 0, messages: 0, readings: 0, activeUsers: new Set() });
    dayMap.get(date)!.messages++;
  });

  (readings || []).forEach((r) => {
    const date = formatDate(r.created_at);
    if (!dayMap.has(date)) dayMap.set(date, { signups: 0, messages: 0, readings: 0, activeUsers: new Set() });
    const day = dayMap.get(date)!;
    day.readings++;
    if (r.user_id) day.activeUsers.add(r.user_id);
  });

  const signupTrend = Array.from(dayMap.entries()).map(([date, d]) => ({
    date,
    가입: d.signups,
    활성사용자: d.activeUsers.size,
  }));

  const activityTrend = Array.from(dayMap.entries()).map(([date, d]) => ({
    name: date,
    사주분석: d.readings,
    대화: d.messages,
  }));

  return { signupTrend, activityTrend };
}

// ===== Traffic (유입 분석) =====

export async function getTrafficData(from: string, to: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  // analytics_events에서 page_view 이벤트 조회
  const { data: events } = await supabase
    .from("analytics_events")
    .select("referrer, device_type, browser, os, country_code")
    .eq("event_type", "page_view")
    .gte("created_at", from)
    .lte("created_at", to);

  const rows = events || [];

  // 리퍼러 도메인별 집계
  const refMap = new Map<string, number>();
  rows.forEach((e) => {
    if (e.referrer) {
      try {
        const domain = new URL(e.referrer).hostname.replace(/^www\./, "");
        refMap.set(domain, (refMap.get(domain) || 0) + 1);
      } catch {
        refMap.set(e.referrer, (refMap.get(e.referrer) || 0) + 1);
      }
    } else {
      refMap.set("직접 유입", (refMap.get("직접 유입") || 0) + 1);
    }
  });
  const referrers = Array.from(refMap.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // 유입 소스 (리퍼러 기반 분류)
  const sourceMap = new Map<string, number>();
  rows.forEach((e) => {
    let source = "직접 유입";
    if (e.referrer) {
      try {
        const domain = new URL(e.referrer).hostname.toLowerCase();
        if (/google|naver|daum|bing|yahoo/.test(domain)) source = "검색엔진";
        else if (/instagram|facebook|twitter|tiktok|kakao|t\.co/.test(domain)) source = "소셜미디어";
        else source = "외부 링크";
      } catch {
        source = "외부 링크";
      }
    }
    sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
  });
  const sources = Array.from(sourceMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 디바이스 타입별
  const deviceMap = new Map<string, number>();
  rows.forEach((e) => {
    const dt = e.device_type || "unknown";
    const label = dt === "mobile" ? "모바일" : dt === "tablet" ? "태블릿" : dt === "desktop" ? "데스크톱" : dt;
    deviceMap.set(label, (deviceMap.get(label) || 0) + 1);
  });
  const devices = Array.from(deviceMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 브라우저별
  const browserMap = new Map<string, number>();
  rows.forEach((e) => {
    const b = e.browser || "Other";
    browserMap.set(b, (browserMap.get(b) || 0) + 1);
  });
  const browsers = Array.from(browserMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // OS별
  const osMap = new Map<string, number>();
  rows.forEach((e) => {
    const o = e.os || "Other";
    osMap.set(o, (osMap.get(o) || 0) + 1);
  });
  const osList = Array.from(osMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 국가별
  const countryMap = new Map<string, number>();
  rows.forEach((e) => {
    const cc = e.country_code || "??";
    countryMap.set(cc, (countryMap.get(cc) || 0) + 1);
  });
  const countries = Array.from(countryMap.entries())
    .map(([country_code, count]) => ({ country_code, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalPageViews: rows.length,
    sources,
    countries,
    devices,
    browsers,
    osList,
    referrers,
  };
}

// ===== Behavior (행동 분석) =====

export async function getBehaviorData(from: string, to: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  // 시간대별 사용 패턴 (saju_chat_messages 기반)
  const { data: chatMessages } = await supabase
    .from("saju_chat_messages")
    .select("created_at")
    .gte("created_at", from)
    .lte("created_at", to);

  const heatmapMap = new Map<string, number>();
  (chatMessages || []).forEach((m) => {
    const d = new Date(m.created_at);
    const day = (d.getDay() + 6) % 7; // Mon=0 ~ Sun=6
    const hour = d.getHours();
    const key = `${day}-${hour}`;
    heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
  });
  const heatmap: { hour: number; day: number; value: number }[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmap.push({ day, hour, value: heatmapMap.get(`${day}-${hour}`) || 0 });
    }
  }

  // 캐릭터별 대화 수
  const { data: charChats } = await supabase
    .from("saju_chat_messages")
    .select("character_id")
    .gte("created_at", from)
    .lte("created_at", to);

  const charMap = new Map<string, number>();
  (charChats || []).forEach((c) => {
    const charId = c.character_id || "unknown";
    charMap.set(charId, (charMap.get(charId) || 0) + 1);
  });

  // 캐릭터 이름 매핑
  const CHARACTER_NAMES: Record<string, string> = {
    charon_m: "현우 (종합분석)",
    charon_f: "소연 (궁합분석)",
    minjun: "민준 (재물분석)",
    haeun: "하은 (운세분석)",
    doctor: "현우 (레거시)",
  };

  const characterStats = Array.from(charMap.entries())
    .map(([name, value]) => ({
      name: CHARACTER_NAMES[name] || name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  // 사주분석별 평균 메시지 수
  const { data: readingsWithChats } = await supabase
    .from("saju_readings")
    .select("id")
    .gte("created_at", from)
    .lte("created_at", to);

  const totalReadingsCount = (readingsWithChats || []).length;
  const totalMessagesCount = (chatMessages || []).length;
  const avgMessagesPerReading = totalReadingsCount > 0
    ? Math.round(totalMessagesCount / totalReadingsCount * 10) / 10
    : 0;

  // 궁합 분석 이용률
  const { count: compatibilityCount } = await supabase
    .from("saju_compatibility")
    .select("id", { count: "exact", head: true })
    .gte("created_at", from)
    .lte("created_at", to);

  // 사용자 세그먼트 (대화 수 기반)
  const { data: allReadings } = await supabase
    .from("saju_readings")
    .select("user_id");

  const userReadingMap = new Map<string, number>();
  (allReadings || []).forEach((r) => {
    if (r.user_id) {
      userReadingMap.set(r.user_id, (userReadingMap.get(r.user_id) || 0) + 1);
    }
  });

  let power = 0, regular = 0, casual = 0, dormant = 0;
  userReadingMap.forEach((count) => {
    if (count >= 5) power++;
    else if (count >= 2) regular++;
    else if (count >= 1) casual++;
    else dormant++;
  });

  const segments = [
    { name: "파워 (5+회)", value: power },
    { name: "일반 (2-4회)", value: regular },
    { name: "캐주얼 (1회)", value: casual },
    { name: "휴면 (0회)", value: dormant },
  ];

  return {
    heatmap,
    characterStats,
    segments,
    avgMessagesPerReading,
    totalReadings: totalReadingsCount,
    totalMessages: totalMessagesCount,
    compatibilityCount: compatibilityCount || 0,
  };
}

// ===== Revenue (매출 분석) =====

export async function getRevenueData(from: string, to: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  // 별 보유 현황
  const { data: starUsers } = await supabase
    .from("user_stars")
    .select("user_id, balance, created_at, updated_at");

  const allStarUsers = starUsers || [];
  const totalStarBalance = allStarUsers.reduce((sum, s) => sum + (s.balance || 0), 0);
  const paidUsers = allStarUsers.filter((s) => s.balance > 0).length;
  const freeUsers = allStarUsers.filter((s) => s.balance === 0).length;

  // 전체 사용자 수 (ARPU 계산용)
  let totalUsers = 0;
  let page = 1;
  while (true) {
    const { data: batch } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (!batch?.users?.length) break;
    totalUsers += batch.users.length;
    if (batch.users.length < 1000) break;
    page++;
  }

  // 일별 별 변동 추이 (user_stars updated_at 기반)
  const starTrend = new Map<string, { 구매: number }>();
  allStarUsers.forEach((s) => {
    if (s.updated_at && s.updated_at >= from && s.updated_at <= to) {
      const date = formatDate(s.updated_at);
      const existing = starTrend.get(date) || { 구매: 0 };
      existing.구매++;
      starTrend.set(date, existing);
    }
  });

  const starPurchaseTrend = Array.from(starTrend.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // 유/무료 사용자 비율
  const userDistribution = [
    { name: "유료 (별 보유)", value: paidUsers },
    { name: "무료", value: Math.max(totalUsers - paidUsers, freeUsers) },
  ];

  // 예상 총 매출 (별 구매 = 사주분석 이용으로 추정)
  // 종합 사주분석 19,900원, 궁합 분석 9,900원
  const { count: totalReadingsAll } = await supabase
    .from("saju_readings")
    .select("id", { count: "exact", head: true });
  const { count: totalCompatAll } = await supabase
    .from("saju_compatibility")
    .select("id", { count: "exact", head: true });

  const estimatedRevenue = ((totalReadingsAll || 0) * 19900) + ((totalCompatAll || 0) * 9900);
  const arpu = totalUsers > 0 ? Math.round(estimatedRevenue / totalUsers) : 0;

  return {
    totalStarBalance,
    paidUsers,
    totalUsers,
    estimatedRevenue,
    arpu,
    starPurchaseTrend,
    userDistribution,
    totalReadings: totalReadingsAll || 0,
    totalCompatibility: totalCompatAll || 0,
  };
}

// ===== Users (사용자 관리) =====

export async function getUserList(params: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { search, page = 1, pageSize = 20 } = params;

  // 전체 사용자 목록 (admin API)
  const { data: usersData } = await supabase.auth.admin.listUsers({
    page,
    perPage: pageSize,
  });

  const users = usersData?.users || [];
  const userIds = users.map((u) => u.id);

  // 사주분석 횟수
  const { data: readingCounts } = await supabase
    .from("saju_readings")
    .select("user_id")
    .in("user_id", userIds);

  const readingCountMap = new Map<string, number>();
  (readingCounts || []).forEach((r) => {
    readingCountMap.set(r.user_id, (readingCountMap.get(r.user_id) || 0) + 1);
  });

  // 별 잔액
  const { data: starData } = await supabase
    .from("user_stars")
    .select("user_id, balance")
    .in("user_id", userIds);

  const starMap = new Map<string, number>();
  (starData || []).forEach((s) => {
    starMap.set(s.user_id, s.balance);
  });

  const result = users
    .filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        return (
          u.email?.toLowerCase().includes(q) ||
          u.user_metadata?.full_name?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .map((u) => ({
      id: u.id,
      email: u.email || "",
      fullName: u.user_metadata?.full_name || null,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at || null,
      readingCount: readingCountMap.get(u.id) || 0,
      starBalance: starMap.get(u.id) || 0,
    }));

  return { users: result, total: result.length };
}

export async function getUserDetail(userId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  // 사용자 기본 정보
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const user = userData?.user;
  if (!user) return null;

  // 사주분석 목록
  const { data: readings } = await supabase
    .from("saju_readings")
    .select("id, character_id, name, birth_year, birth_month, birth_day, gender, title, chat_used, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // 대화 내역 (최근 50개)
  const readingIds = (readings || []).map((r) => r.id);
  let chatMessages: { id: string; reading_id: string; role: string; content: string; character_id: string | null; created_at: string }[] = [];
  if (readingIds.length > 0) {
    const { data: chats } = await supabase
      .from("saju_chat_messages")
      .select("id, reading_id, role, content, character_id, created_at")
      .in("reading_id", readingIds)
      .order("created_at", { ascending: false })
      .limit(50);
    chatMessages = chats || [];
  }

  // 별 잔액
  const { data: starData } = await supabase
    .from("user_stars")
    .select("user_id, balance, updated_at")
    .eq("user_id", userId)
    .single();

  // 궁합 분석 내역
  const { data: compatibility } = await supabase
    .from("saju_compatibility")
    .select("id, reading_id, partner_name, created_at")
    .in("reading_id", readingIds)
    .order("created_at", { ascending: false });

  const daysSinceSignup = Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    id: user.id,
    email: user.email || "",
    fullName: user.user_metadata?.full_name || null,
    createdAt: user.created_at,
    lastSignIn: user.last_sign_in_at || null,
    starBalance: starData?.balance || 0,
    readingCount: (readings || []).length,
    chatCount: chatMessages.length,
    daysSinceSignup,
    readings: readings || [],
    chatMessages,
    compatibility: compatibility || [],
  };
}

// ===== Funnel (퍼널 분석) =====

export async function getFunnelData(from: string, to: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  // 기간 내 가입한 사용자
  const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const allUsers = usersData?.users || [];
  const periodUsers = allUsers.filter(
    (u) => u.created_at >= from && u.created_at <= to
  );
  const periodUserIds = periodUsers.map((u) => u.id);

  if (periodUserIds.length === 0) {
    return {
      funnel: [
        { label: "가입", count: 0, rate: 100 },
        { label: "첫 사주분석", count: 0, rate: 0 },
        { label: "첫 대화", count: 0, rate: 0 },
        { label: "별 구매 (결제)", count: 0, rate: 0 },
      ],
      cohort: [],
    };
  }

  // Step 2: 사주분석을 한 사용자
  const { data: readingUsers } = await supabase
    .from("saju_readings")
    .select("user_id")
    .in("user_id", periodUserIds);
  const withReading = new Set((readingUsers || []).map((r) => r.user_id)).size;

  // Step 3: 대화를 한 사용자 (chat_used = true)
  const { data: chatUsedReadings } = await supabase
    .from("saju_readings")
    .select("user_id")
    .in("user_id", periodUserIds)
    .eq("chat_used", true);
  const withChat = new Set((chatUsedReadings || []).map((r) => r.user_id)).size;

  // Step 4: 별 구매한 사용자 (결제)
  const { data: starPurchasers } = await supabase
    .from("user_stars")
    .select("user_id")
    .in("user_id", periodUserIds)
    .gt("balance", 0);
  const withPurchase = new Set((starPurchasers || []).map((s) => s.user_id)).size;

  const totalSignups = periodUserIds.length;
  const funnel = [
    { label: "가입", count: totalSignups, rate: 100 },
    { label: "첫 사주분석", count: withReading, rate: totalSignups > 0 ? (withReading / totalSignups) * 100 : 0 },
    { label: "첫 대화", count: withChat, rate: totalSignups > 0 ? (withChat / totalSignups) * 100 : 0 },
    { label: "별 구매 (결제)", count: withPurchase, rate: totalSignups > 0 ? (withPurchase / totalSignups) * 100 : 0 },
  ];

  // 코호트 리텐션 (최근 6개월)
  const cohort: { cohortMonth: string; totalUsers: number; retention: number[] }[] = [];
  const now = new Date();

  for (let m = 5; m >= 0; m--) {
    const cohortDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthStr = cohortDate.toISOString().slice(0, 7);

    const cohortUsers = allUsers.filter((u) => u.created_at.startsWith(monthStr));
    if (cohortUsers.length === 0) continue;

    const cohortUserIds = cohortUsers.map((u) => u.id);

    // 해당 코호트 사용자의 활동 (saju_readings)
    const { data: activityReadings } = await supabase
      .from("saju_readings")
      .select("user_id, created_at")
      .in("user_id", cohortUserIds)
      .gte("created_at", cohortDate.toISOString());

    const retention: number[] = [];
    const monthsFromCohort = now.getMonth() - cohortDate.getMonth() + (now.getFullYear() - cohortDate.getFullYear()) * 12;

    for (let offset = 0; offset <= monthsFromCohort; offset++) {
      const checkMonth = new Date(cohortDate.getFullYear(), cohortDate.getMonth() + offset, 1);
      const checkMonthStr = checkMonth.toISOString().slice(0, 7);
      const activeInMonth = new Set(
        (activityReadings || [])
          .filter((r) => r.created_at.startsWith(checkMonthStr))
          .map((r) => r.user_id)
      ).size;
      retention.push(Math.round((activeInMonth / cohortUsers.length) * 100));
    }

    cohort.push({
      cohortMonth: monthStr,
      totalUsers: cohortUsers.length,
      retention,
    });
  }

  return { funnel, cohort };
}
