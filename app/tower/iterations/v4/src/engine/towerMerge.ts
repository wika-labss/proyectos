import { TOWER_MAX_TIER } from '../constants/game';
import type { PlacedTower, TowerTier } from './types';
import { clampTier } from './towerTypes';

export function canMergeTowers(
  a: PlacedTower,
  b: PlacedTower,
): { ok: true; nextTier: TowerTier } | { ok: false; reason: string } {
  if (a.id === b.id) {
    return { ok: false, reason: 'Misma torre' };
  }
  if (a.kind !== b.kind) {
    return { ok: false, reason: 'Clases distintas' };
  }
  if (a.tier !== b.tier) {
    return { ok: false, reason: 'Niveles distintos' };
  }
  if (a.tier >= TOWER_MAX_TIER) {
    return { ok: false, reason: 'Ya es nivel máximo' };
  }
  return { ok: true, nextTier: clampTier(a.tier + 1) };
}
