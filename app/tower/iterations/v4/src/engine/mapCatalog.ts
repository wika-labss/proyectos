import { MAX_PAD_PATH_DIST } from '../constants/game';
import { positionAt } from './pathSystem';
import { minTowerRange } from './towerTypes';
import type { MapDefinition, MapPad, Vec2 } from './types';

function map(
  levelIndex: number,
  id: string,
  name: string,
  motif: string,
  path: Vec2[],
  palette: MapDefinition['palette'],
  padCount = 8,
): MapDefinition {
  return {
    id,
    name,
    levelIndex,
    path,
    pads: padsNearPath(path, padCount, levelIndex),
    palette,
    motif,
  };
}

/** Pads a ambos lados del path, distancia fija segura (< MAX_PAD_PATH_DIST). */
export function padsNearPath(
  path: Vec2[],
  count: number,
  seed: number,
  offset = 14,
): MapPad[] {
  const pads: MapPad[] = [];
  const n = Math.max(4, count);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const pos = positionAt(path, t);
    // Approximate tangent via nearby samples
    const a = positionAt(path, Math.max(0, t - 0.02));
    const b = positionAt(path, Math.min(1, t + 0.02));
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    // Perpendicular
    const px = -dy;
    const py = dx;
    const side = (i + seed) % 2 === 0 ? 1 : -1;
    let x = pos.x + px * offset * side;
    let y = pos.y + py * offset * side;
    x = Math.max(8, Math.min(92, x));
    y = Math.max(8, Math.min(132, y));
    pads.push({ id: `p${i}`, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }
  return pads;
}

export function minDistToPath(pad: Vec2, path: Vec2[]): number {
  let min = Infinity;
  for (let i = 0; i <= 200; i++) {
    const p = positionAt(path, i / 200);
    const d = Math.hypot(pad.x - p.x, pad.y - p.y);
    if (d < min) min = d;
  }
  return min;
}

/** 25 mapas — path/paleta/motif únicos; pads auto cerca del path. */
export const MAPS: MapDefinition[] = [
  map(0, 'pradera', 'Pradera', 'pradera', [
    { x: 10, y: 10 }, { x: 50, y: 10 }, { x: 50, y: 70 }, { x: 90, y: 70 }, { x: 90, y: 130 },
  ], { bg: '#1A3A24', path: '#6B8F71', accent: '#A8D5A2', deco: '#2E5A3A' }),
  map(1, 'bosque', 'Bosque', 'bosque', [
    { x: 10, y: 20 }, { x: 30, y: 40 }, { x: 20, y: 70 }, { x: 45, y: 95 }, { x: 70, y: 70 }, { x: 85, y: 110 }, { x: 90, y: 130 },
  ], { bg: '#0F2A18', path: '#3D5C45', accent: '#7CB342', deco: '#1B4332' }, 7),
  map(2, 'puente', 'Puente', 'puente', [
    { x: 50, y: 8 }, { x: 50, y: 130 },
  ], { bg: '#1A2332', path: '#8B7355', accent: '#C4A574', deco: '#2C3E50' }, 8),
  map(3, 'canon', 'Cañón', 'canon', [
    { x: 10, y: 15 }, { x: 10, y: 70 }, { x: 90, y: 70 }, { x: 90, y: 130 },
  ], { bg: '#3A2A1A', path: '#A67C52', accent: '#E07A3D', deco: '#5C4033' }),
  map(4, 'aldea', 'Aldea', 'aldea', [
    { x: 10, y: 20 }, { x: 70, y: 20 }, { x: 70, y: 100 }, { x: 20, y: 100 }, { x: 20, y: 130 },
  ], { bg: '#2B2118', path: '#9C7A5A', accent: '#F0C27B', deco: '#4A3728' }),
  map(5, 'costa', 'Costa', 'costa', [
    { x: 15, y: 15 }, { x: 85, y: 25 }, { x: 75, y: 70 }, { x: 25, y: 90 }, { x: 40, y: 130 },
  ], { bg: '#0E2F3A', path: '#D4B896', accent: '#4ECDC4', deco: '#1A535C' }),
  map(6, 'desierto', 'Desierto', 'desierto', [
    { x: 10, y: 30 }, { x: 40, y: 20 }, { x: 70, y: 40 }, { x: 40, y: 70 }, { x: 80, y: 95 }, { x: 50, y: 130 },
  ], { bg: '#3D2C1E', path: '#C9A66B', accent: '#F4A261', deco: '#6B4423' }, 7),
  map(7, 'montana', 'Montaña', 'montana', [
    { x: 20, y: 10 }, { x: 80, y: 25 }, { x: 25, y: 45 }, { x: 85, y: 65 }, { x: 30, y: 90 }, { x: 75, y: 115 }, { x: 50, y: 135 },
  ], { bg: '#1E2430', path: '#7A8499', accent: '#A8B2C1', deco: '#3A4556' }, 9),
  map(8, 'pantano', 'Pantano', 'pantano', [
    { x: 15, y: 15 }, { x: 35, y: 45 }, { x: 15, y: 75 }, { x: 50, y: 95 }, { x: 85, y: 70 }, { x: 85, y: 130 },
  ], { bg: '#1A2E1A', path: '#4A6741', accent: '#8FBC8F', deco: '#2F4F2F' }, 7),
  map(9, 'volcan', 'Volcán', 'volcan', [
    { x: 50, y: 10 }, { x: 20, y: 40 }, { x: 80, y: 60 }, { x: 20, y: 90 }, { x: 80, y: 115 }, { x: 50, y: 135 },
  ], { bg: '#2A1010', path: '#8B3A2F', accent: '#FF6B35', deco: '#5C1A1A' }),
  map(10, 'ciudadela', 'Ciudadela', 'ciudadela', [
    { x: 10, y: 20 }, { x: 50, y: 20 }, { x: 50, y: 50 }, { x: 85, y: 50 }, { x: 85, y: 90 }, { x: 30, y: 90 }, { x: 30, y: 130 },
  ], { bg: '#1A1A2E', path: '#6C757D', accent: '#ADB5BD', deco: '#343A40' }, 9),
  map(11, 'puerto', 'Puerto', 'puerto', [
    { x: 10, y: 40 }, { x: 40, y: 20 }, { x: 70, y: 40 }, { x: 70, y: 90 }, { x: 35, y: 110 }, { x: 90, y: 130 },
  ], { bg: '#0D2137', path: '#5C4033', accent: '#48CAE4', deco: '#023E8A' }),
  map(12, 'ruinas', 'Ruinas', 'ruinas', [
    { x: 20, y: 15 }, { x: 20, y: 50 }, { x: 60, y: 50 }, { x: 60, y: 25 }, { x: 90, y: 25 }, { x: 90, y: 80 }, { x: 40, y: 80 }, { x: 40, y: 130 },
  ], { bg: '#2C241B', path: '#8D6E63', accent: '#D7CCC8', deco: '#5D4037' }),
  map(13, 'isla', 'Isla', 'isla', [
    { x: 50, y: 10 }, { x: 80, y: 35 }, { x: 65, y: 65 }, { x: 35, y: 65 }, { x: 20, y: 95 }, { x: 50, y: 115 }, { x: 80, y: 135 },
  ], { bg: '#0A3D3A', path: '#E9C46A', accent: '#2A9D8F', deco: '#264653' }, 9),
  map(14, 'fortaleza', 'Fortaleza', 'fortaleza', [
    { x: 10, y: 15 }, { x: 40, y: 15 }, { x: 40, y: 45 }, { x: 15, y: 45 }, { x: 15, y: 75 }, { x: 70, y: 75 }, { x: 70, y: 40 }, { x: 90, y: 40 }, { x: 90, y: 110 }, { x: 30, y: 110 }, { x: 30, y: 135 },
  ], { bg: '#0D0D12', path: '#4A4E69', accent: '#E85D04', deco: '#22223B' }, 10),
  // —— +10 mapas V2 ——
  map(15, 'glaciar', 'Glaciar', 'glaciar', [
    { x: 15, y: 10 }, { x: 85, y: 30 }, { x: 25, y: 55 }, { x: 80, y: 80 }, { x: 30, y: 110 }, { x: 70, y: 130 },
  ], { bg: '#0B1C28', path: '#A8D8EA', accent: '#E0F7FA', deco: '#1B3A4B' }, 8),
  map(16, 'mina', 'Mina', 'mina', [
    { x: 50, y: 8 }, { x: 20, y: 35 }, { x: 50, y: 55 }, { x: 80, y: 75 }, { x: 40, y: 100 }, { x: 60, y: 130 },
  ], { bg: '#1C1410', path: '#B08968', accent: '#F4D35E', deco: '#3D2914' }, 8),
  map(17, 'jardines', 'Jardines', 'jardines', [
    { x: 10, y: 25 }, { x: 40, y: 15 }, { x: 70, y: 35 }, { x: 50, y: 65 }, { x: 80, y: 90 }, { x: 40, y: 115 }, { x: 20, y: 135 },
  ], { bg: '#1E3A2F', path: '#95D5B2', accent: '#F8AD9D', deco: '#2D6A4F' }, 9),
  map(18, 'acueducto', 'Acueducto', 'acueducto', [
    { x: 10, y: 40 }, { x: 30, y: 20 }, { x: 50, y: 40 }, { x: 70, y: 20 }, { x: 90, y: 40 }, { x: 90, y: 100 }, { x: 50, y: 120 }, { x: 20, y: 135 },
  ], { bg: '#2A2118', path: '#C9B89A', accent: '#E9C46A', deco: '#5C4A32' }, 9),
  map(19, 'necro', 'Necrópolis', 'necro', [
    { x: 20, y: 15 }, { x: 50, y: 35 }, { x: 20, y: 60 }, { x: 60, y: 80 }, { x: 30, y: 105 }, { x: 75, y: 120 }, { x: 50, y: 135 },
  ], { bg: '#140F1A', path: '#6C5B7B', accent: '#C06C84', deco: '#355C7D' }, 8),
  map(20, 'orbital', 'Orbital', 'orbital', [
    { x: 50, y: 12 }, { x: 85, y: 40 }, { x: 65, y: 70 }, { x: 35, y: 70 }, { x: 15, y: 100 }, { x: 50, y: 120 }, { x: 85, y: 135 },
  ], { bg: '#050816', path: '#5E60CE', accent: '#4CC9F0', deco: '#240046' }, 9),
  map(21, 'arrecife', 'Arrecife', 'arrecife', [
    { x: 10, y: 60 }, { x: 30, y: 20 }, { x: 55, y: 50 }, { x: 80, y: 25 }, { x: 90, y: 70 }, { x: 60, y: 100 }, { x: 30, y: 130 },
  ], { bg: '#023047', path: '#8ECAE6', accent: '#FB8500', deco: '#219EBC' }, 8),
  map(22, 'tormenta', 'Tormenta', 'tormenta', [
    { x: 15, y: 15 }, { x: 40, y: 40 }, { x: 15, y: 70 }, { x: 55, y: 85 }, { x: 85, y: 55 }, { x: 85, y: 110 }, { x: 45, y: 135 },
  ], { bg: '#111827', path: '#9CA3AF', accent: '#FBBF24', deco: '#374151' }, 8),
  map(23, 'cristal', 'Cristal', 'cristal', [
    { x: 50, y: 10 }, { x: 25, y: 40 }, { x: 75, y: 55 }, { x: 30, y: 85 }, { x: 70, y: 105 }, { x: 40, y: 130 },
  ], { bg: '#1A0A2E', path: '#C77DFF', accent: '#E0AAFF', deco: '#5A189A' }, 8),
  map(24, 'ultima', 'Última Muralla', 'ultima', [
    { x: 10, y: 20 }, { x: 50, y: 10 }, { x: 90, y: 25 }, { x: 70, y: 55 }, { x: 30, y: 55 }, { x: 20, y: 90 }, { x: 80, y: 95 }, { x: 50, y: 120 }, { x: 50, y: 135 },
  ], { bg: '#0A0A0A', path: '#EF233C', accent: '#FFD60A', deco: '#2B2D42' }, 12),
];

export function getMap(levelIndex: number): MapDefinition {
  const m = MAPS[levelIndex];
  if (!m) throw new Error(`Map not found for levelIndex ${levelIndex}`);
  return m;
}

export function listMaps(): MapDefinition[] {
  return MAPS;
}

export function assertDistinctMaps(): {
  count: number;
  uniqueIds: number;
  uniqueMotifs: number;
  uniquePalettes: number;
  uniquePathSignatures: number;
} {
  const ids = new Set(MAPS.map((m) => m.id));
  const motifs = new Set(MAPS.map((m) => m.motif));
  const palettes = new Set(MAPS.map((m) => m.palette.bg + m.palette.accent));
  const paths = new Set(
    MAPS.map((m) => m.path.map((p) => `${p.x},${p.y}`).join('|')),
  );
  return {
    count: MAPS.length,
    uniqueIds: ids.size,
    uniqueMotifs: motifs.size,
    uniquePalettes: palettes.size,
    uniquePathSignatures: paths.size,
  };
}

/** Todos los pads alcanzables por la torre de menor rango. */
export function assertAllPadsInRange(): {
  ok: boolean;
  maxDist: number;
  minRange: number;
  offenders: { level: number; pad: string; dist: number }[];
} {
  const minRange = minTowerRange();
  const offenders: { level: number; pad: string; dist: number }[] = [];
  let maxDist = 0;
  for (const m of MAPS) {
    for (const pad of m.pads) {
      const d = minDistToPath(pad, m.path);
      if (d > maxDist) maxDist = d;
      if (d > MAX_PAD_PATH_DIST || d > minRange) {
        offenders.push({ level: m.levelIndex + 1, pad: pad.id, dist: d });
      }
    }
  }
  return { ok: offenders.length === 0, maxDist, minRange, offenders };
}
