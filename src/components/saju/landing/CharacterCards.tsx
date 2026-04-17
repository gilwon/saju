"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { CHARACTER_LIST } from "@/lib/saju/characters";

export default function CharacterCards() {
  return (
    <div className="pt-5 md:pt-8 pb-6 px-4 md:px-6">
      {/*
        반응형 그리드:
        mobile  (<640px):  2열
        sm      (640px+):  3열
        md      (768px+):  4열
        xl      (1280px+): 5열  → 10개 = 2행 딱 맞게
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {CHARACTER_LIST.map((char) => (
          <CharacterCard key={char.id} char={char} />
        ))}
      </div>
    </div>
  );
}

function CharacterCard({ char }: { char: (typeof CHARACTER_LIST)[number] }) {
  return (
    <Link href={`/chat/${char.id}`} className="block h-full">
      <div className="group rounded-2xl overflow-hidden cursor-pointer bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        {/* 이미지 */}
        <div className="aspect-[3/4] relative flex-shrink-0">
          <Image
            src={char.cardImage}
            alt={char.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
          <div className="absolute top-3 left-3 z-[1]">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-lg"
              style={{ backgroundColor: char.color }}
            >
              {char.service}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div
            className="absolute bottom-0 left-0 right-0 p-3"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
          >
            <h3 className="text-base md:text-lg font-bold text-white">{char.name}</h3>
            <p className="text-[11px] text-white/80 font-medium">{char.title}</p>
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="p-3 flex flex-col flex-1">
          <div className="flex-1 space-y-2">
            <p className="text-xs text-muted-foreground italic leading-snug line-clamp-2 min-h-[2.25rem]">
              &ldquo;{char.quote}&rdquo;
            </p>
            <div className="flex flex-wrap gap-1">
              {char.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground bg-muted/50 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end mt-3 pt-2.5 border-t border-border">
            <span className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-md group-hover:bg-primary/90 transition-colors">
              대화하기
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
