"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { CHARACTER_LIST } from "@/lib/saju/characters";

function getPerPage(w: number) {
  if (w < 640) return 1;
  if (w < 1024) return 2;
  return 3;
}

const DRAG_THRESHOLD = 50; // px — 이 이상 드래그해야 페이지 전환

export default function CharacterCards() {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isHoveredRef = useRef(false);
  const dragStartX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

  // 자동 슬라이드
  useEffect(() => {
    const t = setInterval(() => {
      if (!isHoveredRef.current && !isDragging) goNext();
    }, 5000);
    return () => clearInterval(t);
  }, [goNext, isDragging]);

  // ── 드래그 핸들러 (마우스 + 터치 공통) ──────────────────────
  const onDragStart = useCallback((clientX: number) => {
    dragStartX.current = clientX;
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const onDragMove = useCallback((clientX: number) => {
    if (dragStartX.current === null) return;
    setDragOffset(clientX - dragStartX.current);
  }, []);

  const onDragEnd = useCallback(() => {
    if (dragStartX.current === null) return;
    if (dragOffset < -DRAG_THRESHOLD) goNext();
    else if (dragOffset > DRAG_THRESHOLD) goPrev();
    dragStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);
  }, [dragOffset, goNext, goPrev]);

  // 마우스 이벤트
  const onMouseDown = (e: React.MouseEvent) => onDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => { if (isDragging) onDragMove(e.clientX); };
  const onMouseUp = () => onDragEnd();
  const onMouseLeave = () => { if (isDragging) onDragEnd(); };

  // 터치 이벤트
  const onTouchStart = (e: React.TouchEvent) => onDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => onDragMove(e.touches[0].clientX);
  const onTouchEnd = () => onDragEnd();

  const pages = Array.from({ length: totalPages() }, (_, i) =>
    CHARACTER_LIST.slice(i * perPage, (i + 1) * perPage)
  );

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
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/80 border border-border shadow hover:bg-muted transition-colors text-lg font-bold select-none"
        >
          ‹
        </button>
        <button
          onClick={goNext}
          aria-label="다음"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/80 border border-border shadow hover:bg-muted transition-colors text-lg font-bold select-none"
        >
          ›
        </button>

        {/* 캐러셀 트랙 */}
        <div className="overflow-hidden px-10 md:px-12">
          <div
            ref={trackRef}
            className={`flex ${isDragging ? "" : "transition-transform duration-500 ease-in-out"} cursor-grab active:cursor-grabbing select-none`}
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
                  <CharacterCard key={char.id} char={char} isDragging={isDragging} />
                ))}
                {pageChars.length < perPage &&
                  Array.from({ length: perPage - pageChars.length }, (_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 페이지 점 인디케이터 */}
      <div className="flex justify-center gap-1.5 py-3">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`${i + 1}페이지`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === page ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CharacterCard({
  char,
  isDragging,
}: {
  char: (typeof CHARACTER_LIST)[number];
  isDragging: boolean;
}) {
  const cardContent = (
    <div className="group rounded-2xl overflow-hidden cursor-pointer bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      {/* 이미지 영역 */}
      <div className="aspect-[3/4] relative flex-shrink-0">
        <Image
          src={char.cardImage}
          alt={char.name}
          fill
          draggable={false}
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 pointer-events-none"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
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

      {/* 정보 영역 */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground italic leading-snug line-clamp-2 min-h-[2.625rem]">
            &ldquo;{char.quote}&rdquo;
          </p>
          <div className="flex gap-1.5 mt-2.5 overflow-hidden">
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

        {/* 대화하기 버튼 */}
        <div className="flex items-center justify-end mt-4 pt-3 border-t border-border">
          <span className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-md group-hover:bg-primary/90 transition-colors">
            대화하기
          </span>
        </div>
      </div>
    </div>
  );

  // 드래그 중엔 Link 클릭 방지
  return isDragging ? (
    <div className="block h-full">{cardContent}</div>
  ) : (
    <Link href={`/chat/${char.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}
