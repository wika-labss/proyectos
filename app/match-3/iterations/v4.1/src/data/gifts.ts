import { giftNumberFromRewardId, preferredSlot } from '../engine/affinity';
import type { SuitorSlot } from './suitors';

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

export function preferredGiftTitles(slot: SuitorSlot): string[] {
  return GIFT_TITLES.filter((_, i) => preferredSlot(i + 1) === slot);
}
