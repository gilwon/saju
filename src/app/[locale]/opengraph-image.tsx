import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "사주랩 — AI 사주 상담사와 대화하세요";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [fontBold, fontRegular, bgBuffer] = await Promise.all([
    readFile(join(process.cwd(), "public", "fonts", "NotoSansKR-Bold.woff")),
    readFile(join(process.cwd(), "public", "fonts", "NotoSansKR-Regular.woff")),
    readFile(join(process.cwd(), "rescource", "saju", "3명.jpg")),
  ]);

  const bgBase64 = `data:image/jpeg;base64,${bgBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Noto Sans KR",
          background: "#0a0a0f",
        }}
      >
        {/* 캐릭터 배경 이미지 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgBase64}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />

        {/* 하단 그라데이션 오버레이 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "340px",
            background:
              "linear-gradient(to top, #0a0a0f 0%, #0a0a0fdd 40%, #0a0a0f88 70%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* 상단 살짝 어둡게 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "120px",
            background: "linear-gradient(to bottom, #0a0a0f66 0%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* 콘텐츠 영역 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            padding: "0 60px 48px",
          }}
        >
          {/* 배지 */}
          <div style={{ display: "flex", marginBottom: "16px" }}>
            <div
              style={{
                background: "rgba(168,85,247,0.2)",
                border: "1px solid rgba(168,85,247,0.4)",
                borderRadius: "999px",
                padding: "6px 18px",
                fontSize: "15px",
                fontWeight: 700,
                color: "#c084fc",
                display: "flex",
              }}
            >
              AI 사주 상담
            </div>
          </div>

          {/* 타이틀 */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "56px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-1px",
                lineHeight: 1.2,
              }}
            >
              사주랩
            </span>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 400,
                color: "#a1a1aa",
                lineHeight: 1.5,
                marginTop: "8px",
              }}
            >
              AI 사주 상담사와 나의 운명을 알아보세요
            </span>
          </div>

          {/* 하단 바 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#a78bfa" }}>
              drsaju.com
            </span>
            <span style={{ fontSize: "15px", color: "#52525b" }}>
              사주명리 · 궁합 · 운세
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: fontBold, weight: 700 as const, style: "normal" as const },
        { name: "Noto Sans KR", data: fontRegular, weight: 400 as const, style: "normal" as const },
      ],
    }
  );
}
