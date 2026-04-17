'use client';

import { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport, type UIMessage } from 'ai';
import { motion } from 'framer-motion';
import { getCharacter, type CharacterType } from '@/lib/saju/characters';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ChatPaywall from './ChatPaywall';
import CharacterAvatar from './CharacterAvatar';
import BirthInfoCard, { type BirthInfoData } from './BirthInfoCard';
import OhangChart from './OhangChart';
import { createReading } from '@/services/saju/actions';
import { updateReadingMeta } from '@/services/saju/chat-actions';
import { setGuestReadingId } from '@/utils/guest-session';
import { Link, useRouter } from '@/i18n/routing';

/** 오행 분포 */
interface FiveElements {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

interface ChatRoomProps {
  readingId?: string;
  characterId: CharacterType;
  initialMessages?: UIMessage[];
  starBalance: number;
  needsBirthInfo?: boolean;
  previousBirthInfo?: BirthInfoData;
  fiveElements?: FiveElements;
  isAdmin?: boolean;
}

export default function ChatRoom({
  readingId: initialReadingId,
  characterId,
  initialMessages = [],
  starBalance: initialStarBalance,
  needsBirthInfo = false,
  previousBirthInfo,
  fiveElements,
  isAdmin = false,
}: ChatRoomProps) {
  const character = getCharacter(characterId);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  // [별 시스템 비활성화] 잔액 추적 없이 무제한 사용
  // const [starBalance, setStarBalance] = useState(initialStarBalance);
  const [readingId] = useState(initialReadingId);
  const [showBirthForm, setShowBirthForm] = useState(needsBirthInfo);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // const isExhausted = starBalance <= 0;  // [별 시스템 비활성화]
  const isExhausted = false;
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showOhang, setShowOhang] = useState(false);

