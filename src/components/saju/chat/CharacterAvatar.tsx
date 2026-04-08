'use client';

import Image from 'next/image';
import { getCharacter, type CharacterType } from '@/lib/saju/characters';

const SIZE_MAP = {
  sm: 40,
  md: 48,
  lg: 72,
} as const;

interface CharacterAvatarProps {
  characterId: CharacterType;
  size?: 'sm' | 'md' | 'lg';
}

export default function CharacterAvatar({
  characterId,
  size = 'md',
}: CharacterAvatarProps) {
  const character = getCharacter(characterId);
  const px = SIZE_MAP[size];

  return (
    <div
      className="flex-shrink-0 rounded-full overflow-hidden ring-2 ring-[#2a2a3a]"
      style={{ width: px, height: px }}
    >
      <Image
        src={character.avatar}
        alt={character.name}
        width={px}
        height={px}
        className="object-cover w-full h-full"
      />
    </div>
  );
}
