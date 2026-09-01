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
