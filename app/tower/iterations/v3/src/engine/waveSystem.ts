import type { EnemyKind, Wave, WaveSpawn } from './types';

/**
 * Multipliers V3 — más oro, HP/cantidad más suaves que V2
 * (V2 soft-lockeaba ~N10).
 */
export function levelMultipliers(levelIndex: number): {
  hp: number;
  count: number;
  waveCount: number;
  startingGold: number;
} {
  if (levelIndex <= 2) {
    return {
      hp: 1 + levelIndex * 0.06,
      count: 1,
      waveCount: 4 + Math.min(1, levelIndex),
      startingGold: 260 - levelIndex * 10,
    };
  }
  if (levelIndex <= 6) {
    return {
      hp: 1.15 + (levelIndex - 3) * 0.05,
      count: 1.05,
      waveCount: 5 + Math.floor((levelIndex - 3) / 2),
      startingGold: 230 - (levelIndex - 3) * 8,
    };
  }
  if (levelIndex <= 10) {
    // N8–N11 (idx 7–10): jugable; N10 ≈ idx 9
    return {
      hp: 1.3 + (levelIndex - 7) * 0.05,
      count: 1.08,
      waveCount: 6 + Math.floor((levelIndex - 7) / 2),
      startingGold: 200 - (levelIndex - 7) * 8,
    };
  }
  if (levelIndex <= 14) {
    return {
      hp: 1.5 + (levelIndex - 11) * 0.06,
      count: 1.12,
      waveCount: 7 + Math.floor((levelIndex - 11) / 2),
      startingGold: 175 - (levelIndex - 11) * 6,
    };
  }
  if (levelIndex <= 19) {
    return {
      hp: 1.75 + (levelIndex - 15) * 0.05,
      count: 1.18,
      waveCount: 8 + Math.floor((levelIndex - 15) / 2),
      startingGold: 155 - (levelIndex - 15) * 5,
    };
  }
  return {
    hp: 2.0 + (levelIndex - 20) * 0.08,
    count: 1.22,
    waveCount: 9 + Math.floor((levelIndex - 20) / 2),
    startingGold: 130 - (levelIndex - 20) * 4,
  };
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

  // Menos densidad que V2
  const gruntBase = 3 + Math.floor(levelIndex * 0.35) + Math.floor(progress * 2);
  spawns.push({
    kind: 'grunt',
    count: scaleCount(gruntBase, countMult),
    intervalMs: Math.max(280, 560 - levelIndex * 8 - waveIndex * 6),
  });

  if (levelIndex >= 1 || waveIndex >= 1) {
    spawns.push({
      kind: 'runner',
      count: scaleCount(
        1 + Math.floor(progress * 2) + Math.floor(levelIndex / 4),
        countMult,
      ),
      intervalMs: Math.max(240, 420 - levelIndex * 6),
    });
  }

  if (levelIndex >= 3 && waveIndex >= 1) {
    spawns.push({
      kind: 'tank',
      count: scaleCount(
        1 + Math.floor(progress * 1.5) + Math.floor(levelIndex / 6),
        countMult,
      ),
      intervalMs: 750,
    });
  }

  const isFinalWave = waveIndex === waveCount - 1;
  if (isFinalWave && levelIndex >= 4) {
    const bosses = levelIndex >= 22 ? 2 : 1;
    spawns.push({ kind: 'boss', count: bosses, intervalMs: 1400 });
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
