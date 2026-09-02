import { giftNumberFromRewardId } from '../engine/affinity';

/** Orden = gifts.png 2×4 (manifest DS). */
export const GIFT_TITLES = [
  'Rosa',
  'Chocolate',
  'Guitarra',
  'Café',
  'Libro',
  'Collar',
  'Balón',
  'Ticket',
] as const;

export function giftTitle(rewardId: string): string {
  const n = giftNumberFromRewardId(rewardId);
  return GIFT_TITLES[n - 1] ?? rewardId;
}

export function rewardIdFromGiftN(n: number): string {
  return `recompensa ${n}`;
}

export function giftIndex(n: number): number {
  return Math.max(0, Math.min(7, n - 1));
}
