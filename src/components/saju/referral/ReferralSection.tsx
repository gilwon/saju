'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrCreateReferralCode, getReferralStats } from '@/services/referral/actions';

interface ReferralStats {
  totalInvited: number;
  rewardedCount: number;
  totalRewardStars: number;
}

/**
 * 친구 초대 모달 컴포넌트
 * Navbar의 버튼을 눌러 열고, 오버레이로 표시됩니다.
 */
export default function ReferralSection({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      setIsLoading(true);
      try {
        const [codeResult, statsResult] = await Promise.all([
          getOrCreateReferralCode(),
          getReferralStats(),
        ]);
        if (codeResult.data) setReferralCode(codeResult.data.code);
        if (statsResult.data) setStats(statsResult.data);
      } catch (err) {
        console.error('레퍼럴 데이터 로드 실패:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isOpen]);

  const getInviteUrl = useCallback(() => {
    if (!referralCode) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/invite/${referralCode}`;
  }, [referralCode]);

  const handleCopy = useCallback(async () => {
    const url = getInviteUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getInviteUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#13131a] border border-[#2a2a3a] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 헤더 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">친구 초대</h3>
              <p className="text-sm text-gray-400">
                친구를 초대하면 나와 친구 모두{' '}
                <span className="text-yellow-400 font-bold">별 1개</span>를 받아요!
              </p>
            </div>

            {/* 초대 코드 + 복사 */}
            {referralCode && (
              <div>
                <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
                  내 초대 코드
                </label>
                <div className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-base font-mono text-purple-300 tracking-widest text-center select-all mb-3">
                  {referralCode}
                </div>
                <button
                  onClick={handleCopy}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    copied
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {copied ? '복사되었습니다!' : '초대 링크 복사하기'}
                </button>
              </div>
            )}

            {/* 초대 현황 */}
            {stats && stats.totalInvited > 0 && (
              <div className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-3 py-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-200">{stats.totalInvited}</p>
                    <p className="text-[10px] text-gray-500">초대한 친구</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-200">{stats.rewardedCount}</p>
                    <p className="text-[10px] text-gray-500">가입 완료</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-400">{stats.totalRewardStars}</p>
                    <p className="text-[10px] text-gray-500">획득한 별</p>
                  </div>
                </div>
              </div>
            )}

            {/* 닫기 */}
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors pt-1"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
