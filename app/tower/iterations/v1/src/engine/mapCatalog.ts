import type { MapDefinition, Vec2 } from './types';

function pad(id: string, x: number, y: number) {
  return { id, x, y };
}

function map(
  levelIndex: number,
  id: string,
  name: string,
  motif: string,
  path: Vec2[],
  pads: MapDefinition['pads'],
  palette: MapDefinition['palette'],
): MapDefinition {
  return { id, name, levelIndex, path, pads, palette, motif };
}

/** 15 mapas — path + pads + paleta + motif únicos */
export const MAPS: MapDefinition[] = [
  map(
    0,
    'pradera',
    'Pradera',
    'pradera',
    [
      { x: 10, y: 10 },
      { x: 50, y: 10 },
      { x: 50, y: 70 },
      { x: 90, y: 70 },
      { x: 90, y: 130 },
    ],
    [
      pad('p0', 30, 25),
      pad('p1', 70, 25),
      pad('p2', 30, 55),
      pad('p3', 70, 55),
      pad('p4', 30, 90),
      pad('p5', 70, 90),
      pad('p6', 50, 110),
      pad('p7', 20, 110),
    ],
    { bg: '#1A3A24', path: '#6B8F71', accent: '#A8D5A2', deco: '#2E5A3A' },
  ),
  map(
    1,
    'bosque',
    'Bosque',
    'bosque',
    [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 20, y: 70 },
      { x: 45, y: 95 },
      { x: 70, y: 70 },
      { x: 85, y: 110 },
      { x: 90, y: 130 },
    ],
    [
      pad('p0', 50, 25),
      pad('p1', 75, 40),
      pad('p2', 40, 55),
      pad('p3', 15, 95),
      pad('p4', 55, 80),
      pad('p5', 80, 90),
      pad('p6', 60, 120),
    ],
    { bg: '#0F2A18', path: '#3D5C45', accent: '#7CB342', deco: '#1B4332' },
  ),
  map(
    2,
    'puente',
    'Puente',
    'puente',
    [
      { x: 50, y: 8 },
      { x: 50, y: 130 },
    ],
    [
      pad('p0', 20, 25),
      pad('p1', 80, 25),
      pad('p2', 20, 55),
      pad('p3', 80, 55),
      pad('p4', 20, 85),
      pad('p5', 80, 85),
      pad('p6', 20, 115),
      pad('p7', 80, 115),
    ],
    { bg: '#1A2332', path: '#8B7355', accent: '#C4A574', deco: '#2C3E50' },
  ),
  map(
    3,
    'canon',
    'Cañón',
    'canon',
    [
      { x: 10, y: 15 },
      { x: 10, y: 70 },
      { x: 90, y: 70 },
      { x: 90, y: 130 },
    ],
    [
      pad('p0', 30, 30),
      pad('p1', 55, 30),
      pad('p2', 80, 30),
      pad('p3', 30, 50),
      pad('p4', 55, 90),
      pad('p5', 30, 110),
      pad('p6', 55, 110),
      pad('p7', 75, 110),
    ],
    { bg: '#3A2A1A', path: '#A67C52', accent: '#E07A3D', deco: '#5C4033' },
  ),
  map(
    4,
    'aldea',
    'Aldea',
    'aldea',
    [
      { x: 10, y: 20 },
      { x: 70, y: 20 },
      { x: 70, y: 100 },
      { x: 20, y: 100 },
      { x: 20, y: 130 },
    ],
    [
      pad('p0', 30, 40),
      pad('p1', 50, 40),
      pad('p2', 85, 40),
      pad('p3', 85, 70),
      pad('p4', 50, 70),
      pad('p5', 40, 115),
      pad('p6', 70, 115),
      pad('p7', 10, 70),
    ],
    { bg: '#2B2118', path: '#9C7A5A', accent: '#F0C27B', deco: '#4A3728' },
  ),
  map(
    5,
    'costa',
    'Costa',
    'costa',
    [
      { x: 15, y: 15 },
      { x: 85, y: 25 },
      { x: 75, y: 70 },
      { x: 25, y: 90 },
      { x: 40, y: 130 },
    ],
    [
      pad('p0', 40, 35),
      pad('p1', 60, 45),
      pad('p2', 50, 65),
      pad('p3', 90, 50),
      pad('p4', 15, 70),
      pad('p5', 55, 100),
      pad('p6', 75, 115),
      pad('p7', 20, 115),
    ],
    { bg: '#0E2F3A', path: '#D4B896', accent: '#4ECDC4', deco: '#1A535C' },
  ),
  map(
    6,
    'desierto',
    'Desierto',
    'desierto',
    [
      { x: 10, y: 30 },
      { x: 40, y: 20 },
      { x: 70, y: 40 },
      { x: 40, y: 70 },
      { x: 80, y: 95 },
      { x: 50, y: 130 },
    ],
    [
      pad('p0', 25, 50),
      pad('p1', 55, 35),
      pad('p2', 85, 55),
      pad('p3', 25, 85),
      pad('p4', 60, 85),
      pad('p5', 85, 115),
      pad('p6', 30, 120),
    ],
    { bg: '#3D2C1E', path: '#C9A66B', accent: '#F4A261', deco: '#6B4423' },
  ),
  map(
    7,
    'montana',
    'Montaña',
    'montana',
    [
      { x: 20, y: 10 },
      { x: 80, y: 25 },
      { x: 25, y: 45 },
      { x: 85, y: 65 },
      { x: 30, y: 90 },
      { x: 75, y: 115 },
      { x: 50, y: 135 },
    ],
    [
      pad('p0', 40, 20),
      pad('p1', 60, 40),
      pad('p2', 40, 60),
      pad('p3', 65, 80),
      pad('p4', 45, 105),
      pad('p5', 20, 70),
      pad('p6', 90, 95),
      pad('p7', 25, 125),
      pad('p8', 80, 130),
    ],
    { bg: '#1E2430', path: '#7A8499', accent: '#A8B2C1', deco: '#3A4556' },
  ),
  map(
    8,
    'pantano',
    'Pantano',
    'pantano',
    [
      { x: 15, y: 15 },
      { x: 35, y: 45 },
      { x: 15, y: 75 },
      { x: 50, y: 95 },
      { x: 85, y: 70 },
      { x: 85, y: 130 },
    ],
    [
      pad('p0', 55, 20),
      pad('p1', 70, 40),
      pad('p2', 40, 65),
      pad('p3', 25, 100),
      pad('p4', 65, 105),
      pad('p5', 50, 125),
      pad('p6', 20, 40),
    ],
    { bg: '#1A2E1A', path: '#4A6741', accent: '#8FBC8F', deco: '#2F4F2F' },
  ),
  map(
    9,
    'volcan',
    'Volcán',
    'volcan',
    [
      { x: 50, y: 10 },
      { x: 20, y: 40 },
      { x: 80, y: 60 },
      { x: 20, y: 90 },
      { x: 80, y: 115 },
      { x: 50, y: 135 },
    ],
    [
      pad('p0', 70, 25),
      pad('p1', 40, 35),
      pad('p2', 50, 55),
      pad('p3', 40, 75),
      pad('p4', 55, 95),
      pad('p5', 30, 115),
      pad('p6', 70, 100),
      pad('p7', 25, 60),
    ],
    { bg: '#2A1010', path: '#8B3A2F', accent: '#FF6B35', deco: '#5C1A1A' },
  ),
  map(
    10,
    'ciudadela',
    'Ciudadela',
    'ciudadela',
    [
      { x: 10, y: 20 },
      { x: 50, y: 20 },
      { x: 50, y: 50 },
      { x: 85, y: 50 },
      { x: 85, y: 90 },
      { x: 30, y: 90 },
      { x: 30, y: 130 },
    ],
    [
      pad('p0', 25, 35),
      pad('p1', 70, 35),
      pad('p2', 30, 65),
      pad('p3', 65, 70),
      pad('p4', 50, 105),
      pad('p5', 70, 115),
      pad('p6', 15, 105),
      pad('p7', 85, 70),
      pad('p8', 50, 75),
    ],
    { bg: '#1A1A2E', path: '#6C757D', accent: '#ADB5BD', deco: '#343A40' },
  ),
  map(
    11,
    'puerto',
    'Puerto',
    'puerto',
    [
      { x: 10, y: 40 },
      { x: 40, y: 20 },
      { x: 70, y: 40 },
      { x: 70, y: 90 },
      { x: 35, y: 110 },
      { x: 90, y: 130 },
    ],
    [
      pad('p0', 25, 20),
      pad('p1', 55, 35),
      pad('p2', 85, 30),
      pad('p3', 45, 60),
      pad('p4', 85, 70),
      pad('p5', 50, 95),
      pad('p6', 20, 95),
      pad('p7', 55, 125),
    ],
    { bg: '#0D2137', path: '#5C4033', accent: '#48CAE4', deco: '#023E8A' },
  ),
  map(
    12,
    'ruinas',
    'Ruinas',
    'ruinas',
    [
      { x: 20, y: 15 },
      { x: 20, y: 50 },
      { x: 60, y: 50 },
      { x: 60, y: 25 },
      { x: 90, y: 25 },
      { x: 90, y: 80 },
      { x: 40, y: 80 },
      { x: 40, y: 130 },
    ],
    [
      pad('p0', 40, 30),
      pad('p1', 75, 40),
      pad('p2', 40, 65),
      pad('p3', 75, 65),
      pad('p4', 20, 95),
      pad('p5', 60, 100),
      pad('p6', 80, 115),
      pad('p7', 25, 120),
    ],
    { bg: '#2C241B', path: '#8D6E63', accent: '#D7CCC8', deco: '#5D4037' },
  ),
  map(
    13,
    'isla',
    'Isla',
    'isla',
    [
      { x: 50, y: 10 },
      { x: 80, y: 35 },
      { x: 65, y: 65 },
      { x: 35, y: 65 },
      { x: 20, y: 95 },
      { x: 50, y: 115 },
      { x: 80, y: 135 },
    ],
    [
      pad('p0', 30, 25),
      pad('p1', 65, 25),
      pad('p2', 85, 55),
      pad('p3', 50, 50),
      pad('p4', 15, 70),
      pad('p5', 45, 90),
      pad('p6', 70, 100),
      pad('p7', 30, 125),
      pad('p8', 60, 130),
    ],
    { bg: '#0A3D3A', path: '#E9C46A', accent: '#2A9D8F', deco: '#264653' },
  ),
  map(
    14,
    'fortaleza',
    'Fortaleza',
    'fortaleza',
    [
      { x: 10, y: 15 },
      { x: 40, y: 15 },
      { x: 40, y: 45 },
      { x: 15, y: 45 },
      { x: 15, y: 75 },
      { x: 70, y: 75 },
      { x: 70, y: 40 },
      { x: 90, y: 40 },
      { x: 90, y: 110 },
      { x: 30, y: 110 },
      { x: 30, y: 135 },
    ],
    [
      pad('p0', 55, 25),
      pad('p1', 25, 30),
      pad('p2', 55, 55),
      pad('p3', 35, 60),
      pad('p4', 50, 90),
      pad('p5', 80, 90),
      pad('p6', 80, 65),
      pad('p7', 15, 95),
      pad('p8', 55, 120),
      pad('p9', 75, 125),
      pad('p10', 10, 60),
      pad('p11', 90, 25),
    ],
    { bg: '#0D0D12', path: '#4A4E69', accent: '#E85D04', deco: '#22223B' },
  ),
];

export function getMap(levelIndex: number): MapDefinition {
  const m = MAPS[levelIndex];
  if (!m) {
    throw new Error(`Map not found for levelIndex ${levelIndex}`);
  }
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
