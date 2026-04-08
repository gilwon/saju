import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/utils/supabase/server";
import { SajuPdf } from "@/lib/saju/pdf/saju-template";
import type { SajuReading } from "@/types/saju";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  // 현재 유저 확인
  const { data: { user } } = await supabase.auth.getUser();
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  // Fetch reading (어드민은 status 무관, 일반 유저는 completed만)
  let query = supabase
    .from("saju_readings")
    .select("*")
    .eq("id", id);

  if (!isAdmin) {
    query = query.eq("status", "completed");
  }

  const { data: reading, error } = await query.single();

  if (error || !reading) {
    return NextResponse.json(
      { error: "Reading not found or not completed" },
      { status: 404 }
    );
  }

  // AI 분석이 없으면 PDF 생성 불가
  if (!reading.full_analysis) {
    return NextResponse.json(
      { error: "Analysis not yet generated" },
      { status: 404 }
    );
  }

  const sajuReading = reading as SajuReading;

  try {
    const pdfBuffer = await renderToBuffer(
      SajuPdf({ reading: sajuReading })
    );

    const filename = `사주분석_${sajuReading.name}_${new Date().toISOString().slice(0, 10)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
