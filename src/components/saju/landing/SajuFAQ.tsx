"use client";

import { useState } from "react";

const faqs = [
  {
    q: "별(★)은 뭔가요?",
    a: "별은 대화에 사용되는 포인트예요. 별 1개 = 메시지 1회이고, 모든 상담사에서 공통으로 사용됩니다. 로그인하면 총 3개를 무료로 드리고, 더 필요하시면 코인샵에서 충전할 수 있어요.",
  },
  {
    q: "무료로도 이용할 수 있나요?",
    a: "네, 로그인하시면 별 3개를 무료로 드려요. 어떤 상담사든 자유롭게 사용하실 수 있습니다.",
  },
  {
    q: "사주 분석이 정확한가요?",
    a: "만세력 절기 데이터를 기반으로 분 단위까지 정밀하게 사주를 계산하고, 전문가 수준의 AI가 해석합니다.",
  },
  {
    q: "태어난 시간을 모르면 어떻게 하나요?",
    a: "태어난 시간 없이도 연주, 월주, 일주 3기둥으로 분석이 가능합니다.",
  },
  {
    q: "다른 상담사와도 대화할 수 있나요?",
    a: "물론이죠! 처음 입력한 생년월일 정보가 저장되어, 다른 상담사와 대화할 때도 자동으로 활용됩니다.",
  },
  {
    q: "환불이 가능한가요?",
    a: "대화 크레딧 구매 후 사용 전이라면 전액 환불이 가능합니다. 이메일(your-email@example.com)로 문의해주세요.",
  },
  {
    q: "개인정보는 안전한가요?",
    a: "입력하신 개인정보는 사주 분석 외 목적으로 사용하지 않으며, 요청 시 즉시 삭제합니다.",
  },
];

export default function SajuFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-10 px-4 bg-background">
      <div className="max-w-lg mx-auto">
        <h2 className="text-base font-bold text-foreground mb-5">자주 묻는 질문</h2>
        <div className="space-y-1">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="text-sm font-semibold text-foreground pr-4">
                    {faq.q}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`flex-shrink-0 transition-transform duration-200 text-muted-foreground ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isOpen && (
                  <p className="text-sm text-muted-foreground leading-relaxed pb-4 -mt-1">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
