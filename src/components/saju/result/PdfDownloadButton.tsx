"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PdfDownloadButtonProps {
  readingId: string;
  name: string;
}

export default function PdfDownloadButton({
  readingId,
  name,
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/saju/pdf/${readingId}`);
      if (!res.ok) throw new Error("PDF 생성에 실패했습니다.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `사주랩_${name}_분석리포트.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF 다운로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="w-full h-14 bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-2xl text-base font-semibold"
    >
      {loading ? "PDF 생성 중..." : "PDF 리포트 다운로드"}
    </Button>
  );
}
