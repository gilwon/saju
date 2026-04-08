import type { Metadata } from "next";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import SajuFooter from "@/components/saju/landing/SajuFooter";

export const metadata: Metadata = {
  title: "환불 정책 | 사주랩",
};

export default function RefundPolicyPage() {
  return (
    <SajuLayout>
      <div className="bg-[#0a0a0f] min-h-screen">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <h1 className="text-xl font-bold text-gray-100 mb-2">환불 정책</h1>
          <p className="text-xs text-gray-600 mb-8">최종 수정일: 2026년 3월 10일</p>

          <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">1. 개요</h2>
              <p>
                본 환불 정책은 Your Company Name(이하 &ldquo;회사&rdquo;)가 운영하는 사주랩(drsaju.com, 이하 &ldquo;서비스&rdquo;)에서
                제공하는 유료 서비스의 환불 조건 및 절차를 규정합니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">2. 유료 서비스 내용</h2>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                <li>별(Star) 충전: AI 사주 상담에 사용되는 디지털 재화</li>
                <li>종합 사주분석: AI 기반 사주 분석 서비스</li>
                <li>궁합 분석: AI 기반 궁합 분석 서비스</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">3. 환불 가능 조건</h2>
              <p className="mb-3">다음의 경우 결제일로부터 7일 이내에 환불을 요청할 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                <li>결제 후 서비스를 전혀 이용하지 않은 경우 (별 사용 0건, 분석 미열람)</li>
                <li>결제 오류로 중복 결제가 발생한 경우</li>
                <li>시스템 장애로 서비스를 정상적으로 이용할 수 없었던 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">4. 환불 불가 조건</h2>
              <p className="mb-3">다음의 경우에는 환불이 불가합니다:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                <li>충전한 별(Star)을 1개 이상 사용한 경우</li>
                <li>AI 사주 분석 결과를 열람한 경우</li>
                <li>AI 상담 대화를 1회 이상 진행한 경우</li>
                <li>결제일로부터 7일이 경과한 경우</li>
                <li>이용자의 단순 변심인 경우 (서비스 이용 후)</li>
              </ul>
              <div className="mt-4 bg-[#1a1a25] rounded-xl px-4 py-3 border border-[#2a2a3a]">
                <p className="text-xs text-gray-400">
                  본 서비스는 &ldquo;전자상거래 등에서의 소비자보호에 관한 법률&rdquo; 제17조 제2항 제5호에 따라,
                  디지털 콘텐츠의 제공이 개시된 경우 청약철회가 제한됩니다.
                  결제 시 이 사실을 고지하며, 이용자의 동의를 받습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">5. 환불 절차</h2>
              <ol className="list-decimal list-inside space-y-1.5 text-gray-400">
                <li>이메일(<a href="mailto:your-email@example.com" className="text-purple-400 hover:text-purple-300">your-email@example.com</a>)로 환불 요청</li>
                <li>요청 시 기재 사항: 결제자 이메일, 결제일시, 결제금액, 환불 사유</li>
                <li>회사는 요청 접수 후 3영업일 이내에 환불 가능 여부를 안내합니다</li>
                <li>환불 승인 시, 원래 결제 수단으로 5~10영업일 이내에 환불 처리됩니다</li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">6. 부분 환불</h2>
              <p>
                충전한 별의 일부만 사용한 경우, 미사용 별에 대한 부분 환불은 지원하지 않습니다.
                별은 사용 여부와 관계없이 하나의 충전 단위로 취급됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-100 mb-3">7. 문의</h2>
              <div className="text-gray-400 space-y-1">
                <p>환불 관련 문의는 아래로 연락해 주세요.</p>
                <p>이메일: <a href="mailto:your-email@example.com" className="text-purple-400 hover:text-purple-300">your-email@example.com</a></p>
                <p>상호: Your Company Name | 대표: Your Name</p>
              </div>
            </section>
          </div>
        </div>
        <SajuFooter />
      </div>
    </SajuLayout>
  );
}
