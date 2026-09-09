export const CREATOR_CODES = {
  vissiuss: 'vissiuss',
  map: 'map',
} as const;

export type CreatorCodeId = keyof typeof CREATOR_CODES;

export function normalizeCode(raw: string): string {
  return raw.trim().toLowerCase();
}
