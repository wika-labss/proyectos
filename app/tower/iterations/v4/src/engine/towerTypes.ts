import { TOWER_MAX_TIER } from '../constants/game';
import type { TowerKind, TowerTier, TowerTypeDef } from './types';

/** Escalado V3 por tier: más daño + ataque más rápido. */
const TIER_DAMAGE_MULT: Record<TowerTier, number> = {
  1: 1,
  2: 1.55,
  3: 2.25,
  4: 3.4,
};

const TIER_COOLDOWN_MULT: Record<TowerTier, number> = {
  1: 1,
  2: 0.85,
  3: 0.72,
  4: 0.58,
};

/** Stats L1 rebalanceados (más DPS que V2). */
export const TOWER_TYPES: TowerTypeDef[] = [
  {
    id: 'archer',
    name: 'Arquera',
    tierNames: ['Arquera', 'Arquera II', 'Arquera III', 'Ballesta Élite'],
    cost: 50,
    damage: 16,
    range: 32,
    fireCooldownMs: 600,
    color: '#4CAF50',
  },
  {
    id: 'cannon',
    name: 'Cañón',
    tierNames: ['Cañón', 'Cañón II', 'Cañón III', 'Mortero Infernal'],
    cost: 75,
    damage: 22,
    range: 26,
    fireCooldownMs: 1000,
    splashRadius: 12,
    color: '#FF7043',
  },
  {
    id: 'frost',
    name: 'Hielo',
    tierNames: ['Hielo', 'Hielo II', 'Hielo III', 'Ventisca Absolute'],
    cost: 65,
    range: 30,
    damage: 8,
    fireCooldownMs: 750,
    slowFactor: 0.45,
    slowDurationMs: 1400,
    color: '#4FC3F7',
  },
  {
    id: 'sniper',
    name: 'Francotirador',
    tierNames: [
      'Francotirador',
      'Franco II',
      'Franco III',
      'Águila de Ébano',
    ],
    cost: 95,
    damage: 48,
    range: 48,
    fireCooldownMs: 1500,
    color: '#AB47BC',
  },
];

export type TowerCombatStats = {
  kind: TowerKind;
  tier: TowerTier;
  displayName: string;
  damage: number;
  range: number;
  fireCooldownMs: number;
  splashRadius?: number;
  slowFactor?: number;
  slowDurationMs?: number;
  color: string;
};

export function getTowerType(id: TowerKind): TowerTypeDef {
  const t = TOWER_TYPES.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown tower ${id}`);
  return t;
}

export function listTowerTypes(): TowerTypeDef[] {
  return TOWER_TYPES;
}

export function minTowerRange(): number {
  return Math.min(...TOWER_TYPES.map((t) => t.range));
}

export function clampTier(n: number): TowerTier {
  const t = Math.max(1, Math.min(TOWER_MAX_TIER, Math.floor(n)));
  return t as TowerTier;
}

export function getTowerDisplayName(kind: TowerKind, tier: TowerTier): string {
  return getTowerType(kind).tierNames[tier - 1]!;
}

export function getTowerCombatStats(
  kind: TowerKind,
  tier: TowerTier,
): TowerCombatStats {
  const base = getTowerType(kind);
  const t = clampTier(tier);
  return {
    kind,
    tier: t,
    displayName: base.tierNames[t - 1]!,
    damage: Math.round(base.damage * TIER_DAMAGE_MULT[t]),
    range: base.range,
    fireCooldownMs: Math.max(
      180,
      Math.round(base.fireCooldownMs * TIER_COOLDOWN_MULT[t]),
    ),
    splashRadius: base.splashRadius,
    slowFactor: base.slowFactor,
    slowDurationMs: base.slowDurationMs,
    color: base.color,
  };
}

export function minTowerRangeValue(): number {
  return minTowerRange();
}
