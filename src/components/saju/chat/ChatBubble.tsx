'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { UIMessage } from 'ai';
import type { Character } from '@/lib/saju/characters';
import CharacterAvatar from './CharacterAvatar';

interface ChatBubbleProps {
  message: UIMessage;
  character: Character;
  isLast?: boolean;
  suggestions?: string[];
  suggestionsLoading?: boolean;
  onSuggestionClick?: (text: string) => void;
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

/** AI가 혹시 ---suggestions--- 마커를 포함했으면 제거 */
function stripSuggestionMarkers(text: string): string {
  return text.replace(/---suggestions---[\s\S]*?---end---/, '').trimEnd();
}

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export default function ChatBubble({ message, character, isLast, suggestions = [], suggestionsLoading, onSuggestionClick }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const rawText = getTextContent(message);
  const content = !isUser ? stripSuggestionMarkers(rawText) : rawText;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const showSuggestions = isLast && suggestions.length > 0 && onSuggestionClick;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
          <CharacterAvatar characterId={character.id} size="sm" />
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        {!isUser && (
          <p className="text-xs text-muted-foreground mb-1 ml-1">{character.name}</p>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-secondary text-foreground rounded-bl-md'
          }`}
        >
          {renderContent(content)}
        </div>

        {/* 복사 버튼 (AI 답변만) */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1 ml-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                복사됨
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                복사
              </>
            )}
          </button>
        )}

        {/* 추천 질문 로딩 */}
        {isLast && suggestionsLoading && !isUser && (
          <div className="flex gap-2 mt-2 ml-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-28 rounded-full bg-secondary animate-pulse" />
            ))}
          </div>
        )}

        {/* 추천 질문 버튼 */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 mt-2 ml-1">
            {suggestions.map((q, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(q)}
                className="text-xs px-3 py-2 rounded-full border border-border bg-card text-foreground hover:bg-secondary hover:border-primary/30 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
