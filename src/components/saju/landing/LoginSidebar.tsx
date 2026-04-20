'use client';

import { useState } from 'react';
import { logout } from '@/services/auth/actions';
import { updateReadingBirthInfo } from '@/services/saju/actions';
import { deleteReading } from '@/services/saju/chat-actions';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { CHARACTER_LIST, type CharacterType } from '@/lib/saju/characters';
import type { SajuProfile } from '@/types/saju';
import { HOUR_TO_SIJI as HOUR_TO_SIJI_MAP } from '@/lib/saju/siji';
import { formatBirthYMD } from '@/lib/utils';

interface ChatHistoryItem {
  id: string;
  character_id: CharacterType;
  character_name: string;
  character_avatar: string;
  title: string | null;
  reading_name: string;
  updated_at: string;
}

interface CurrentReading {
  id: string;
  characterId: CharacterType;
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  isLunar: boolean;
  birthCity?: string;
}

interface LoginSidebarProps {
  user?: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  } | null;
  chatHistory?: ChatHistoryItem[];
  currentReading?: CurrentReading;
  totalCoins?: number;
  isAdmin?: boolean;
  profiles?: SajuProfile[];
  isMobile?: boolean;
  onNavigate?: () => void;
}

const SIJI_LABELS: Record<number, string> = {
  23: '자시', 0: '자시', 1: '축시', 2: '축시', 3: '인시', 4: '인시',
  5: '묘시', 6: '묘시', 7: '진시', 8: '진시', 9: '사시', 10: '사시',
  11: '오시', 12: '오시', 13: '미시', 14: '미시', 15: '신시', 16: '신시',
  17: '유시', 18: '유시', 19: '술시', 20: '술시', 21: '해시', 22: '해시',
};

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

const HOUR_TO_SIJI: Record<number, string> = {
  23: 'ja', 0: 'ja', 1: 'chuk', 2: 'chuk', 3: 'in', 4: 'in',
  5: 'myo', 6: 'myo', 7: 'jin', 8: 'jin', 9: 'sa', 10: 'sa',
  11: 'o', 12: 'o', 13: 'mi', 14: 'mi', 15: 'sin', 16: 'sin',
  17: 'yu', 18: 'yu', 19: 'sul', 20: 'sul', 21: 'hae', 22: 'hae',
};

function profileToReadingUrl(p: SajuProfile): string {
  const sijiValue = p.birth_hour !== null ? (HOUR_TO_SIJI_MAP[p.birth_hour] ?? 'unknown') : 'unknown';
  const params = new URLSearchParams({
    name: p.name,
    year: String(p.birth_year),
    month: String(p.birth_month),
    day: String(p.birth_day),
    hour: sijiValue,
    gender: p.gender,
    calendar: p.is_lunar ? 'lunar' : 'solar',
  });
  return `/reading?${params.toString()}`;
}

