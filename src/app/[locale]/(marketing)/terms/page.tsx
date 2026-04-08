import { Link } from "@/i18n/routing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | 사주랩",
  description: "사주랩 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          홈으로 돌아가기
        </Link>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-white mb-2">이용약관</h1>
        <p className="text-sm text-gray-500 mb-10">
          작성일: 2026년 3월 10일 | 시행일: 2026년 3월 10일
        </p>

        {/* 본문 */}
        <div className="space-y-10 text-[15px] leading-relaxed">
          {/* 제1조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제1조 (목적)
            </h2>
            <p className="text-gray-300">
              이 약관은 Your Company Name(이하 &quot;회사&quot;)가 운영하는
              &quot;사주랩&quot;(drsaju.com, 이하 &quot;서비스&quot;)의 이용과
              관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한
              사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제2조 (용어의 정의)
            </h2>
            <p className="text-gray-300 mb-2">
              이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                <strong className="text-gray-100">&quot;서비스&quot;</strong>란
                회사가 제공하는 AI 기반 사주 상담 서비스(사주팔자, 자미두수,
                서양점성술 통합 분석)를 말합니다.
              </li>
              <li>
                <strong className="text-gray-100">&quot;회원&quot;</strong>이란
                회사와 이용계약을 체결하고 서비스를 이용하는 자를 말합니다.
              </li>
              <li>
                <strong className="text-gray-100">&quot;별&quot;</strong>이란
                서비스 내에서 AI 상담을 이용하기 위해 충전하는 가상 재화를
                말합니다.
              </li>
              <li>
                <strong className="text-gray-100">&quot;AI 상담&quot;</strong>이란
                인공지능 기술을 활용하여 사용자의 생년월일시 정보를 기반으로
                제공되는 사주 분석 및 상담 서비스를 말합니다.
              </li>
              <li>
                <strong className="text-gray-100">&quot;계정&quot;</strong>이란
                회원이 서비스에 로그인하기 위해 사용하는 Google 계정을 말합니다.
              </li>
            </ol>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제3조 (서비스 이용계약의 성립)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                이용계약은 회원이 되고자 하는 자가 이 약관에 동의하고, Google
                OAuth를 통해 로그인을 완료함으로써 성립됩니다.
              </li>
              <li>
                회사는 다음 각 호에 해당하는 경우 이용계약의 승낙을 거부하거나
                사후에 이용계약을 해지할 수 있습니다.
                <ul className="list-disc list-inside pl-5 mt-1 space-y-1">
                  <li>타인의 정보를 도용한 경우</li>
                  <li>서비스의 정상적인 운영을 방해한 경우</li>
                  <li>관련 법령에 위반되거나 사회의 안녕질서를 해하는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제4조 (서비스의 내용)
            </h2>
            <p className="text-gray-300 mb-2">
              회사가 제공하는 서비스의 내용은 다음과 같습니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                <strong className="text-gray-100">AI 사주 상담:</strong>{" "}
                사주팔자, 자미두수, 서양점성술을 통합 분석한 AI 기반 상담
                서비스를 제공합니다.
              </li>
              <li>
                <strong className="text-gray-100">무료 체험:</strong> 신규
                회원에게 3회의 무료 상담 체험 기회를 제공합니다.
              </li>
              <li>
                <strong className="text-gray-100">별 충전:</strong> 무료 체험
                소진 후 추가 상담을 위해 별을 충전하여 이용할 수 있습니다.
              </li>
            </ol>
            <p className="text-gray-400 mt-3 text-sm">
              서비스의 구체적인 내용과 이용 방법은 서비스 화면을 통해 안내됩니다.
            </p>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제5조 (별 충전 및 결제)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                별 충전 상품은 다음과 같습니다.
                <ul className="list-disc list-inside pl-5 mt-1 space-y-1">
                  <li>30개: 9,900원</li>
                  <li>70개: 19,900원</li>
                  <li>120개: 29,900원</li>
                </ul>
              </li>
              <li>
                결제는 Paddle 결제 시스템을 통해 처리되며, 카카오페이 등 다양한
                결제 수단을 지원합니다.
              </li>
              <li>
                별의 유효기간은 충전일로부터 1년입니다. 유효기간이 경과한 별은
                자동 소멸되며, 환불 대상이 아닙니다.
              </li>
              <li>
                <strong className="text-gray-100">환불 규정:</strong>
                <ul className="list-disc list-inside pl-5 mt-1 space-y-1">
                  <li>
                    미사용 별은 결제일로부터 7일 이내에 전액 환불이 가능합니다.
                  </li>
                  <li>
                    사용한 별은 환불이 불가하며, 부분 사용 시 사용한 별을 제외한
                    나머지 별에 대해서만 결제일로부터 7일 이내에 환불이
                    가능합니다.
                  </li>
                  <li>
                    환불 요청은 이메일(your-email@example.com)을 통해 접수할 수
                    있습니다.
                  </li>
                  <li>
                    환불 처리는 영업일 기준 3~5일 이내에 완료됩니다.
                  </li>
                </ul>
              </li>
            </ol>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제6조 (AI 상담 면책)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                본 서비스의 AI 상담은 인공지능 기술을 활용하여 생성된 콘텐츠로,
                그 정확성, 완전성, 적시성을 보장하지 않습니다.
              </li>
              <li>
                AI 상담 결과는 오락 및 참고 목적으로만 제공되며, 전문적인 심리
                상담, 의료 상담, 법률 자문 등을 대체하지 않습니다.
              </li>
              <li>
                회원은 AI 상담 결과를 바탕으로 중요한 결정을 내리기 전에 반드시
                해당 분야의 전문가와 상담하시기 바랍니다.
              </li>
              <li>
                AI 상담 결과에 의존하여 발생한 어떠한 손해에 대해서도 회사는
                책임을 지지 않습니다.
              </li>
            </ol>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제7조 (회원의 의무)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                회원은 서비스 이용 시 관계 법령, 이 약관의 규정, 이용안내 및
                주의사항을 준수하여야 합니다.
              </li>
              <li>
                회원은 다음 각 호의 행위를 하여서는 안 됩니다.
                <ul className="list-disc list-inside pl-5 mt-1 space-y-1">
                  <li>타인의 개인정보를 도용하는 행위</li>
                  <li>
                    서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이
                    상업적으로 이용하는 행위
                  </li>
                  <li>
                    서비스의 운영을 방해하거나 안정성을 해치는 행위
                  </li>
                  <li>
                    자동화된 수단(봇, 크롤러 등)을 이용하여 서비스에 접근하는
                    행위
                  </li>
                  <li>
                    기타 관계 법령에 위반되는 행위
                  </li>
                </ul>
              </li>
            </ol>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제8조 (서비스의 제한 및 중지)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                회사는 다음 각 호에 해당하는 경우 서비스의 전부 또는 일부를
                제한하거나 중지할 수 있습니다.
                <ul className="list-disc list-inside pl-5 mt-1 space-y-1">
                  <li>서비스용 설비의 보수, 점검, 교체 등 정기 또는 임시 점검</li>
                  <li>정전, 제반 설비의 장애 또는 이용량의 폭주 등</li>
                  <li>천재지변, 국가비상사태 등 불가항력적 사유</li>
                  <li>회원이 본 약관을 위반한 경우</li>
                </ul>
              </li>
              <li>
                회사는 서비스의 제한 또는 중지 시 사전에 공지하며, 불가피한
                경우에는 사후에 공지할 수 있습니다.
              </li>
            </ol>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제9조 (개인정보 보호)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                회사는 회원의 개인정보를 관련 법령에 따라 보호하며, 개인정보의
                수집, 이용, 제공에 관한 사항은 별도의 개인정보처리방침에 따릅니다.
              </li>
              <li>
                개인정보처리방침은{" "}
                <Link
                  href="/privacy-policy"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                >
                  여기
                </Link>
                에서 확인하실 수 있습니다.
              </li>
              <li>
                회사는 서비스 제공을 위해 회원의 Google 계정 정보(이메일, 이름,
                프로필 이미지)와 입력한 생년월일시 정보를 수집합니다.
              </li>
            </ol>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제10조 (면책조항)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등
                불가항력적인 사유로 서비스를 제공할 수 없는 경우에는 책임이
                면제됩니다.
              </li>
              <li>
                회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을
                지지 않습니다.
              </li>
              <li>
                회사는 회원이 서비스를 통해 얻은 정보 또는 자료 등으로 인해 발생한
                손해에 대하여 책임을 지지 않습니다.
              </li>
              <li>
                회사는 회원 간 또는 회원과 제3자 사이에서 발생한 분쟁에 대하여
                개입할 의무가 없으며, 이로 인한 손해를 배상할 책임이 없습니다.
              </li>
            </ol>
          </section>

          {/* 제11조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제11조 (분쟁 해결)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                이 약관에 관한 분쟁은 대한민국 법률을 준거법으로 합니다.
              </li>
              <li>
                서비스 이용과 관련하여 회사와 회원 사이에 분쟁이 발생한 경우,
                쌍방은 원만한 해결을 위해 성실히 협의합니다.
              </li>
              <li>
                협의로 해결되지 않는 분쟁에 대한 소송의 관할법원은
                서울중앙지방법원으로 합니다.
              </li>
            </ol>
          </section>

          {/* 제12조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제12조 (약관의 변경)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-1">
              <li>
                회사는 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할 수
                있습니다.
              </li>
              <li>
                약관이 변경되는 경우 회사는 변경 내용과 시행일을 서비스 내
                공지사항 또는 이메일을 통해 시행일 7일 전까지 공지합니다.
              </li>
              <li>
                회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고
                탈퇴할 수 있으며, 변경된 약관의 시행일 이후에도 서비스를 계속
                이용하는 경우 변경된 약관에 동의한 것으로 간주합니다.
              </li>
            </ol>
          </section>

          {/* 제13조 */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              제13조 (연락처)
            </h2>
            <p className="text-gray-300 mb-2">
              서비스에 관한 문의는 아래 연락처로 해주시기 바랍니다.
            </p>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-1.5 text-gray-300">
              <p>
                <span className="text-gray-500">상호명:</span> Your Company Name
              </p>
              <p>
                <span className="text-gray-500">대표자:</span> Your Name
              </p>
              <p>
                <span className="text-gray-500">사업자등록번호:</span>{" "}
                000-00-00000
              </p>
              <p>
                <span className="text-gray-500">통신판매업 신고번호:</span> 제
                0000-지역-0000 호
              </p>
              <p>
                <span className="text-gray-500">소재지:</span> Your Address
              </p>
              <p>
                <span className="text-gray-500">이메일:</span>{" "}
                <a
                  href="mailto:your-email@example.com"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                >
                  your-email@example.com
                </a>
              </p>
            </div>
          </section>

          {/* 부칙 */}
          <section className="border-t border-gray-800 pt-8">
            <h2 className="text-lg font-semibold text-white mb-3">부칙</h2>
            <p className="text-gray-300">
              이 약관은 2026년 3월 10일부터 시행합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
