'use client';

import { useState, useRef, useEffect } from 'react';
import { createReading } from '@/services/saju/actions';
import { updateReadingMeta } from '@/services/saju/chat-actions';
import { Link } from '@/i18n/routing';

const SIJI_OPTIONS = [
  { value: 'unknown', label: '모름' },
  { value: 'ja', label: '자시 (23:00~01:00)' },
  { value: 'chuk', label: '축시 (01:00~03:00)' },
  { value: 'in', label: '인시 (03:00~05:00)' },
  { value: 'myo', label: '묘시 (05:00~07:00)' },
  { value: 'jin', label: '진시 (07:00~09:00)' },
  { value: 'sa', label: '사시 (09:00~11:00)' },
  { value: 'o', label: '오시 (11:00~13:00)' },
  { value: 'mi', label: '미시 (13:00~15:00)' },
  { value: 'sin', label: '신시 (15:00~17:00)' },
  { value: 'yu', label: '유시 (17:00~19:00)' },
  { value: 'sul', label: '술시 (19:00~21:00)' },
  { value: 'hae', label: '해시 (21:00~23:00)' },
];

const SIJI_TO_HOUR: Record<string, number | null> = {
  unknown: null, ja: 23, chuk: 1, in: 3, myo: 5, jin: 7, sa: 9,
  o: 11, mi: 13, sin: 15, yu: 17, sul: 19, hae: 21,
};

interface PreviousBirthInfo {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  isLunar: boolean;
  birthCity?: string;
}

interface CompletedReport {
  id: string;
  name: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  created_at: string;
}

interface SajuReportClientProps {
  starBalance: number; // [별 시스템 비활성화] 사용하지 않음
  previousBirthInfo?: PreviousBirthInfo;
  completedReports?: CompletedReport[];
}

type Step = 'input' | 'generating' | 'done' | 'error';

