"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/routing";
import type { SajuProfile, Gender } from "@/types/saju";
import { SIJI_LIST, HOUR_TO_SIJI } from "@/lib/saju/siji";
import { formatBirthYMD } from "@/lib/utils";
import {
  createProfile,
  updateProfile,
  deleteProfile,
  type ProfileInput,
} from "@/services/saju/profile-actions";

interface ProfileFormState {
  name: string;
  gender: Gender | "";
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  sijiValue: string;
  isLunar: boolean;
}

const EMPTY_FORM: ProfileFormState = {
  name: "",
  gender: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  sijiValue: "unknown",
  isLunar: false,
};

function profileToForm(p: SajuProfile): ProfileFormState {
  return {
    name: p.name,
    gender: p.gender,
    birthYear: String(p.birth_year),
    birthMonth: String(p.birth_month),
    birthDay: String(p.birth_day),
    sijiValue: p.birth_hour !== null ? (HOUR_TO_SIJI[p.birth_hour] ?? "unknown") : "unknown",
    isLunar: p.is_lunar,
  };
}

function formToInput(f: ProfileFormState): ProfileInput | null {
  if (!f.name.trim() || !f.gender || !f.birthYear || !f.birthMonth || !f.birthDay) return null;
  const siji = SIJI_LIST.find((s) => s.value === f.sijiValue);
  return {
    name: f.name.trim(),
    gender: f.gender as Gender,
    birthYear: Number(f.birthYear),
    birthMonth: Number(f.birthMonth),
    birthDay: Number(f.birthDay),
    birthHour: siji?.hour ?? null,
    isLunar: f.isLunar,
    isLeapMonth: false,
  };
}

function ProfileForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: ProfileFormState;
  onSubmit: (f: ProfileFormState) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<ProfileFormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (patch: Partial<ProfileFormState>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.gender || !form.birthYear || !form.birthMonth || !form.birthDay) {
      setErr("이름, 생년월일, 성별을 모두 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {err && <p className="text-red-500 text-sm">{err}</p>}

      <div>
        <label className="block text-sm font-medium text-[#191F28] mb-1">이름</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="이름을 입력하세요"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#3182F6] focus:ring-1 focus:ring-[#3182F6] outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#191F28] mb-1">생년월일</label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="1990"
            min={1900}
            max={2100}
            value={form.birthYear}
            onChange={(e) => set({ birthYear: e.target.value })}
            className="flex-[2] border border-gray-200 rounded-xl px-3 py-2.5 text-center text-sm focus:border-[#3182F6] focus:ring-1 focus:ring-[#3182F6] outline-none"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="1"
            min={1}
            max={12}
            value={form.birthMonth}
            onChange={(e) => set({ birthMonth: e.target.value })}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-center text-sm focus:border-[#3182F6] focus:ring-1 focus:ring-[#3182F6] outline-none"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="1"
            min={1}
            max={31}
            value={form.birthDay}
            onChange={(e) => set({ birthDay: e.target.value })}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-center text-sm focus:border-[#3182F6] focus:ring-1 focus:ring-[#3182F6] outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#191F28] mb-1">태어난 시간</label>
        <select
          value={form.sijiValue}
          onChange={(e) => set({ sijiValue: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#3182F6] focus:ring-1 focus:ring-[#3182F6] outline-none bg-white"
        >
          {SIJI_LIST.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#191F28] mb-1">성별</label>
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => set({ gender: g })}
              className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                form.gender === g
                  ? "border-[#3182F6] bg-[#3182F6]/5 text-[#3182F6]"
                  : "border-gray-200 text-[#191F28] hover:border-gray-300"
              }`}
            >
              {g === "male" ? "남" : "여"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#191F28] mb-1">달력 구분</label>
        <div className="grid grid-cols-2 gap-2">
          {([false, true] as const).map((lunar) => (
            <button
              key={String(lunar)}
              type="button"
              onClick={() => set({ isLunar: lunar })}
              className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                form.isLunar === lunar
                  ? "border-[#3182F6] bg-[#3182F6]/5 text-[#3182F6]"
                  : "border-gray-200 text-[#191F28] hover:border-gray-300"
              }`}
            >
              {lunar ? "음력" : "양력"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-[#8B95A1] rounded-xl py-2.5 text-sm font-medium hover:border-gray-300 transition-all"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {submitting ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function ProfilesClient({ initialProfiles }: { initialProfiles: SajuProfile[] }) {
  const [profiles, setProfiles] = useState<SajuProfile[]>(initialProfiles);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (msgTimer.current) clearTimeout(msgTimer.current);
    };
  }, []);

  const showMsg = (text: string, ok: boolean) => {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    setMsg({ text, ok });
    msgTimer.current = setTimeout(() => setMsg(null), 3000);
  };

  const handleAdd = async (form: ProfileFormState) => {
    const input = formToInput(form);
    if (!input) return;
    const { data, error } = await createProfile(input);
    if (error || !data) { showMsg(error ?? "저장에 실패했습니다.", false); return; }
    setProfiles((prev) => [data, ...prev]);
    setShowAddForm(false);
    showMsg("프로필이 추가되었습니다.", true);
  };

  const handleUpdate = async (id: string, form: ProfileFormState) => {
    const input = formToInput(form);
    if (!input) return;
    const { error } = await updateProfile(id, input);
    if (error) { showMsg(error, false); return; }
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, name: input.name, gender: input.gender, birth_year: input.birthYear, birth_month: input.birthMonth, birth_day: input.birthDay, birth_hour: input.birthHour, is_lunar: input.isLunar }
          : p
      )
    );
    setEditingId(null);
    showMsg("프로필이 수정되었습니다.", true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await deleteProfile(id);
    setDeletingId(null);
    if (error) { showMsg(error, false); return; }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    showMsg("프로필이 삭제되었습니다.", true);
  };

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`p-3 rounded-xl text-sm text-center ${msg.ok ? "bg-[#E8F7EF] text-[#10B981]" : "bg-[#FFF0F0] text-[#EF4444]"}`}>
          {msg.text}
        </div>
      )}

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm font-medium text-[#8B95A1] hover:border-[#3182F6] hover:text-[#3182F6] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 프로필 추가
        </button>
      )}

      {showAddForm && (
        <div className="border border-[#3182F6]/30 bg-[#F8FBFF] rounded-2xl p-5">
          <h2 className="text-base font-semibold text-[#191F28] mb-4">새 프로필</h2>
          <ProfileForm initial={EMPTY_FORM} onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} submitLabel="추가" />
        </div>
      )}

      {profiles.length === 0 && !showAddForm ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[#F9FAFB] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B95A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-[#191F28] font-semibold mb-1">저장된 프로필이 없어요</p>
          <p className="text-sm text-[#8B95A1]">자주 보는 사람의 정보를 저장해두세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) =>
            editingId === p.id ? (
              <div key={p.id} className="border border-[#3182F6]/30 bg-[#F8FBFF] rounded-2xl p-5">
                <h2 className="text-base font-semibold text-[#191F28] mb-4">프로필 수정</h2>
                <ProfileForm initial={profileToForm(p)} onSubmit={(form) => handleUpdate(p.id, form)} onCancel={() => setEditingId(null)} submitLabel="저장" />
              </div>
            ) : (
              <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start justify-between hover:border-gray-200 hover:shadow-sm transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold text-[#191F28]">{p.name}</span>
                    <span className="text-xs text-[#8B95A1]">{p.gender === "male" ? "남" : "여"}</span>
                  </div>
                  <p className="text-sm text-[#8B95A1]">
                    {formatBirthYMD(p.birth_year, p.birth_month, p.birth_day)}
                    {p.is_lunar ? " (음력)" : " (양력)"}
                    {p.birth_hour !== null && ` · ${p.birth_hour}시`}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={() => setEditingId(p.id)} className="text-xs text-[#3182F6] hover:underline font-medium">수정</button>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="text-xs text-[#EF4444] hover:underline font-medium disabled:opacity-50">
                    {deletingId === p.id ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {profiles.length > 0 && (
        <div className="pt-4 text-center">
          <Link href="/reading" className="inline-flex items-center gap-2 text-sm text-[#3182F6] hover:underline font-medium">
            저장된 프로필로 사주 분석 시작하기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
