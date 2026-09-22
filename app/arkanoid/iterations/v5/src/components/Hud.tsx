import React from 'react';
import type { AvatarId } from '../constants/avatars';
import { DEFAULT_AVATAR } from '../constants/avatars';
import { HudChip } from '../modules/arkanoid-ui-kit';

type Props = {
  lives: number;
  score: number;
  level: number;
  statusLabel?: string;
  powerLabel?: string;
  avatarId?: AvatarId;
};

/** Legacy wrapper → HUD chip VE. */
export function Hud({ avatarId = DEFAULT_AVATAR, ...rest }: Props) {
  return <HudChip avatarId={avatarId} {...rest} />;
}
