import type { EnemyKind, Wave, WaveSpawn } from './types';

/** HP / count multipliers by level band (Feature 04). */
export function levelMultipliers(levelIndex: number): {
  hp: number;
  count: number;
  waveCount: number;
  startingGold: number;
} {
  if (levelIndex <= 2) {
    return { hp: 1 + levelIndex * 0.1, count: 1, waveCount: 4 + levelIndex, startingGold: 180 - levelIndex * 10 };
  }
  if (levelIndex <= 6) {
    return {
      hp: 1.3 + (levelIndex - 3) * 0.1,
      count: 1.15,
      waveCount: 6 + Math.floor((levelIndex - 3) / 2),
      startingGold: 150 - (levelIndex - 3) * 5,
    };
  }
  if (levelIndex <= 10) {
    return {
      hp: 1.7 + (levelIndex - 7) * 0.1,
      count: 1.35,
      waveCount: 8 + Math.floor((levelIndex - 7) / 2),
      startingGold: 130 - (levelIndex - 7) * 5,
    };
  }
  if (levelIndex <= 13) {
    return {
      hp: 2.2 + (levelIndex - 11) * 0.2,
      count: 1.55,
      waveCount: 10 + (levelIndex - 11),
      startingGold: 110 - (levelIndex - 11) * 5,
    };
  }
  return { hp: 2.8, count: 1.8, waveCount: 12, startingGold: 95 };
}

function scaleCount(base: number, mult: number): number {
  return Math.max(1, Math.round(base * mult));
}

function buildWaveSpawns(
  levelIndex: number,
  waveIndex: number,
  waveCount: number,
  countMult: number,
): WaveSpawn[] {
  const progress = waveIndex / Math.max(1, waveCount - 1);
  const spawns: WaveSpawn[] = [];

  const gruntBase = 4 + Math.floor(levelIndex * 0.6) + Math.floor(progress * 3);
  spawns.push({
    kind: 'grunt',
    count: scaleCount(gruntBase, countMult),
    intervalMs: Math.max(280, 520 - levelIndex * 12 - waveIndex * 8),
  });

  if (levelIndex >= 1 || waveIndex >= 1) {
    spawns.push({
      kind: 'runner',
      count: scaleCount(2 + Math.floor(progress * 3) + Math.floor(levelIndex / 3), countMult),
      intervalMs: Math.max(220, 400 - levelIndex * 10),
    });
  }

  if (levelIndex >= 3 && waveIndex >= 1) {
    spawns.push({
      kind: 'tank',
      count: scaleCount(1 + Math.floor(progress * 2) + Math.floor(levelIndex / 5), countMult),
      intervalMs: 700,
    });
  }

  const isFinalWave = waveIndex === waveCount - 1;
  if (isFinalWave && levelIndex >= 4) {
    spawns.push({ kind: 'boss', count: 1, intervalMs: 1000 });
  }

  return spawns;
}

export function getWaves(levelIndex: number): Wave[] {
  const { waveCount, count } = levelMultipliers(levelIndex);
  const waves: Wave[] = [];
  for (let i = 0; i < waveCount; i++) {
    waves.push({
      index: i,
      spawns: buildWaveSpawns(levelIndex, i, waveCount, count),
    });
  }
  return waves;
}

export function totalEnemiesInWaves(waves: Wave[]): number {
  return waves.reduce(
    (sum, w) => sum + w.spawns.reduce((s, sp) => s + sp.count, 0),
    0,
  );
}

export function enemyKindsInLevel(levelIndex: number): EnemyKind[] {
  const kinds = new Set<EnemyKind>();
  for (const w of getWaves(levelIndex)) {
    for (const s of w.spawns) kinds.add(s.kind);
  }
  return [...kinds];
}