export default function SajuReportClient({
  previousBirthInfo,
  completedReports = [],
}: SajuReportClientProps) {
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthTime, setBirthTime] = useState('unknown');
  const [calendar, setCalendar] = useState<'solar' | 'lunar'>('solar');
  const [usedMyInfo, setUsedMyInfo] = useState(false);

  const fillMyInfo = () => {
    if (!previousBirthInfo) return;
    setName(previousBirthInfo.name);
    setGender(previousBirthInfo.gender);
    setBirthYear(previousBirthInfo.birthYear.toString());
    setBirthMonth(previousBirthInfo.birthMonth.toString());
    setBirthDay(previousBirthInfo.birthDay.toString());
    setBirthTime(previousBirthInfo.birthHour != null
      ? (Object.keys(SIJI_TO_HOUR).find(k => SIJI_TO_HOUR[k] === previousBirthInfo.birthHour) ?? 'unknown')
      : 'unknown');
    setCalendar(previousBirthInfo.isLunar ? 'lunar' : 'solar');
    setUsedMyInfo(true);
  };

  // AI 분석 단계에서 진행 바를 천천히 채움 (20% → 82%)
  const startAnalysisProgress = () => {
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 82) {
          clearInterval(progressTimerRef.current!);
          return prev;
        }
        // 빠를수록 속도 감소 (자연스러운 느낌)
        const increment = prev < 50 ? 0.8 : prev < 70 ? 0.4 : 0.15;
        return Math.min(82, prev + increment);
      });
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (!name.trim()) { setError('이름을 입력해주세요'); return; }
    if (!birthYear || Number(birthYear) < 1940 || Number(birthYear) > 2025) { setError('올바른 년도를 입력해주세요'); return; }
    if (!birthMonth || Number(birthMonth) < 1 || Number(birthMonth) > 12) { setError('올바른 월을 입력해주세요'); return; }
    if (!birthDay || Number(birthDay) < 1 || Number(birthDay) > 31) { setError('올바른 일을 입력해주세요'); return; }

    setError(null);
    setProgress(0);
    setProgressLabel('사주 데이터 계산 중...');
    setStep('generating');

    try {
      // 1. Reading 생성 (만세력 계산 포함)
      const { data: reading, error: createError } = await createReading({
        name: name.trim(),
        gender,
        birthYear: Number(birthYear),
        birthMonth: Number(birthMonth),
        birthDay: Number(birthDay),
        birthHour: SIJI_TO_HOUR[birthTime] ?? null,
        birthMinute: 0,
        isLunar: calendar === 'lunar',
        isLeapMonth: false,
        concerns: ['career', 'love', 'wealth'],
      });

      if (createError || !reading) {
        throw new Error(createError || '분석 생성에 실패했습니다.');
      }

      // 사이드바에 "종합 사주 리포트"로 표시
      await updateReadingMeta(reading.id, { title: '종합 사주 리포트' });

      setProgress(15);

      // 2. Status를 paid로 변경 (무료 제공이지만 PDF 생성을 위해 paid 상태 필요)
      const statusRes = await fetch('/api/saju/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId: reading.id, status: 'paid' }),
      });

      if (!statusRes.ok) {
        throw new Error('상태 업데이트에 실패했습니다.');
      }

      setProgress(20);
      setProgressLabel('AI가 사주를 분석하고 있어요...');
      startAnalysisProgress();

      // 3. AI 종합 분석 생성 (스트리밍)
      // 서버는 streamText로 AI 응답을 스트리밍하며, onFinish에서 DB 저장
      // 클라이언트는 스트림을 끝까지 읽어 서버 onFinish 완료를 보장
      const analyzeRes = await fetch('/api/saju/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId: reading.id }),
      });

      if (!analyzeRes.ok) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.error || 'AI 분석 생성에 실패했습니다.');
      }

      // 스트림 전체 소비
      if (analyzeRes.body) {
        const reader = analyzeRes.body.getReader();
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      setProgress(87);
      setProgressLabel('PDF 리포트 생성 중...');

      // onFinish(DB 저장)는 스트림 종료 후 비동기 실행되므로
      // status = 'completed' 가 될 때까지 폴링
      {
        const maxAttempts = 20;
        const interval = 1000;
        let completed = false;
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise((r) => setTimeout(r, interval));
          const statusRes = await fetch(`/api/saju/update-status?readingId=${reading.id}`);
          if (statusRes.ok) {
            const { status } = await statusRes.json();
            if (status === 'completed') { completed = true; break; }
            if (status === 'failed') throw new Error('AI 분석 저장에 실패했습니다.');
          }
        }
        if (!completed) throw new Error('분석 저장이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.');
      }

      // 4. PDF 다운로드
      const pdfRes = await fetch(`/api/saju/pdf/${reading.id}`);
      if (!pdfRes.ok) throw new Error('PDF 생성에 실패했습니다.');

      setProgress(100);

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `사주랩_${name.trim()}_종합분석리포트_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStep('done');
    } catch (err) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setStep('error');
    }
  };

  const inputClass = "w-full border border-input bg-background rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none placeholder:text-muted-foreground transition-colors";

  if (step === 'generating') {
    const pct = Math.round(progress);
    const stageIndex = pct < 15 ? 0 : pct < 20 ? 1 : pct < 87 ? 2 : 3;
    const stages = [
      { label: '사주 데이터 계산', done: pct >= 15 },
      { label: '분석 준비', done: pct >= 20 },
      { label: 'AI 종합 분석', done: pct >= 87 },
      { label: 'PDF 생성', done: pct >= 100 },
    ];
    return (
      <div className="min-h-[calc(100vh-48px)] bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-bold text-foreground mb-1 text-center">리포트 생성 중</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">{progressLabel}</p>

          {/* 진행률 바 */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">진행률</span>
            <span className="text-sm font-bold text-primary">{pct}%</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* 단계 목록 */}
          <div className="space-y-2.5">
            {stages.map((stage, i) => {
              const isActive = i === stageIndex && pct < 100;
              const isDone = stage.done;
              return (
                <div key={stage.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isDone ? 'bg-primary' : isActive ? 'bg-primary/20 border border-primary' : 'bg-secondary'
                  }`}>
                    {isDone ? (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span className={`text-sm transition-colors ${
                    isDone ? 'text-foreground font-medium' : isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                  }`}>
                    {stage.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-xs text-primary animate-pulse">진행 중</span>
                  )}
                  {isDone && (
                    <span className="ml-auto text-xs text-muted-foreground">완료</span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground/60 mt-6 text-center">보통 30초~1분 정도 소요됩니다</p>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-[calc(100vh-48px)] bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">리포트가 생성되었습니다!</h2>
          <p className="text-sm text-muted-foreground mb-8">PDF 파일이 자동으로 다운로드됩니다.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setStep('input'); setUsedMyInfo(false); }}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              다른 사람 리포트 받기
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-48px)] bg-background flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">종합 사주 리포트</h1>
          <p className="text-sm text-muted-foreground">
            AI가 분석한 상세 사주 리포트를 PDF로 받아보세요
          </p>
          {/* [별 시스템 비활성화] 별 사용량 표시 숨김 */}
        </div>

        {/* 이전 리포트 재다운로드 */}
        {completedReports.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">이전 리포트</h2>
            <div className="space-y-2">
              {completedReports.map((report) => (
                <a
                  key={report.id}
                  href={`/api/saju/pdf/${report.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-background hover:bg-secondary transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.birth_year}.{String(report.birth_month).padStart(2, '0')}.{String(report.birth_day).padStart(2, '0')}
                      {' · '}
                      {report.created_at.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    PDF 받기
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-4 border-t border-border" />
          </div>
        )}

        {/* 내 정보 사용하기 */}
        {previousBirthInfo && !usedMyInfo && (
          <button
            onClick={fillMyInfo}
            className="w-full mb-4 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-primary/10 border border-primary/30 hover:border-primary/50 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-primary">내 정보 사용하기</p>
              <p className="text-[11px] text-muted-foreground">{previousBirthInfo.name} · {previousBirthInfo.birthYear}.{previousBirthInfo.birthMonth}.{previousBirthInfo.birthDay}</p>
            </div>
          </button>
        )}

        {usedMyInfo && (
          <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-xs text-primary">내 정보가 입력되었습니다</span>
            <button
              onClick={() => {
                setUsedMyInfo(false);
                setName(''); setBirthYear(''); setBirthMonth(''); setBirthDay('');
                setBirthTime('unknown'); setGender('male'); setCalendar('solar');
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              초기화
            </button>
          </div>
        )}

        {/* 입력 폼 */}
        <div className="space-y-4">
          {/* 에러 */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* 이름 */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className={inputClass}
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">생년월일</label>
            <div className="flex gap-2">
              <input type="number" inputMode="numeric" placeholder="1990" min={1940} max={2025}
                value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                className="flex-[2] border border-input bg-background rounded-xl px-3 py-3 text-center text-sm text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none placeholder:text-muted-foreground"
              />
              <input type="number" inputMode="numeric" placeholder="월" min={1} max={12}
                value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}
                className="flex-1 border border-input bg-background rounded-xl px-3 py-3 text-center text-sm text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none placeholder:text-muted-foreground"
              />
              <input type="number" inputMode="numeric" placeholder="일" min={1} max={31}
                value={birthDay} onChange={(e) => setBirthDay(e.target.value)}
                className="flex-1 border border-input bg-background rounded-xl px-3 py-3 text-center text-sm text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* 태어난 시간 */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">태어난 시간</label>
            <select
              value={birthTime} onChange={(e) => setBirthTime(e.target.value)}
              className={inputClass}
            >
              {SIJI_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* 성별 */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">성별</label>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    gender === g
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-border/60 hover:bg-secondary'
                  }`}
                >
                  {g === 'male' ? '남' : '여'}
                </button>
              ))}
            </div>
          </div>

          {/* 달력 */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">달력</label>
            <div className="grid grid-cols-2 gap-2">
              {(['solar', 'lunar'] as const).map((c) => (
                <button key={c} type="button" onClick={() => setCalendar(c)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    calendar === c
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-border/60 hover:bg-secondary'
                  }`}
                >
                  {c === 'solar' ? '양력' : '음력'}
                </button>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            className="w-full mt-4 py-4 rounded-2xl bg-primary text-primary-foreground text-base font-semibold
              hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            종합 리포트 생성하기 (무료)
          </button>

          {/* [별 시스템 비활성화] 별 충전 링크 숨김 */}
        </div>
      </div>
    </div>
  );
}
