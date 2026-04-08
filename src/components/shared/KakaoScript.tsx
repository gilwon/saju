"use client";

import Script from "next/script";

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

export default function KakaoScript() {
  if (!KAKAO_JS_KEY) return null;

  return (
    <Script
      id="kakao-sdk"
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      integrity="sha384-DKYJZ8NLiK8MN4/C5P2ezmFnkrWAd2Wn7MiPFyFf+dSdPCOBmMv2VG8BQPS01YJ"
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_JS_KEY);
        }
      }}
    />
  );
}
