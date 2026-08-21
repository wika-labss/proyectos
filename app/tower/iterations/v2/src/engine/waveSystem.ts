import type { EnemyKind, Wave, WaveSpawn } from './types';

/** HP / count multipliers by level band — extendido a 25 niveles (0..24). */
export function levelMultipliers(levelIndex: number): {
  hp: number;
  count: number;
  waveCount: number;
  startingGold: number;
} {
  if (levelIndex <= 2) {
    return {
      hp: 1 + levelIndex * 0.1,
      count: 1,
      waveCount: 4 + levelIndex,
      startingGold: 200 - levelIndex * 10,
    };
  }
  if (levelIndex <= 6) {
    return {
      hp: 1.3 + (levelIndex - 3) * 0.1,
      count: 1.15,
      waveCount: 6 + Math.floor((levelIndex - 3) / 2),
      startingGold: 170 - (levelIndex - 3) * 5,
    };
  }
  if (levelIndex <= 10) {
    return {
      hp: 1.7 + (levelIndex - 7) * 0.1,
      count: 1.35,
      waveCount: 8 + Math.floor((levelIndex - 7) / 2),
      startingGold: 145 - (levelIndex - 7) * 5,
    };
  }
  if (levelIndex <= 14) {
    return {
      hp: 2.2 + (levelIndex - 11) * 0.15,
      count: 1.55,
      waveCount: 10 + (levelIndex - 11),
      startingGold: 120 - (levelIndex - 11) * 4,
    };
  }
  if (levelIndex <= 19) {
    return {
      hp: 2.7 + (levelIndex - 15) * 0.12,
      count: 1.7,
      waveCount: 12 + Math.floor((levelIndex - 15) / 2),
      startingGold: 105 - (levelIndex - 15) * 3,
    };
  }
  // 20–24 (niveles 21–25)
  return {
    hp: 3.3 + (levelIndex - 20) * 0.15,
    count: 1.9,
    waveCount: 14 + (levelIndex - 20),
    startingGold: 90 - (levelIndex - 20) * 2,
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

  const gruntBase = 4 + Math.floor(levelIndex * 0.55) + Math.floor(progress * 3);
  spawns.push({
    kind: 'grunt',
    count: scaleCount(gruntBase, countMult),
    intervalMs: Math.max(240, 520 - levelIndex * 10 - waveIndex * 8),
  });

  if (levelIndex >= 1 || waveIndex >= 1) {
    spawns.push({
      kind: 'runner',
      count: scaleCount(
        2 + Math.floor(progress * 3) + Math.floor(levelIndex / 3),
        countMult,
      ),
      intervalMs: Math.max(200, 400 - levelIndex * 8),
    });
  }

  if (levelIndex >= 3 && waveIndex >= 1) {
    spawns.push({
      kind: 'tank',
      count: scaleCount(
        1 + Math.floor(progress * 2) + Math.floor(levelIndex / 5),
        countMult,
      ),
      intervalMs: 700,
    });
  }

  const isFinalWave = waveIndex === waveCount - 1;
  if (isFinalWave && levelIndex >= 4) {
    const bosses = levelIndex >= 20 ? 2 : 1;
    spawns.push({ kind: 'boss', count: bosses, intervalMs: 1200 });
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
