import type { TowerKind, TowerTypeDef } from './types';

/**
 * Rangos V2 — Cañón es el mínimo.
 * Contrato: todo pad debe estar a ≤ MAX_PAD_PATH_DIST (16) del path,
 * por debajo de range(cannon)=26.
 */
export const TOWER_TYPES: TowerTypeDef[] = [
  {
    id: 'archer',
    name: 'Arquera',
    cost: 50,
    damage: 12,
    range: 32,
    fireCooldownMs: 650,
    color: '#4CAF50',
  },
  {
    id: 'cannon',
    name: 'Cañón',
    cost: 80,
    damage: 18,
    range: 26,
    fireCooldownMs: 1100,
    splashRadius: 12,
    color: '#FF7043',
  },
  {
    id: 'frost',
    name: 'Hielo',
    cost: 70,
    range: 30,
    damage: 6,
    fireCooldownMs: 800,
    slowFactor: 0.45,
    slowDurationMs: 1400,
    color: '#4FC3F7',
  },
  {
    id: 'sniper',
    name: 'Francotirador',
    cost: 100,
    damage: 40,
    range: 48,
    fireCooldownMs: 1600,
    color: '#AB47BC',
  },
];

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
