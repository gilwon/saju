import type { Metadata } from "next";
import { Link } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "개인정보처리방침",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
          홈으로 돌아가기
        </Link>

        {/* 제목 */}
        <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
          개인정보처리방침
        </h1>
        <p className="mb-12 text-sm text-gray-500">
          시행일: 2026년 3월 10일
        </p>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-300">
          {/* 1. 개인정보의 처리 목적 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              1. 개인정보의 처리 목적
            </h2>
            <p className="mb-2">
              사주랩(이하 &quot;서비스&quot;)는 다음의 목적을 위하여 개인정보를
              처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는
              이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를
              받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong className="text-gray-100">회원 가입 및 관리:</strong>{" "}
                회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의
                부정이용 방지, 각종 고지 및 통지
              </li>
              <li>
                <strong className="text-gray-100">서비스 제공:</strong> AI 기반
                사주 상담 서비스 제공, 사주팔자 분석, 자미두수 분석, 서양점성술
                분석, 상담 이력 관리
              </li>
              <li>
                <strong className="text-gray-100">결제 처리:</strong> 유료
                서비스(별 충전) 이용에 따른 결제 처리 및 환불
              </li>
              <li>
                <strong className="text-gray-100">서비스 개선:</strong> 서비스
                이용 통계 분석, 신규 서비스 개발 및 기존 서비스 개선
              </li>
            </ul>
          </section>

          {/* 2. 수집하는 개인정보 항목 및 수집 방법 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              2. 수집하는 개인정보 항목 및 수집 방법
            </h2>

            <h3 className="mb-2 mt-4 font-medium text-gray-100">
              가. 수집 항목
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      구분
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      수집 항목
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      회원가입 (Google OAuth)
                    </td>
                    <td className="px-3 py-2">이름, 이메일, 프로필 사진</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      사주 상담
                    </td>
                    <td className="px-3 py-2">
                      생년월일, 출생시간, 성별, 이름, 출생지(선택)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      결제
                    </td>
                    <td className="px-3 py-2">
                      결제 내역, 거래 ID (카드번호 등 결제 수단 정보는
                      Paddle이 직접 처리하며, 서비스는 보관하지 않음)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      자동 수집
                    </td>
                    <td className="px-3 py-2">
                      IP 주소, 브라우저 종류 및 버전, 기기 정보, 접속 로그,
                      쿠키, 서비스 이용 기록
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mb-2 mt-4 font-medium text-gray-100">
              나. 수집 방법
            </h3>
            <ul className="ml-5 list-disc space-y-1">
              <li>Google OAuth를 통한 소셜 로그인 시 자동 수집</li>
              <li>사주 상담 이용 시 사용자가 직접 입력</li>
              <li>서비스 이용 과정에서 자동으로 생성 및 수집</li>
            </ul>
          </section>

          {/* 3. 개인정보의 처리 및 보유 기간 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              3. 개인정보의 처리 및 보유 기간
            </h2>
            <p className="mb-2">
              서비스는 이용자의 개인정보를 수집 목적이 달성된 후에는 지체 없이
              파기합니다. 다만, 관계 법령에 의해 보존이 필요한 경우 해당 기간
              동안 보관합니다.
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong className="text-gray-100">회원 정보:</strong> 회원
                탈퇴 시 즉시 파기
              </li>
              <li>
                <strong className="text-gray-100">상담 기록:</strong> 회원
                탈퇴 시 즉시 파기
              </li>
              <li>
                <strong className="text-gray-100">
                  계약 또는 청약 철회에 관한 기록:
                </strong>{" "}
                5년 (전자상거래 등에서의 소비자보호에 관한 법률)
              </li>
              <li>
                <strong className="text-gray-100">
                  대금결제 및 재화 등의 공급에 관한 기록:
                </strong>{" "}
                5년 (전자상거래 등에서의 소비자보호에 관한 법률)
              </li>
              <li>
                <strong className="text-gray-100">
                  소비자 불만 또는 분쟁 처리에 관한 기록:
                </strong>{" "}
                3년 (전자상거래 등에서의 소비자보호에 관한 법률)
              </li>
              <li>
                <strong className="text-gray-100">
                  웹사이트 방문 기록 (로그):
                </strong>{" "}
                3개월 (통신비밀보호법)
              </li>
            </ul>
          </section>

          {/* 4. 개인정보의 제3자 제공 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              4. 개인정보의 제3자 제공
            </h2>
            <p className="mb-3">
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지
              않습니다. 다만, 서비스 운영을 위해 다음과 같이 개인정보를
              제공하고 있습니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      제공받는 자
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      제공 목적
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      제공 항목
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-3 py-2 align-top">Supabase (미국)</td>
                    <td className="px-3 py-2 align-top">
                      데이터베이스 저장 및 사용자 인증
                    </td>
                    <td className="px-3 py-2">
                      회원 정보, 상담 기록, 사주 데이터
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 align-top">
                      Google AI - Gemini (미국)
                    </td>
                    <td className="px-3 py-2 align-top">AI 사주 상담 처리</td>
                    <td className="px-3 py-2">
                      상담 내용 (사주 데이터, 질문 내용)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 align-top">Paddle (영국)</td>
                    <td className="px-3 py-2 align-top">결제 처리</td>
                    <td className="px-3 py-2">
                      이메일, 결제 관련 정보
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 align-top">Vercel (미국)</td>
                    <td className="px-3 py-2 align-top">웹 서비스 호스팅</td>
                    <td className="px-3 py-2">
                      IP 주소, 접속 로그, 서비스 이용 기록
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. 개인정보 처리 위탁 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              5. 개인정보 처리 위탁
            </h2>
            <p className="mb-3">
              서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리
              업무를 위탁하고 있습니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      수탁업체
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      위탁 업무
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-3 py-2">Supabase Inc.</td>
                    <td className="px-3 py-2">
                      클라우드 데이터베이스 및 인증 서비스 운영
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Google LLC</td>
                    <td className="px-3 py-2">
                      AI 모델(Gemini)을 통한 사주 상담 처리
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Paddle.com Market Limited</td>
                    <td className="px-3 py-2">결제 처리 및 정산</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Vercel Inc.</td>
                    <td className="px-3 py-2">웹 애플리케이션 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. 개인정보의 국외 이전 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              6. 개인정보의 국외 이전
            </h2>
            <p className="mb-3">
              서비스는 서비스 제공을 위해 아래와 같이 개인정보를 국외로
              이전하고 있습니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      이전받는 자
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      이전 국가
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      이전 항목
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-100">
                      이전 방법
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-3 py-2 align-top">Supabase Inc.</td>
                    <td className="px-3 py-2 align-top">미국</td>
                    <td className="px-3 py-2 align-top">
                      회원 정보, 상담 기록
                    </td>
                    <td className="px-3 py-2">네트워크를 통한 전송</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 align-top">Google LLC</td>
                    <td className="px-3 py-2 align-top">미국</td>
                    <td className="px-3 py-2 align-top">상담 내용</td>
                    <td className="px-3 py-2">네트워크를 통한 전송</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 align-top">
                      Paddle.com Market Ltd.
                    </td>
                    <td className="px-3 py-2 align-top">영국</td>
                    <td className="px-3 py-2 align-top">
                      이메일, 결제 정보
                    </td>
                    <td className="px-3 py-2">네트워크를 통한 전송</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 align-top">Vercel Inc.</td>
                    <td className="px-3 py-2 align-top">미국</td>
                    <td className="px-3 py-2 align-top">
                      접속 로그, IP 주소
                    </td>
                    <td className="px-3 py-2">네트워크를 통한 전송</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              각 업체는 해당 국가의 개인정보보호 관련 법률을 준수하며,
              이용자의 개인정보를 안전하게 관리하기 위한 기술적, 관리적
              보호조치를 취하고 있습니다.
            </p>
          </section>

          {/* 7. 정보주체의 권리, 의무 및 행사 방법 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              7. 정보주체의 권리, 의무 및 행사 방법
            </h2>
            <p className="mb-2">
              이용자(정보주체)는 개인정보 주체로서 다음과 같은 권리를 행사할 수
              있습니다.
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="mt-3">
              위 권리 행사는 서비스에 대해 이메일(
              <a
                href="mailto:your-email@example.com"
                className="text-blue-400 underline hover:text-blue-300"
              >
                your-email@example.com
              </a>
              )을 통해 하실 수 있으며, 서비스는 이에 대해 지체 없이 조치하겠습니다.
            </p>
            <p className="mt-2">
              이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한
              경우에는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나
              제공하지 않습니다.
            </p>
            <p className="mt-2">
              권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을
              통해서도 하실 수 있습니다. 이 경우 &quot;개인정보 처리 방법에 관한
              고시&quot; 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
            </p>
          </section>

          {/* 8. 개인정보의 파기 절차 및 방법 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              8. 개인정보의 파기 절차 및 방법
            </h2>
            <p className="mb-2">
              서비스는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가
              불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
            </p>
            <h3 className="mb-2 mt-3 font-medium text-gray-100">
              가. 파기 절차
            </h3>
            <p>
              이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의
              경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정 기간
              저장된 후 혹은 즉시 파기됩니다.
            </p>
            <h3 className="mb-2 mt-3 font-medium text-gray-100">
              나. 파기 방법
            </h3>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong className="text-gray-100">전자적 파일:</strong>{" "}
                기록을 재생할 수 없는 기술적 방법을 사용하여 삭제
              </li>
              <li>
                <strong className="text-gray-100">종이 문서:</strong>{" "}
                분쇄기로 분쇄하거나 소각
              </li>
            </ul>
          </section>

          {/* 9. 개인정보의 안전성 확보 조치 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              9. 개인정보의 안전성 확보 조치
            </h2>
            <p className="mb-2">
              서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고
              있습니다.
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong className="text-gray-100">
                  개인정보 취급 직원의 최소화:
                </strong>{" "}
                개인정보를 취급하는 직원을 최소화하여 관리합니다.
              </li>
              <li>
                <strong className="text-gray-100">
                  개인정보의 암호화:
                </strong>{" "}
                이용자의 비밀번호는 암호화되어 저장 및 관리되며, 중요한
                데이터는 파일 및 전송 데이터를 암호화하여 보호합니다.
              </li>
              <li>
                <strong className="text-gray-100">
                  접속 기록의 보관 및 위변조 방지:
                </strong>{" "}
                개인정보 처리 시스템에 접속한 기록을 최소 1년 이상 보관,
                관리합니다.
              </li>
              <li>
                <strong className="text-gray-100">보안 프로그램 설치:</strong>{" "}
                해킹 등에 의한 개인정보 유출을 방지하기 위해 HTTPS(SSL/TLS)를
                적용하고 있습니다.
              </li>
              <li>
                <strong className="text-gray-100">접근 통제:</strong>{" "}
                개인정보에 대한 접근 권한을 제한하고, 외부로부터의 무단 접근을
                통제합니다.
              </li>
            </ul>
          </section>

          {/* 10. 쿠키 등 자동 수집 장치에 관한 사항 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              10. 쿠키 등 자동 수집 장치에 관한 사항
            </h2>
            <p className="mb-2">
              서비스는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용
              정보를 저장하고 수시로 불러오는 &apos;쿠키(cookie)&apos;를 사용합니다.
            </p>
            <h3 className="mb-2 mt-3 font-medium text-gray-100">
              가. 쿠키의 사용 목적
            </h3>
            <ul className="ml-5 list-disc space-y-1">
              <li>로그인 상태 유지 및 사용자 인증</li>
              <li>서비스 이용 환경 설정 유지</li>
              <li>서비스 이용 통계 분석</li>
            </ul>
            <h3 className="mb-2 mt-3 font-medium text-gray-100">
              나. 쿠키의 설치, 운영 및 거부
            </h3>
            <p>
              이용자는 웹 브라우저의 설정을 통해 쿠키 저장을 거부할 수
              있습니다. 다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부
              서비스 이용에 어려움이 있을 수 있습니다.
            </p>
            <ul className="ml-5 mt-2 list-disc space-y-1 text-sm text-gray-400">
              <li>
                Chrome: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트
                데이터
              </li>
              <li>Safari: 환경설정 &gt; 개인 정보 보호</li>
              <li>
                Firefox: 설정 &gt; 개인 정보 및 보안 &gt; 쿠키 및 사이트
                데이터
              </li>
            </ul>
          </section>

          {/* 11. 개인정보 보호책임자 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              11. 개인정보 보호책임자
            </h2>
            <p className="mb-3">
              서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
              처리와 관련한 정보주체의 불만 처리 및 피해 구제 등을 위하여
              아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <p className="mb-1">
                <strong className="text-gray-100">개인정보 보호책임자</strong>
              </p>
              <ul className="space-y-1 text-sm">
                <li>성명: Your Name</li>
                <li>직위: 대표</li>
                <li>
                  이메일:{" "}
                  <a
                    href="mailto:your-email@example.com"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    your-email@example.com
                  </a>
                </li>
              </ul>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              서비스 이용 중 발생한 모든 개인정보 보호 관련 문의, 불만 처리,
              피해 구제 등에 관한 사항은 위 개인정보 보호책임자에게 문의하실 수
              있습니다.
            </p>
          </section>

          {/* 12. 권익침해 구제방법 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              12. 권익침해 구제방법
            </h2>
            <p className="mb-3">
              이용자는 개인정보 침해로 인한 구제를 받기 위하여 아래의 기관에
              분쟁 해결이나 상담 등을 신청할 수 있습니다.
            </p>
            <div className="space-y-3 rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-sm">
              <div>
                <p className="font-medium text-gray-100">
                  개인정보침해 신고센터 (한국인터넷진흥원 운영)
                </p>
                <p>전화: (국번없이) 118</p>
                <p>
                  홈페이지:{" "}
                  <a
                    href="https://privacy.kisa.or.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    privacy.kisa.or.kr
                  </a>
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-100">
                  개인정보 분쟁조정위원회
                </p>
                <p>전화: (국번없이) 1833-6972</p>
                <p>
                  홈페이지:{" "}
                  <a
                    href="https://www.kopico.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    www.kopico.go.kr
                  </a>
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-100">
                  대검찰청 사이버수사과
                </p>
                <p>전화: (국번없이) 1301</p>
                <p>
                  홈페이지:{" "}
                  <a
                    href="https://www.spo.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    www.spo.go.kr
                  </a>
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-100">
                  경찰청 사이버수사국
                </p>
                <p>전화: (국번없이) 182</p>
                <p>
                  홈페이지:{" "}
                  <a
                    href="https://ecrm.cyber.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    ecrm.cyber.go.kr
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* 13. 개인정보처리방침 변경에 관한 사항 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              13. 개인정보처리방침 변경에 관한 사항
            </h2>
            <p>
              이 개인정보처리방침은 2026년 3월 10일부터 적용됩니다. 법령, 정책
              또는 보안 기술의 변경에 따라 내용의 추가, 삭제 및 수정이 있을
              경우에는 변경사항의 시행 7일 전부터 서비스 공지사항 또는
              웹사이트를 통해 고지할 것입니다.
            </p>
          </section>

          {/* 사업자 정보 */}
          <section className="mt-12 border-t border-gray-800 pt-8 text-sm text-gray-500">
            <p className="mb-1">상호명: Your Company Name</p>
            <p className="mb-1">대표자: Your Name</p>
            <p className="mb-1">사업자등록번호: 000-00-00000</p>
            <p className="mb-1">
              소재지: Your Address
            </p>
            <p>
              이메일:{" "}
              <a
                href="mailto:your-email@example.com"
                className="text-gray-400 underline hover:text-gray-300"
              >
                your-email@example.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
