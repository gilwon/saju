"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { CHARACTER_LIST } from "@/lib/saju/characters";

export default function CharacterCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const children = el.children;
    if (!children.length) return;
    const firstChild = children[0] as HTMLElement;
    const cardWidth = firstChild.offsetWidth;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    const index = Math.round(scrollLeft / (cardWidth + gap));
    if (index >= 0 && index < CHARACTER_LIST.length) {
      setActiveIndex(index);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const children = el.children;
    if (!children[index]) return;
    const child = children[index] as HTMLElement;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, []);

  // 5초마다 자동 스크롤 (무한루프)
  const isHoveredRef = useRef(false);
  useEffect(() => {
    const timer = setInterval(() => {
      if (isHoveredRef.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % CHARACTER_LIST.length;
        scrollTo(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [scrollTo]);

  return (
    <div className="pt-5 md:pt-8 pb-3 md:pb-6">
      <div
        ref={scrollRef}
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
        onTouchStart={() => { isHoveredRef.current = true; }}
        onTouchEnd={() => { isHoveredRef.current = false; }}
        className="grid grid-flow-col auto-cols-[72vw] md:auto-cols-[280px] gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory px-4 md:px-8 scrollbar-hide"
      >
        {CHARACTER_LIST.map((char) => (
          <div key={char.id} className="snap-center">
            <CharacterCard char={char} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 py-3">
        {CHARACTER_LIST.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CharacterCard({ char }: { char: (typeof CHARACTER_LIST)[number] }) {
  const cardContent = (
    <div className="group rounded-2xl overflow-hidden cursor-pointer bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      {/* 이미지 영역 — 고정 비율 */}
      <div className="aspect-[2/3] relative flex-shrink-0">
        <Image
          src={char.cardImage}
          alt={char.name}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          sizes="(min-width: 768px) 25vw, 75vw"
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
        {/* quote + 태그: flex-1로 남은 공간 채움 → 버튼 위치 통일 */}
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

        {/* 버튼 영역: mt-4 고정으로 라인이 버튼에 붙지 않게 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          {/* {!isLoggedIn && (
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <span className="text-yellow-500">&#9733;</span> 가입시 3별 무료 지급
            </span>
          )} */}
          <span className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-md group-hover:bg-primary/90 transition-colors ml-auto">
            대화하기
          </span>
        </div>
      </div>
    </div>
  );

  return <Link href={`/chat/${char.id}`} className="block h-full">{cardContent}</Link>;
}
