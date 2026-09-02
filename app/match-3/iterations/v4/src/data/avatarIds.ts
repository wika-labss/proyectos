export type AvatarId =
  | 'avatar-m1'
  | 'avatar-m2'
  | 'avatar-m3'
  | 'avatar-w1'
  | 'avatar-w2'
  | 'avatar-w3';

export const AVATAR_IDS: AvatarId[] = [
  'avatar-m1',
  'avatar-m2',
  'avatar-m3',
  'avatar-w1',
  'avatar-w2',
  'avatar-w3',
];

export function isAvatarId(value: string): value is AvatarId {
  return (AVATAR_IDS as string[]).includes(value);
}
