'use client';

import { motion } from 'framer-motion';
import { getCharacter, type CharacterType } from '@/lib/saju/characters';
import { Link } from '@/i18n/routing';
import CharacterAvatar from './CharacterAvatar';

interface ChatPaywallProps {
  characterId: CharacterType;
  readingId: string;
  onPaymentComplete?: () => void;
}

export default function ChatPaywall({
  characterId,
}: ChatPaywallProps) {
  const character = getCharacter(characterId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex gap-2 justify-start"
    >
      <div className="flex flex-col items-center gap-1 pt-1">
        <CharacterAvatar characterId={characterId} size="sm" />
      </div>

      <div className="max-w-[85%]">
        <p className="text-xs text-gray-500 mb-1 ml-1">{character.name}</p>
        <div className="rounded-2xl rounded-bl-md bg-[#13131a] border border-[#2a2a3a] p-5">
          <p className="text-sm text-gray-200 leading-relaxed mb-1">
            별이 모두 소진되었어요.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            코인샵에서 별을 충전하면 계속 대화할 수 있어요.
          </p>

          <Link
            href="/coin-shop"
            className="block w-full py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold text-center
              hover:bg-purple-500 transition-colors active:scale-[0.98]"
          >
            별 충전하러 가기
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