export default function LoginSidebar({ user, chatHistory = [], currentReading, profiles = [], isMobile = false, onNavigate }: LoginSidebarProps) {
  const [localHistory, setLocalHistory] = useState(chatHistory);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentReading?.name ?? '');
  const [editYear, setEditYear] = useState(currentReading?.birthYear?.toString() ?? '');
  const [editMonth, setEditMonth] = useState(currentReading?.birthMonth?.toString() ?? '');
  const [editDay, setEditDay] = useState(currentReading?.birthDay?.toString() ?? '');
  const [editTime, setEditTime] = useState(currentReading?.birthHour != null ? (HOUR_TO_SIJI[currentReading.birthHour] ?? 'unknown') : 'unknown');
  const [editGender, setEditGender] = useState<'male' | 'female'>(currentReading?.gender ?? 'male');
  const [editCalendar, setEditCalendar] = useState<'solar' | 'lunar'>(currentReading?.isLunar ? 'lunar' : 'solar');
  const [editCity, setEditCity] = useState(currentReading?.birthCity ?? '서울');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleSaveEdit = async () => {
    if (!currentReading) return;
    if (!editName.trim()) { setEditError('이름을 입력해주세요'); return; }
    if (!editYear || Number(editYear) < 1940 || Number(editYear) > 2025) { setEditError('올바른 년도를 입력해주세요'); return; }
    if (!editMonth || Number(editMonth) < 1 || Number(editMonth) > 12) { setEditError('올바른 월을 입력해주세요'); return; }
    if (!editDay || Number(editDay) < 1 || Number(editDay) > 31) { setEditError('올바른 일을 입력해주세요'); return; }

    setIsSaving(true);
    setEditError(null);

    const { error } = await updateReadingBirthInfo(currentReading.id, {
      name: editName.trim(),
      gender: editGender,
      birthYear: Number(editYear),
      birthMonth: Number(editMonth),
      birthDay: Number(editDay),
      birthHour: SIJI_TO_HOUR[editTime] ?? null,
      isLunar: editCalendar === 'lunar',
      birthCity: editCity,
    });

    if (error) {
      setEditError(error);
      setIsSaving(false);
      return;
    }

    window.location.reload();
  };

  const inputClass = "border border-input bg-background rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-colors";

  return (
    <aside className={`${isMobile ? 'flex' : 'hidden lg:flex'} flex-col w-60 flex-shrink-0 bg-sidebar ${isMobile ? '' : 'border-r border-sidebar-border sticky top-12'} h-[calc(100vh-48px)] overflow-hidden`}>
      {!user ? (
        /* ── 비로그인 ── */
        <div className="flex flex-col items-center px-5 pt-10">
          <p className="text-sm font-semibold text-foreground text-center">
            로그인하고
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1 mb-6">
            대화 기록을 저장하세요
          </p>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-colors"
          >
            로그인 / 회원가입
          </Link>

          {/* 비회원도 이용 가능한 종합 사주 리포트 */}
          <Link
            href="/saju-report"
            className="w-full mt-3 flex items-center gap-2.5 px-3 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 hover:border-primary/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-primary group-hover:text-primary/80 transition-colors">
                나만의 사주 리포트
              </p>
              <p className="text-[10px] text-muted-foreground">AI 종합 분석 PDF</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-shrink-0 text-muted-foreground">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          <div className="w-full border-t border-sidebar-border mt-8 pt-5">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              로그인하면 모든 대화 기록을
              <br />
              저장하고 다시 볼 수 있어요
            </p>
          </div>
        </div>
      ) : (
        /* ── 로그인 상태 ── */
        <div className="flex flex-col h-full overflow-hidden">
          {/* 유저 정보 + 프로필 */}
          <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-sidebar-border">
            {/* 아바타 + 이름 */}
            <div className="flex items-center gap-3 mb-2.5">
              {user.avatar ? (
                <Image src={user.avatar} alt="" width={32} height={32} className="rounded-full flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {(user.name || user.email || '?')[0]}
                  </span>
                </div>
              )}
              <p className="text-sm font-semibold text-foreground truncate">
                {user.name || user.email?.split('@')[0]}
              </p>
            </div>

            {/* 프로필 목록 or 추가 버튼 */}
            {profiles.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">프로필</span>
                  <Link href="/my-profiles" className="text-[10px] text-primary hover:text-primary/80 transition-colors">관리</Link>
                </div>
                <div className="space-y-0.5">
                  {profiles.map((p) => (
                    <Link
                      key={p.id}
                      href={profileToReadingUrl(p)}
                      onClick={onNavigate}
                      className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-secondary transition-colors group"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-primary">{p.name[0]}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-foreground">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">{p.birth_year}년</span>
                      </div>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                href="/my-profiles"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                사용자 정보 추가
              </Link>
            )}
          </div>

          {/* [별 시스템 비활성화] 별 잔여량 / 충전 링크 숨김 */}

          {/* 종합 사주 리포트 CTA */}
          {currentReading && (
            <Link
              href="/saju-report"
              className="flex-shrink-0 mx-3 mt-3 flex items-center gap-2.5 px-3 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 hover:border-primary/40 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary group-hover:text-primary/80 transition-colors">
                  나만의 사주 리포트
                </p>
                <p className="text-[10px] text-muted-foreground">
                  AI 종합 분석 PDF {/* · &#9733; 10개 */}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-shrink-0 text-muted-foreground">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}

          {/* 대화 기록: 스크롤 가능한 중간 영역 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">


          <div className="px-3 pt-4">
            <div className="flex items-center justify-between px-1 mb-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                대화 기록
              </h3>
              <div className="relative">
                <button
                  onClick={() => setShowCharacterPicker(v => !v)}
                  className="text-[11px] text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  새 대화
                </button>
                {showCharacterPicker && (
                  <div className="absolute right-0 top-6 z-50 w-48 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                    {CHARACTER_LIST.map((char) => (
                      <Link
                        key={char.id}
                        href={`/chat/${char.id}?new=true`}
                        onClick={() => setShowCharacterPicker(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-secondary transition-colors"
                      >
                        <Image src={char.avatar} alt={char.name} width={24} height={24} className="rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground">{char.name}</p>
                          <p className="text-[10px] text-muted-foreground">{char.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {localHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1">
                아직 대화 기록이 없어요.
                <br />
                상담사를 선택해서 대화를 시작하세요!
              </p>
            ) : (
              <div className="space-y-1">
                {localHistory.map((item) => (
                  <div key={item.id} className="group relative flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-secondary transition-colors">
                    <Link
                      href={item.title === '종합 사주 리포트' ? '/saju-report' : `/chat/${item.character_id}?r=${item.id}`}
                      onClick={onNavigate}
                      className="flex items-center gap-2.5 min-w-0 flex-1"
                    >
                      <Image src={item.character_avatar} alt={item.character_name} width={28} height={28} className="rounded-full object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.title || `${item.character_name} · ${item.reading_name}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(item.updated_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!confirm('이 대화를 삭제할까요?')) return;
                        setDeletingId(item.id);
                        // 낙관적 업데이트
                        setLocalHistory(prev => prev.filter(h => h.id !== item.id));
                        const { error } = await deleteReading(item.id);
                        if (error) {
                          // 실패 시 복원
                          setLocalHistory(chatHistory);
                          alert('삭제에 실패했습니다: ' + error);
                        }
                        setDeletingId(null);
                      }}
                      disabled={deletingId === item.id}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all flex-shrink-0 disabled:opacity-50"
                      title="대화 삭제"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>{/* 스크롤 영역 끝 */}

          {/* 사주 정보 설정 (하단 고정) */}
          {currentReading && (
            <div className="flex-shrink-0 border-t border-sidebar-border overflow-x-hidden">
              <button
                onClick={() => setIsEditing((v) => !v)}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-secondary transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="text-xs font-semibold text-foreground">사주 정보</span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`ml-auto flex-shrink-0 transition-transform text-muted-foreground ${isEditing ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {!isEditing && (
                <div className="px-4 pb-2.5 text-xs text-muted-foreground space-y-0.5">
                  <p>{currentReading.name} · {currentReading.gender === 'male' ? '남' : '여'}</p>
                  <p>{currentReading.birthYear}.{currentReading.birthMonth}.{currentReading.birthDay} ({currentReading.isLunar ? '음력' : '양력'})</p>
                  <p>{currentReading.birthHour != null ? SIJI_LABELS[currentReading.birthHour] : '시간 모름'}</p>
                </div>
              )}

              {isEditing && (
                <div className="px-3 pb-3 space-y-2.5 overflow-x-hidden">
                  {editError && (
                    <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-2 py-1.5">{editError}</p>
                  )}

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">이름</label>
                    <input
                      type="text"
                      placeholder="홍길동"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">생년월일</label>
                    <div className="flex gap-1 min-w-0">
                      <input type="number" inputMode="numeric" placeholder="년" min={1940} max={2025}
                        value={editYear} onChange={(e) => setEditYear(e.target.value)}
                        className={`w-0 flex-[5] min-w-0 text-center ${inputClass}`}
                      />
                      <input type="number" inputMode="numeric" placeholder="월" min={1} max={12}
                        value={editMonth} onChange={(e) => setEditMonth(e.target.value)}
                        className={`w-0 flex-[3] min-w-0 text-center ${inputClass}`}
                      />
                      <input type="text" inputMode="numeric" placeholder="일"
                        value={editDay} onChange={(e) => setEditDay(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                        className={`w-0 flex-[3] min-w-0 text-center ${inputClass}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">태어난 시간</label>
                    <select
                      value={editTime} onChange={(e) => setEditTime(e.target.value)}
                      className={`w-full ${inputClass}`}
                    >
                      {SIJI_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">성별</label>
                      <div className="grid grid-cols-2 gap-1">
                        {(['male', 'female'] as const).map((g) => (
                          <button key={g} type="button" onClick={() => setEditGender(g)}
                            className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              editGender === g
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:border-border/80 hover:bg-secondary'
                            }`}
                          >
                            {g === 'male' ? '남' : '여'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">달력</label>
                      <div className="grid grid-cols-2 gap-1">
                        {(['solar', 'lunar'] as const).map((c) => (
                          <button key={c} type="button" onClick={() => setEditCalendar(c)}
                            className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              editCalendar === c
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:border-border/80 hover:bg-secondary'
                            }`}
                          >
                            {c === 'solar' ? '양력' : '음력'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">태어난 곳</label>
                    <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)}
                      className={`w-full ${inputClass}`}
                    />
                  </div>

                  <div className="flex gap-1.5 pt-0.5">
                    <button onClick={() => setIsEditing(false)}
                      className="flex-1 rounded-lg py-2 text-xs font-medium border border-border text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      취소
                    </button>
                    <button onClick={handleSaveEdit} disabled={isSaving}
                      className="flex-1 rounded-lg py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 하단: 유저 정보 + 로그아웃 (고정) */}
          <div className="flex-shrink-0 border-t border-sidebar-border">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                {user.avatar ? (
                  <Image src={user.avatar} alt="" width={28} height={28} className="rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary">
                      {(user.name || user.email || '?')[0]}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {user.name || '사용자'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="로그아웃"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
