"use client";

const testimonials = [
  {
    name: "박*우",
    age: "30대 남성",
    color: "#a78bfa",
    text: "제가 이때까지 살아온 거나 성격을 맞춰서 놀랐어요.. 심지어 지금 하고 있는 일도 맞췄네요 소름",
    time: "오후 3:42",
  },
  {
    name: "변*희",
    age: "40대 여성",
    color: "#f472b6",
    text: "사주보러 자주 다녔는데 매번 다른 얘기 들었거든요.. 사주랩에서 본 건 진짜 소름 ㄷㄷ",
    time: "오후 5:17",
  },
  {
    name: "김*현",
    age: "20대 여성",
    color: "#34d399",
    text: "호기심에 해봤는데 올해 이직운 있다는 거 듣고 용기 냈어요. 실제로 합격했습니다 ㅎㅎ",
    time: "오후 9:08",
  },
  {
    name: "이*호",
    age: "30대 남성",
    color: "#60a5fa",
    text: "궁합 분석 해봤는데 여자친구랑 왜 맨날 싸우는지 이유를 알겠더라고요 ㅋㅋ 신기함",
    time: "오후 11:23",
  },
  {
    name: "정*아",
    age: "20대 여성",
    color: "#fbbf24",
    text: "친구들이랑 재미로 해봤는데 다들 자기 얘기라고 난리.. 새벽까지 돌려봤어요",
    time: "오전 1:55",
  },
];

const realChatMessages = [
  { side: "left" as const, texts: ["우와 미쳤다 이게", "ㅋㅋㅋㅋㅋ"] },
  { side: "right" as const, texts: ["ㅋㅋㅋㅋ", "맞는거있어?"] },
  { side: "left" as const, texts: ["응 있어 헐 ㅋㅋㅋㅋ", "아니ㅋㅋㅋㅋㅋ", "뭐야ㅋㅋ", "에티오피아 갔다 온 거 기억해?"] },
  { side: "right" as const, texts: ["응응"] },
  { side: "left" as const, texts: ["사실 호주 돌아오기 전에 거기서 부동산이랑 금에 투자했거든ㅋㅋㅋㅋ"] },
  { side: "right" as const, texts: ["헐", "ㅋㅋㅋㅋㅋ헐?"] },
];

export default function SajuTestimonials() {
  return (
    <section className="py-10 px-4 bg-muted/30">
      <div className="max-w-lg mx-auto">
        <h2 className="text-base font-bold text-foreground mb-1.5">
          실제 이용 후기
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          사주랩를 이용해주신 분들의 생생한 후기
        </p>

        {/* 찐반응 카카오톡 대화 */}
        <div className="mb-6 rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[10px]">💬</span>
            </div>
            <span className="text-xs font-semibold text-foreground">친구에게 공유했더니...</span>
            <span className="text-[10px] text-muted-foreground ml-auto">실제 카톡 대화</span>
          </div>

          <div className="px-4 py-4 space-y-2.5">
            {realChatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-1 ${msg.side === "right" ? "items-end" : "items-start"}`}>
                {msg.texts.map((text, j) => (
                  <div
                    key={j}
                    className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed max-w-[75%] ${
                      msg.side === "right"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                  >
                    {text}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-border">
            <p className="text-[11px] text-muted-foreground text-center">
              재물운 분석 결과를 본 친구의 실제 반응 — 에티오피아 투자까지 맞춤
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {testimonials.map((t, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
                style={{ background: t.color }}
              >
                {t.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-foreground">
                    {t.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t.age}</span>
                  <span className="text-[10px] text-muted-foreground/60 ml-auto">
                    {t.time}
                  </span>
                </div>

                <div className="bg-card border border-border rounded-2xl rounded-tl-md px-3.5 py-2.5 w-fit max-w-[92%]">
                  <p className="text-[13px] leading-relaxed text-foreground">
                    {t.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
