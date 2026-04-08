'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { openCheckout } from '@/lib/paddle/client';
import type { ProductType } from '@/lib/paddle/config';

interface CoinShopClientProps {
  totalCoins: number;
  userId: string;
  userEmail?: string;
}

const STAR_PACKS: {
  type: ProductType;
  stars: number;
  price: number;
  badge?: string;
  description?: string;
}[] = [
  { type: 'stars30', stars: 30, price: 9900 },
  { type: 'stars70', stars: 70, price: 19900, badge: '인기' },
  { type: 'starsPremium', stars: 250, price: 39900, badge: '최고 가성비' },
];

export default function CoinShopClient({ totalCoins, userId, userEmail }: CoinShopClientProps) {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<ProductType>('stars70');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('paid') === 'true') {
      setShowSuccess(true);
      // URL에서 paid 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname);
      // 5초 후 자동 닫기
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      await openCheckout({
        productType: selected,
        userId,
        userEmail,
        successUrl: `${window.location.origin}/ko/coin-shop?paid=true`,
      });
    } catch {
      setError('결제 시스템을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#0a0a0f] flex flex-col items-center px-4 py-10">
      {/* 결제 완료 알림 */}
      {showSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 bg-green-500/15 border border-green-500/30 text-green-400 px-5 py-3.5 rounded-2xl shadow-lg shadow-green-500/10 backdrop-blur-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="font-semibold text-sm">결제가 완료되었습니다! 별이 충전되었어요.</span>
            <button onClick={() => setShowSuccess(false)} className="ml-1 text-green-500/60 hover:text-green-400 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 현재 보유 코인 */}
      <div className="text-center mb-10">
        <p className="text-sm text-gray-400 mb-2">현재 보유 별</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-yellow-400 text-3xl">&#9733;</span>
          <span className="text-4xl font-bold text-white">{totalCoins}</span>
        </div>
      </div>

      {/* 충전 패키지 */}
      <div className="w-full max-w-md space-y-3 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">별 충전</h2>
        {STAR_PACKS.map((pack) => (
          <button
            key={pack.type}
            onClick={() => setSelected(pack.type)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm transition-all ${
              selected === pack.type
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                : 'border-[#2a2a3a] bg-[#13131a] hover:border-[#3a3a4a]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-xl">&#9733;</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-200 text-base">{pack.stars}개</span>
                  {pack.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                      {pack.badge}
                    </span>
                  )}
                </div>
                {pack.description && (
                  <span className="text-[11px] text-purple-400">{pack.description}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-gray-200 text-base">
                {pack.price.toLocaleString()}원
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
      )}

      {/* 충전 버튼 */}
      <div className="w-full max-w-md">
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-purple-600 text-white text-base font-semibold
            hover:bg-purple-500 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : '충전하기'}
        </button>
      </div>
    </div>
  );
}
