'use client';

import { useRef, useCallback, type KeyboardEvent, type FormEvent } from 'react';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
  }, []);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const el = textareaRef.current;
      if (!el || !el.value.trim() || disabled) return;
      onSubmit(el.value.trim());
      el.value = '';
      el.style.height = 'auto';
    },
    [onSubmit, disabled],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.nativeEvent.isComposing) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className="sticky bottom-0 bg-background border-t border-border px-3 sm:px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="메시지를 입력하세요..."
          disabled={disabled}
          onInput={handleResize}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
            disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
            placeholder:text-muted-foreground transition-colors"
        />
        <button
          type="submit"
          disabled={disabled}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center
            hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </form>
      {/* [별 시스템 비활성화] 별 충전 안내 숨김 */}
    </div>
  );
}
