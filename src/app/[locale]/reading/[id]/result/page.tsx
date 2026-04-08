import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import { getReading } from "@/services/saju/actions";
import SajuNavbar from "@/components/saju/landing/SajuNavbar";
import FiveElementChart from "@/components/saju/preview/FiveElementChart";
import FullAnalysis from "@/components/saju/result/FullAnalysis";
import PdfDownloadButton from "@/components/saju/result/PdfDownloadButton";
import CompatibilityUpsell from "@/components/saju/result/CompatibilityUpsell";
import ShareCard from "@/components/saju/result/ShareCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "분석 결과",
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const { data: reading, error } = await getReading(id);

  if (error || !reading) {
    notFound();
  }

  if (reading.status !== "completed" || !reading.full_analysis) {
    redirect({ href: `/reading/${id}`, locale });
    return null;
  }

  const elements = reading.five_elements;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <SajuNavbar />

      <main className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-6">
        {/* 사주 정보 요약 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-[#191F28]">
            {reading.name}님의 사주분석 결과
          </h1>
          <p className="mt-1 text-sm text-[#8B95A1]">
            {reading.birth_year}년 {reading.birth_month}월 {reading.birth_day}일
            {reading.birth_hour !== null ? ` ${reading.birth_hour}시` : ""}
            {reading.is_lunar ? " (음력)" : " (양력)"}
            {" / "}
            {reading.gender === "male" ? "남성" : "여성"}
          </p>

          {/* 오행 차트 */}
          {elements && (
            <div className="mt-5">
              <FiveElementChart elements={elements} />
            </div>
          )}
        </div>

        {/* 전체 분석 */}
        <FullAnalysis analysis={reading.full_analysis} reading={reading} />

        {/* PDF 다운로드 */}
        <PdfDownloadButton readingId={reading.id} name={reading.name} />

        {/* 궁합 분석 업셀 */}
        <CompatibilityUpsell readingId={reading.id} name={reading.name} />

        {/* 공유 카드 */}
        <ShareCard readingId={reading.id} name={reading.name} />
      </main>
    </div>
  );
}
