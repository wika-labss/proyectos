import { ProgressData, RewardName } from '../../types';

/** inventory — almacenar regalos; solo visualización en UI */
export function createEmptyInventory(): RewardName[] {
  return [];
}

export function addGift(inventory: RewardName[], name: RewardName): RewardName[] {
  return [...inventory, name];
}

export function listGifts(inventory: RewardName[]): RewardName[] {
  return [...inventory];
}

export function countGifts(inventory: RewardName[]): number {
  return inventory.length;
}

export function countGiftsByName(
  inventory: RewardName[]
): Record<RewardName, number> {
  const counts = {
    'regalo 1': 0,
    'regalo 2': 0,
    'regalo 3': 0,
    'regalo 4': 0,
    'regalo 5': 0,
    'regalo 6': 0,
    'regalo 7': 0,
    'regalo 8': 0,
  } as Record<RewardName, number>;
  for (const gift of inventory) {
    counts[gift] += 1;
  }
  return counts;
}

export function getInventoryFromProgress(progress: ProgressData): RewardName[] {
  return progress.inventory ?? createEmptyInventory();
}