  const fetchSuggestions = async (assistantText: string) => {
    setSuggestions([]);
    setSuggestionsLoading(true);
    try {
      const res = await fetch('/api/saju/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          characterName: character.name,
          lastAssistantMessage: assistantText,
        }),
      });
      const data = await res.json();
      if (data.suggestions?.length) setSuggestions(data.suggestions);
    } catch {
      // 실패해도 무시
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const { messages, sendMessage, status } = useChat({
    transport: readingId
      ? new TextStreamChatTransport({
          api: '/api/saju/chat',
          body: { readingId, characterId },
        })
      : undefined,
    messages: initialMessages,
    onError: (error) => {
      if (error.message === 'ALL_MODELS_EXHAUSTED') {
        toast.error('모든 AI 모델의 오늘 사용량이 초과되었습니다. 내일 다시 시도해주세요.', {
          duration: 8000,
        });
      } else {
        toast.error('AI 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const prevStatusRef = useRef(status);

  // status가 streaming/submitted → ready로 변할 때 추천 질문 생성
  useEffect(() => {
    const wasLoading = prevStatusRef.current === 'streaming' || prevStatusRef.current === 'submitted';
    prevStatusRef.current = status;

    if (wasLoading && status === 'ready' && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'assistant') {
        const text = lastMsg.parts
          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map((p) => p.text)
          .join('');
        if (text) fetchSuggestions(text);
      }
    }
  }, [status, messages]); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading, showBirthForm, isAnalyzing]);

  const handleSubmit = (value: string) => {
    if (!readingId || isExhausted || isLoading) return;
    setSuggestions([]);
    sendMessage({ text: value });
  };

  const handleBirthInfoComplete = (newReadingId: string) => {
    setShowBirthForm(false);
    setIsAnalyzing(true);
    setGuestReadingId(characterId, newReadingId);
    setTimeout(() => {
      window.location.href = `${window.location.pathname}?r=${newReadingId}`;
    }, 1500);
  };

  const [isCreatingFromPrevious, setIsCreatingFromPrevious] = useState(false);
  const [showEditPreviousForm, setShowEditPreviousForm] = useState(false);
  const handleUsePrevious = async () => {
    if (!previousBirthInfo || isCreatingFromPrevious) return;
    setIsCreatingFromPrevious(true);
    try {
      const { data, error } = await createReading({
        name: previousBirthInfo.name,
        gender: previousBirthInfo.gender,
        birthYear: previousBirthInfo.birthYear,
        birthMonth: previousBirthInfo.birthMonth,
        birthDay: previousBirthInfo.birthDay,
        birthHour: previousBirthInfo.birthHour,
        birthMinute: 0,
        isLunar: previousBirthInfo.isLunar,
        isLeapMonth: false,
        concerns: ['other'],
      });
      if (error || !data) return;
      await updateReadingMeta(data.id, { birthCity: previousBirthInfo.birthCity, characterId });
      handleBirthInfoComplete(data.id);
    } catch {
      setIsCreatingFromPrevious(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-48px)] bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
        <Link href="/" className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <CharacterAvatar characterId={characterId} size="md" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate">
            {character.name}
          </h2>
          <p className="text-xs text-muted-foreground">{character.title}</p>
        </div>
        {/* 오행 그래프 버튼 */}
        {readingId && !showBirthForm && fiveElements && (
          <button
            onClick={() => setShowOhang(v => !v)}
            className={`flex-shrink-0 transition-colors p-1.5 rounded-lg ${
              showOhang ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
            title="오행 분포"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
        )}
        {/* 새 대화 버튼 */}
        {readingId && !showBirthForm && (
          <button
            onClick={() => {
              router.push(`/chat/${characterId}?new=true`);
            }}
            className="flex-shrink-0 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
          >
            새대화
          </button>
        )}
      </div>

      {/* 오행 그래프 */}
      {fiveElements && (
        <OhangChart
          fiveElements={fiveElements}
          isVisible={showOhang}
          onClose={() => setShowOhang(false)}
        />
      )}

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4">
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          {/* 사주 정보 입력 카드 (첫 유저) */}
          {showBirthForm && (
            <>
              {/* 캐릭터 인사 메시지 */}
              <div className="flex gap-2 items-end">
                <CharacterAvatar characterId={characterId} size="sm" />
                <div
                  className="rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed max-w-sm bg-secondary text-foreground"
                >
                  {characterId === 'charon_m' ? (
                    <>흠.. 나 <strong>{character.name}</strong>인데. 사주 한번 봐줄까? 아래 정보 좀 알려줘.</>
                  ) : characterId === 'charon_f' ? (
                    <>안녕하세요! <strong>{character.name}</strong>이에요. 두 분의 궁합을 봐드릴게요. 먼저 아래 정보를 알려주세요.</>
                  ) : characterId === 'minjun' ? (
                    <>어이, 동생 왔어? 나 <strong>{character.name}</strong>인데, 니 사주에서 돈 냄새 좀 맡아볼게. 아래 정보부터 줘봐.</>
                  ) : characterId === 'jian' ? (
                    <>안녕하세요, <strong>{character.name}</strong>이에요. 그 사람과의 인연.. 제가 한번 봐드릴게요. 먼저 아래 정보를 알려주세요.</>
                  ) : characterId === 'seojun' ? (
                    <>어이, 나 <strong>{character.name}</strong>인데. 니 커리어? 사주가 다 말해주거든. 아래 정보부터 줘봐.</>
                  ) : characterId === 'doyun' ? (
                    <>어이, 나 <strong>{character.name}</strong>인데. 사업? 창업? 니 사주에 답이 있어. 아래 정보부터 줘봐.</>
                  ) : (
                    <>보이네요.. <strong>{character.name}</strong>이에요. 2026년 운세를 펼쳐볼게요. 먼저 아래 정보를 알려주세요.</>
                  )}
                </div>
              </div>

              {/* 기존 사주정보 사용 버튼 */}
              {previousBirthInfo && !showEditPreviousForm && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 }}
                  className="ml-2 sm:ml-10 max-w-sm"
                >
                  <div
                    className="bg-card border border-primary/30 rounded-2xl p-4 hover:border-primary/60 transition-colors cursor-pointer"
                    onClick={handleUsePrevious}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <polyline points="17 11 19 13 23 9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">기존 정보로 바로 시작</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {previousBirthInfo.name} · {previousBirthInfo.birthYear}.{previousBirthInfo.birthMonth}.{previousBirthInfo.birthDay}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowEditPreviousForm(true); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="정보 수정"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUsePrevious(); }}
                          disabled={isCreatingFromPrevious}
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                          title="바로 시작"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 또는 구분선 */}
              {previousBirthInfo && !showEditPreviousForm && (
                <div className="ml-2 sm:ml-10 max-w-sm flex items-center gap-3 px-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] text-muted-foreground">또는 새로 입력</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {/* 입력 카드 (수정 모드 또는 새 입력) */}
              <BirthInfoCard
                characterId={characterId}
                onComplete={handleBirthInfoComplete}
                initialData={showEditPreviousForm ? previousBirthInfo : undefined}
                onCancel={showEditPreviousForm ? () => setShowEditPreviousForm(false) : undefined}
              />
            </>
          )}

          {/* 분석 중 상태 */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-12 gap-4"
            >
              <div className="relative">
                <CharacterAvatar characterId={characterId} size="lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {character.name}이(가) 사주를 분석하고 있어요
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}

          {/* 사주 정보 저장 완료 후, 대화 시작 전 캐릭터 대기 메시지 */}
          {!showBirthForm && !isAnalyzing && messages.length === 0 && readingId && (
            <div className="flex gap-2 items-end">
              <CharacterAvatar characterId={characterId} size="sm" />
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed max-w-sm bg-secondary text-foreground"
              >
                {characterId === 'charon_m' ? (
                  <>사주 확인했어. 궁금한 거 있으면 물어봐.</>
                ) : characterId === 'charon_f' ? (
                  <>사주 확인했어요. 궁금한 점 편하게 물어봐 주세요.</>
                ) : characterId === 'minjun' ? (
                  <>좋아, 사주 봤어. 뭐가 궁금해?</>
                ) : characterId === 'haeun' ? (
                  <>사주 확인했어요. 궁금하신 점을 편하게 물어봐 주세요.</>
                ) : characterId === 'jian' ? (
                  <>사주 확인했어요. 궁금한 점 있으시면 편하게 말씀해 주세요.</>
                ) : characterId === 'seojun' ? (
                  <>사주 확인했어. 뭐가 궁금해?</>
                ) : characterId === 'doyun' ? (
                  <>사주 봤어. 궁금한 거 물어봐.</>
                ) : (
                  <>사주 확인했어요. 궁금하신 점을 물어봐 주세요.</>
                )}
              </div>
            </div>
          )}

          {/* 채팅 메시지 */}
          {messages.map((msg, idx) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              character={character}
              isLast={idx === messages.length - 1 && !isLoading}
              suggestions={idx === messages.length - 1 ? suggestions : undefined}
              suggestionsLoading={idx === messages.length - 1 ? suggestionsLoading : undefined}
              onSuggestionClick={(text) => handleSubmit(text)}
            />
          ))}

          {/* 타이핑 인디케이터 */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 items-end"
            >
              <CharacterAvatar characterId={characterId} size="sm" />
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 bg-secondary"
              >
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </motion.div>
          )}

          {/* [별 시스템 비활성화] 페이월 숨김 */}
          {/* {readingId && isExhausted && !isLoading && (
            <ChatPaywall
              characterId={characterId}
              readingId={readingId}
              onPaymentComplete={() => window.location.reload()}
            />
          )} */}
        </div>
      </div>

      {/* 입력창 */}
      <ChatInput
        onSubmit={handleSubmit}
        disabled={showBirthForm || !readingId || isExhausted || isLoading}
      />
    </div>
  );
}
