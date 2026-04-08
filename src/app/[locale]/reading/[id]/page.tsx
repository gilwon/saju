import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { SajuReading } from "@/types/saju";
import SajuNavbar from "@/components/saju/landing/SajuNavbar";
import PaymentSuccess from "@/components/saju/payment/PaymentSuccess";
import ReadingPreview from "./ReadingPreview";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ReadingPage({ params }: PageProps) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const { data: reading, error } = await supabase
    .from("saju_readings")
    .select("*")
    .eq("id", id)
    .single<SajuReading>();

  if (error || !reading) {
    redirect(`/${locale}`);
  }

  switch (reading.status) {
    case "completed":
      redirect(`/${locale}/reading/${id}/result`);
      return null;
    case "pending":
      redirect(`/${locale}/reading`);
      return null;
    case "paid":
    case "generating":
      return (
        <main className="min-h-screen bg-[#F8F9FA]">
          <SajuNavbar />
          <PaymentSuccess readingId={reading.id} />
        </main>
      );
    case "failed":
      return (
        <main className="min-h-screen bg-[#F8F9FA]">
          <SajuNavbar />
          <div className="max-w-2xl mx-auto px-5 py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#FFF0F0] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#191F28] mb-2">
              분석 중 오류가 발생했습니다
            </h2>
            <p className="text-sm text-[#8B95A1] mb-6">
              일시적인 문제일 수 있습니다. 다시 시도해주세요.
            </p>
            <PaymentSuccess readingId={reading.id} />
          </div>
        </main>
      );
    case "preview":
    default:
      return (
        <main className="min-h-screen bg-[#F8F9FA]">
          <SajuNavbar />
          <div className="max-w-2xl mx-auto px-5 py-8 pb-40">
            <ReadingPreview reading={reading} locale={locale} />
          </div>
        </main>
      );
  }
}
