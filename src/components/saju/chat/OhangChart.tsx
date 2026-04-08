'use client';

import { motion, AnimatePresence } from 'framer-motion';

/** 오행 분포 데이터 */
interface OhangData {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

interface OhangChartProps {
  fiveElements: OhangData;
  isVisible: boolean;
  onClose: () => void;
}

const ELEMENTS = [
  { key: 'wood' as const, label: '목', hanja: '木', emoji: '🌳', color: '#22c55e', bgColor: '#22c55e20' },
  { key: 'fire' as const, label: '화', hanja: '火', emoji: '🔥', color: '#ef4444', bgColor: '#ef444420' },
  { key: 'earth' as const, label: '토', hanja: '土', emoji: '⛰️', color: '#eab308', bgColor: '#eab30820' },
  { key: 'metal' as const, label: '금', hanja: '金', emoji: '⚔️', color: '#a1a1aa', bgColor: '#a1a1aa20' },
  { key: 'water' as const, label: '수', hanja: '水', emoji: '💧', color: '#3b82f6', bgColor: '#3b82f620' },
] as const;

export default function OhangChart({ fiveElements, isVisible, onClose }: OhangChartProps) {
  const total = Object.values(fiveElements).reduce((s, v) => s + v, 0);
  const maxValue = Math.max(...Object.values(fiveElements), 1);

  // 강/약 판단
  const sorted = [...ELEMENTS].sort((a, b) => fiveElements[b.key] - fiveElements[a.key]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="bg-card border border-border rounded-2xl mx-3 sm:mx-4 mb-3 p-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">오행 분포</h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 바 차트 */}
            <div className="space-y-2.5">
              {ELEMENTS.map((el, i) => {
                const value = fiveElements[el.key];
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;

                return (
                  <div key={el.key} className="flex items-center gap-2.5">
                    {/* 라벨 */}
                    <div className="w-14 flex items-center gap-1 flex-shrink-0">
                      <span className="text-sm">{el.emoji}</span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {el.label}({el.hanja})
                      </span>
                    </div>

                    {/* 바 */}
                    <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: el.color }}
                      />
                    </div>

                    {/* 값 */}
                    <div className="w-12 text-right flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: el.color }}>
                        {value}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-0.5">
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 요약 */}
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">가장 강한:</span>
                <span style={{ color: strongest.color }} className="font-semibold">
                  {strongest.emoji} {strongest.label}({strongest.hanja})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">가장 약한:</span>
                <span style={{ color: weakest.color }} className="font-semibold">
                  {weakest.emoji} {weakest.label}({weakest.hanja})
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
