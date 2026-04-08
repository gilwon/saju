/**
 * Paddle 결제 설정
 * 환경변수: NEXT_PUBLIC_PADDLE_ENVIRONMENT, NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
 *
 * 상품 ID 환경변수 설정 필요:
 * - NEXT_PUBLIC_PADDLE_PRODUCT_STAR_30, NEXT_PUBLIC_PADDLE_PRICE_STAR_30
 * - NEXT_PUBLIC_PADDLE_PRODUCT_STAR_70, NEXT_PUBLIC_PADDLE_PRICE_STAR_70
 * - NEXT_PUBLIC_PADDLE_PRODUCT_STAR_PREMIUM, NEXT_PUBLIC_PADDLE_PRICE_STAR_PREMIUM
 */
export const PADDLE_CONFIG = {
  environment:
    (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production') ||
    'sandbox',
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
  webhookSecret: process.env.PADDLE_WEBHOOK_SECRET || '',
  apiKey: process.env.PADDLE_API_KEY || '',
  products: {
    stars30: {
      productId: process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STAR_30 || '',
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STAR_30 || '',
      name: '별 30개',
      amount: 9900,
      currency: 'KRW',
      chatCredits: 30,
    },
    stars70: {
      productId: process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STAR_70 || '',
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STAR_70 || '',
      name: '별 70개',
      amount: 19900,
      currency: 'KRW',
      chatCredits: 70,
      badge: '인기',
    },
    starsPremium: {
      productId: process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STAR_PREMIUM || '',
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STAR_PREMIUM || '',
      name: '별 250개',
      amount: 39900,
      currency: 'KRW',
      chatCredits: 250,
      badge: '최고 가성비',
    },
  },
} as const;

/** 상품 타입 */
export type ProductType = keyof typeof PADDLE_CONFIG.products;

/** 상품 ID로 상품 타입 조회 */
export function getProductByPriceId(
  priceId: string,
): ProductType | null {
  for (const [key, product] of Object.entries(PADDLE_CONFIG.products)) {
    if (product.priceId === priceId) {
      return key as ProductType;
    }
  }
  return null;
}
