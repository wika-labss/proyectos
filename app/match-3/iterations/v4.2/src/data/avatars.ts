import type { ImageSourcePropType } from 'react-native';
import { AVATAR_IDS, type AvatarId } from './avatarIds';

export type { AvatarId } from './avatarIds';
export { AVATAR_IDS, isAvatarId } from './avatarIds';

export type AvatarGender = 'hombre' | 'mujer';

export type AvatarDef = {
  id: AvatarId;
  gender: AvatarGender;
  source: ImageSourcePropType;
};

const SOURCES: Record<AvatarId, ImageSourcePropType> = {
  'avatar-m1': require('../../assets/avatars/avatar-m1.png'),
  'avatar-m2': require('../../assets/avatars/avatar-m2.png'),
  'avatar-m3': require('../../assets/avatars/avatar-m3.png'),
  'avatar-w1': require('../../assets/avatars/avatar-w1.png'),
  'avatar-w2': require('../../assets/avatars/avatar-w2.png'),
  'avatar-w3': require('../../assets/avatars/avatar-w3.png'),
};

export const AVATARS: AvatarDef[] = AVATAR_IDS.map((id) => ({
  id,
  gender: id.startsWith('avatar-w') ? 'mujer' : 'hombre',
  source: SOURCES[id],
}));

export function getAvatar(id: AvatarId): AvatarDef {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0]!;
}
