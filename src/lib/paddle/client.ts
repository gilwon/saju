'use client';

import { PADDLE_CONFIG, type ProductType } from './config';

/** Paddle.js 타입 (필요한 부분만) */
interface PaddleInstance {
  Environment: {
    set: (env: 'sandbox' | 'production') => void;
  };
  Initialize: (options: {
    token: string;
  }) => void;
  Checkout: {
    open: (options: PaddleCheckoutOptions) => void;
  };
}

interface PaddleCheckoutOptions {
  items: { priceId: string; quantity: number }[];
  customer?: { email?: string };
  customData?: Record<string, string>;
  settings?: {
    displayMode?: 'overlay' | 'inline';
    theme?: 'light' | 'dark';
    locale?: string;
    frameTarget?: string;
    frameInitialHeight?: number;
    frameStyle?: string;
    successUrl?: string;
  };
}

declare global {
  interface Window {
    Paddle?: PaddleInstance;
  }
}

let paddleInitialized = false;

/**
 * Paddle.js 스크립트를 로드하고 초기화합니다.
 * 이미 초기화되었으면 스킵합니다.
 */
export async function initializePaddle(): Promise<PaddleInstance | null> {
  if (typeof window === 'undefined') return null;

  if (!PADDLE_CONFIG.clientToken) {
    console.error('[Paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN이 설정되지 않았습니다.');
    return null;
  }

  // 이미 초기화 완료
  if (paddleInitialized && window.Paddle) {
    return window.Paddle;
  }

  // 스크립트 로드
  if (!document.querySelector('script[src*="paddle.js"]')) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        PADDLE_CONFIG.environment === 'sandbox'
          ? 'https://sandbox-cdn.paddle.com/paddle/v2/paddle.js'
          : 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Paddle.js 로드 실패'));
      document.head.appendChild(script);
    });
  }

  // 초기화 대기 (최대 10초)
  await new Promise<void>((resolve, reject) => {
    let elapsed = 0;
    const check = () => {
      if (window.Paddle) {
        resolve();
      } else if (elapsed >= 10000) {
        reject(new Error('Paddle.js 초기화 타임아웃'));
      } else {
        elapsed += 100;
        setTimeout(check, 100);
      }
    };
    check();
  });

  // sandbox 환경 설정 (Initialize 전에 호출해야 함)
  if (PADDLE_CONFIG.environment === 'sandbox') {
    window.Paddle!.Environment.set('sandbox');
  }

  // 초기화
  window.Paddle!.Initialize({
    token: PADDLE_CONFIG.clientToken,
  });

  paddleInitialized = true;
  return window.Paddle!;
}

/**
 * Paddle 체크아웃을 엽니다.
 */
export async function openCheckout(options: {
  productType: ProductType;
  userId: string;
  userEmail?: string;
  successUrl?: string;
}): Promise<void> {
  const paddle = await initializePaddle();
  if (!paddle) {
    throw new Error('Paddle 초기화 실패');
  }

  const product = PADDLE_CONFIG.products[options.productType];

  paddle.Checkout.open({
    items: [{ priceId: product.priceId, quantity: 1 }],
    customer: options.userEmail ? { email: options.userEmail } : undefined,
    customData: {
      userId: options.userId,
      productType: options.productType,
    },
    settings: {
      displayMode: 'overlay',
      theme: 'dark',
      locale: 'ko',
      successUrl: options.successUrl,
    },
  });
}
