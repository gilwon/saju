"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { CHARACTER_LIST } from "@/lib/saju/characters";

function getPerPage(w: number) {
  if (w < 640) return 1;
  if (w < 1024) return 2;
  if (w < 1280) return 3;
  return 4;
}

const DRAG_THRESHOLD = 50;  // 페이지 전환 기준
const MOVE_THRESHOLD = 8;   // 클릭 vs 드래그 구분 기준

export default function CharacterCards() {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(4);
  const [dragOffset, setDragOffset] = useState(0);
  const isHoveredRef = useRef(false);
  const dragStartX = useRef<number | null>(null);
  // 실제로 움직였는지 여부 (클릭과 드래그 구분용)
  const didMoveRef = useRef(false);

  const totalPages = useCallback(
    () => Math.ceil(CHARACTER_LIST.length / perPage),
    [perPage]
  );

  useEffect(() => {
    const update = () => setPerPage(getPerPage(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages() - 1));
  }, [perPage, totalPages]);

  const goNext = useCallback(
    () => setPage((p) => (p + 1) % totalPages()),
    [totalPages]
  );
  const goPrev = useCallback(
    () => setPage((p) => (p - 1 + totalPages()) % totalPages()),
    [totalPages]
  );
  const goTo = useCallback((i: number) => setPage(i), []);

  useEffect(() => {
    const t = setInterval(() => {
      if (!isHoveredRef.current && !didMoveRef.current) goNext();
    }, 5000);
    return () => clearInterval(t);
  }, [goNext]);

  // ── 드래그 핸들러 ─────────────────────────────────────────────
  const onDragStart = useCallback((clientX: number) => {
    dragStartX.current = clientX;
    didMoveRef.current = false;
    setDragOffset(0);
  }, []);

  const onDragMove = useCallback((clientX: number) => {
    if (dragStartX.current === null) return;
    const offset = clientX - dragStartX.current;
    if (Math.abs(offset) > MOVE_THRESHOLD) {
      didMoveRef.current = true;
    }
    if (didMoveRef.current) setDragOffset(offset);
  }, []);

  const onDragEnd = useCallback((currentOffset: number) => {
    if (dragStartX.current === null) return;
    if (currentOffset < -DRAG_THRESHOLD) goNext();
    else if (currentOffset > DRAG_THRESHOLD) goPrev();
    dragStartX.current = null;
    setDragOffset(0);
    // didMoveRef는 click 이벤트 이후 리셋 (setTimeout으로 순서 보장)
    setTimeout(() => { didMoveRef.current = false; }, 0);
  }, [goNext, goPrev]);

  // 마우스 이벤트
  const onMouseDown = (e: React.MouseEvent) => onDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStartX.current !== null) onDragMove(e.clientX);
  };
  const onMouseUp = (e: React.MouseEvent) => onDragEnd(e.clientX - (dragStartX.current ?? e.clientX));
  const onMouseLeave = (e: React.MouseEvent) => {
    if (dragStartX.current !== null) onDragEnd(e.clientX - (dragStartX.current ?? e.clientX));
  };

  // 터치 이벤트
  const onTouchStart = (e: React.TouchEvent) => onDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => onDragMove(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    onDragEnd(endX - (dragStartX.current ?? endX));
  };

  const pages = Array.from({ length: totalPages() }, (_, i) =>
    CHARACTER_LIST.slice(i * perPage, (i + 1) * perPage)
  );

  const isDragging = didMoveRef.current;
  const translateX = `calc(-${page * 100}% + ${dragOffset}px)`;

  return (
    <div
      className="pt-5 md:pt-8 pb-3 md:pb-6"
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      <div className="relative">
        {/* 이전/다음 버튼 */}
        <button
          onClick={goPrev}
          aria-label="이전"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-background border-2 border-border shadow-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 text-xl font-bold select-none"
        >
          ‹
        </button>
        <button
          onClick={goNext}
          aria-label="다음"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-background border-2 border-border shadow-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 text-xl font-bold select-none"
        >
          ›
        </button>

        {/* 캐러셀 트랙 */}
        <div className="overflow-hidden px-12 md:px-14">
          <div
            className={`flex ${dragOffset === 0 ? "transition-transform duration-500 ease-in-out" : ""} cursor-grab active:cursor-grabbing select-none`}
            style={{ transform: `translateX(${translateX})` }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {pages.map((pageChars, pi) => (
              <div
                key={pi}
                className="flex-none w-full grid gap-3 md:gap-4"
                style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}
              >
                {pageChars.map((char) => (
                  <CharacterCard
                    key={char.id}
                    char={char}
                    onClickCapture={(e) => {
                      // 드래그였다면 클릭 차단
                      if (didMoveRef.current) e.preventDefault();
                    }}
                  />
                ))}
                {/* 마지막 페이지 빈 슬롯 */}
                {pageChars.length < perPage &&
                  Array.from({ length: perPage - pageChars.length }, (_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 페이지 인디케이터 */}
      <div className="flex justify-center items-center gap-2 pt-4 pb-2">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`${i + 1}페이지`}
            className={`rounded-full transition-all duration-300 ${
              i === page
                ? "w-8 h-2 bg-primary"
                : "w-2 h-2 bg-border hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CharacterCard({
  char,
  onClickCapture,
}: {
  char: (typeof CHARACTER_LIST)[number];
  onClickCapture: (e: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={`/chat/${char.id}`}
      className="block h-full"
      onClickCapture={onClickCapture}
    >
      <div className="group rounded-2xl overflow-hidden cursor-pointer bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        {/* 이미지 영역 */}
        <div className="aspect-[3/4] relative flex-shrink-0">
          <Image
            src={char.cardImage}
            alt={char.name}
            fill
            draggable={false}
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 pointer-events-none"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
          />
          <div className="absolute top-3 left-3 z-[1]">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-lg"
              style={{ backgroundColor: char.color }}
            >
              {char.service}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div
            className="absolute bottom-0 left-0 right-0 p-4"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
          >
            <h3 className="text-lg md:text-xl font-bold text-white">{char.name}</h3>
            <p className="text-xs text-white/80 font-medium">{char.title}</p>
          </div>
        </div>

        {/* 정보 영역 — 모든 카드 동일한 패딩/여백 */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1 space-y-2.5">
            <p className="text-sm text-muted-foreground italic leading-snug line-clamp-2 min-h-[2.625rem]">
              &ldquo;{char.quote}&rdquo;
            </p>
            <div className="flex flex-wrap gap-1.5">
              {char.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-1 rounded-full border border-border text-muted-foreground bg-muted/50 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 대화하기 버튼 — 항상 하단 고정 */}
          <div className="flex items-center justify-end mt-4 pt-3 border-t border-border">
            <span className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-md group-hover:bg-primary/90 transition-colors">
              대화하기
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
