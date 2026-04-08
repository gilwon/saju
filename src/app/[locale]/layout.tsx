import { Toaster } from "@/components/ui/sonner";
import { Noto_Sans_KR } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import "../globals.css";

import { ClientWidgets } from "@/components/shared/ClientWidgets";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ThemeSync } from "@/components/shared/ThemeSync";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://drsaju.com";

  return {
    title: {
      template: "%s | 사주랩",
      default: "사주랩 - 데이터 기반 AI 사주",
    },
    description:
      "사주팔자 · 자미두수 · 서양점성술 데이터 기반 AI 사주 분석. 무료 3회 체험 후 별 충전으로 무제한 대화.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
    },
    authors: [{ name: "사주랩" }],
    creator: "사주랩",
    publisher: "사주랩",
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: "/favicon.ico",
    },
    manifest: "/site.webmanifest",
    keywords: [
      "사주분석",
      "AI 사주",
      "만세력",
      "사주팔자",
      "운세",
      "2026년 운세",
      "사주랩",
      "사주 상담",
      "자미두수",
      "서양점성술",
      "오행 분석",
      "데이터 기반 AI 사주",
      "AI 운세 분석",
    ],
    openGraph: {
      type: "website",
      siteName: "사주랩",
      title: "사주랩 - 데이터 기반 AI 사주",
      description:
        "사주팔자 · 자미두수 · 서양점성술 데이터 기반 AI 사주 분석. 무료 3회 체험 후 별 충전으로 무제한 대화.",
      url: baseUrl,
      locale: locale === 'en' ? 'en_US' : locale === 'ja' ? 'ja_JP' : locale === 'zh' ? 'zh_CN' : 'ko_KR',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "사주랩 - 데이터 기반 AI 사주",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "사주랩 - 데이터 기반 AI 사주",
      description:
        "사주팔자 · 자미두수 · 서양점성술 데이터 기반 AI 사주 분석. 무료 3회 체험 후 별 충전으로 무제한 대화.",
      images: [`${baseUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* JSON-LD: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "사주랩",
              url: "https://drsaju.com",
              description:
                "사주팔자 · 자미두수 · 서양점성술 데이터 기반 AI 사주 분석 서비스. 무료 3회 체험.",
              inLanguage: "ko",
            }),
          }}
        />
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "사주랩",
              url: "https://drsaju.com",
            }),
          }}
        />
        {/* JSON-LD: Product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: "사주랩 별 충전",
              description:
                "데이터 기반 AI 사주 분석 서비스. 사주팔자 · 자미두수 · 서양점성술 통합 분석. 무료 3회 체험 후 별 충전으로 무제한 대화.",
              offers: {
                "@type": "AggregateOffer",
                lowPrice: "9900",
                highPrice: "29900",
                priceCurrency: "KRW",
                offerCount: 3,
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
        {/* JSON-LD: FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "사주랩는 어떤 서비스인가요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "사주랩는 사주팔자 · 자미두수 · 서양점성술을 데이터 기반으로 통합 분석하는 AI 사주 서비스입니다. 생년월일시를 입력하면 AI가 성격, 연애, 재물, 직업, 건강 등을 실시간 채팅으로 분석해줍니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "무료로 이용할 수 있나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "네, 처음 가입하면 별 3개가 무료로 제공되어 3회 상담을 체험할 수 있습니다. 이후에는 별을 충전하여 계속 상담할 수 있습니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "별 충전 가격은 얼마인가요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "별 30개 9,900원, 별 70개 19,900원, 별 120개 29,900원 세 가지 패키지가 있습니다. 많이 충전할수록 개당 가격이 저렴합니다.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${notoSansKR.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeSync />
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster />
            <ClientWidgets />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
