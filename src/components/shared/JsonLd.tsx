import Script from "next/script";

interface JsonLdProps {
  type: "WebSite" | "Organization" | "SoftwareApplication" | "Article";
  data?: Record<string, unknown>;
}

// 기본 Organization 데이터
const defaultOrganization = {
  "@type": "Organization",
  name: "SajuLab",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://drsaju.com",
  logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://drsaju.com"}/logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    email: "your-email@example.com",
    contactType: "customer service",
  },
};

// 기본 WebSite 데이터
const defaultWebSite = {
  "@type": "WebSite",
  name: "SajuLab",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://drsaju.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://drsaju.com"}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// SaaS 애플리케이션 데이터
const defaultSoftwareApplication = {
  "@type": "SoftwareApplication",
  name: "SajuLab",
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
    description: "무료 3회 체험 가능",
  },
};

export function JsonLd({ type, data }: JsonLdProps) {
  let structuredData;

  switch (type) {
    case "Organization":
      structuredData = {
        "@context": "https://schema.org",
        ...defaultOrganization,
        ...data,
      };
      break;
    case "WebSite":
      structuredData = {
        "@context": "https://schema.org",
        ...defaultWebSite,
        ...data,
      };
      break;
    case "SoftwareApplication":
      structuredData = {
        "@context": "https://schema.org",
        ...defaultSoftwareApplication,
        ...data,
      };
      break;
    case "Article":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        ...data,
      };
      break;
    default:
      structuredData = { "@context": "https://schema.org", ...data };
  }

  return (
    <Script
      id={`json-ld-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      strategy="afterInteractive"
    />
  );
}

// 블로그 포스트용 Article JSON-LD
export function ArticleJsonLd({
  title,
  description,
  publishedTime,
  modifiedTime,
  author,
  image,
  url,
}: {
  title: string;
  description: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  image?: string;
  url: string;
}) {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: defaultOrganization,
    image: image || `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <Script
      id="json-ld-article"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
      strategy="afterInteractive"
    />
  );
}
