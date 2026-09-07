import type { EnemyKind, Wave, WaveSpawn } from './types';

/**
 * Multipliers V4 — un poco más duros que V3, lejos del soft-lock V2.
 */
export function levelMultipliers(levelIndex: number): {
  hp: number;
  count: number;
  waveCount: number;
  startingGold: number;
} {
  if (levelIndex <= 2) {
    return {
      hp: 1.05 + levelIndex * 0.07,
      count: 1.02,
      waveCount: 4 + Math.min(1, levelIndex),
      startingGold: 240 - levelIndex * 10,
    };
  }
  if (levelIndex <= 6) {
    return {
      hp: 1.22 + (levelIndex - 3) * 0.06,
      count: 1.1,
      waveCount: 5 + Math.floor((levelIndex - 3) / 2),
      startingGold: 210 - (levelIndex - 3) * 8,
    };
  }
  if (levelIndex <= 10) {
    return {
      hp: 1.4 + (levelIndex - 7) * 0.06,
      count: 1.14,
      waveCount: 7 + Math.floor((levelIndex - 7) / 2),
      startingGold: 185 - (levelIndex - 7) * 7,
    };
  }
  if (levelIndex <= 14) {
    return {
      hp: 1.65 + (levelIndex - 11) * 0.07,
      count: 1.18,
      waveCount: 8 + Math.floor((levelIndex - 11) / 2),
      startingGold: 160 - (levelIndex - 11) * 5,
    };
  }
  if (levelIndex <= 19) {
    return {
      hp: 1.9 + (levelIndex - 15) * 0.06,
      count: 1.24,
      waveCount: 9 + Math.floor((levelIndex - 15) / 2),
      startingGold: 140 - (levelIndex - 15) * 4,
    };
  }
  return {
    hp: 2.2 + (levelIndex - 20) * 0.09,
    count: 1.3,
    waveCount: 10 + Math.floor((levelIndex - 20) / 2),
    startingGold: 120 - (levelIndex - 20) * 3,
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

  const gruntBase = 3 + Math.floor(levelIndex * 0.4) + Math.floor(progress * 2.5);
  spawns.push({
    kind: 'grunt',
    count: scaleCount(gruntBase, countMult),
    intervalMs: Math.max(260, 540 - levelIndex * 8 - waveIndex * 6),
  });

  if (levelIndex >= 1 || waveIndex >= 1) {
    spawns.push({
      kind: 'runner',
      count: scaleCount(
        2 + Math.floor(progress * 2) + Math.floor(levelIndex / 4),
        countMult,
      ),
      intervalMs: Math.max(220, 400 - levelIndex * 6),
    });
  }

  if (levelIndex >= 3 && waveIndex >= 1) {
    spawns.push({
      kind: 'tank',
      count: scaleCount(
        1 + Math.floor(progress * 1.8) + Math.floor(levelIndex / 6),
        countMult,
      ),
      intervalMs: 720,
    });
  }

  const isFinalWave = waveIndex === waveCount - 1;
  if (isFinalWave && levelIndex >= 4) {
    const bosses = levelIndex >= 22 ? 2 : 1;
    spawns.push({ kind: 'boss', count: bosses, intervalMs: 1300 });
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

/** Oleada endless: escala con waveIndex (0-based). */
export function buildInfiniteWave(waveIndex: number): Wave {
  const t = waveIndex;
  const hpBand = 1 + t * 0.07;
  const countMult = 1 + t * 0.04;
  const gruntBase = 4 + Math.floor(t * 0.6);
  const spawns: WaveSpawn[] = [
    {
      kind: 'grunt',
      count: scaleCount(gruntBase, countMult),
      intervalMs: Math.max(220, 500 - t * 4),
    },
    {
      kind: 'runner',
      count: scaleCount(2 + Math.floor(t / 3), countMult),
      intervalMs: Math.max(200, 380 - t * 3),
    },
  ];
  if (t >= 2) {
    spawns.push({
      kind: 'tank',
      count: scaleCount(1 + Math.floor(t / 4), countMult),
      intervalMs: 700,
    });
  }
  if (t >= 5 && (t + 1) % 5 === 0) {
    spawns.push({
      kind: 'boss',
      count: 1 + Math.floor(t / 20),
      intervalMs: 1200,
    });
  }
  // hpBand unused here — applied in engine via infiniteHpMult
  void hpBand;
  return { index: t, spawns };
}

export function infiniteHpMult(waveIndex: number): number {
  return 1 + waveIndex * 0.07;
}

export function infiniteStartingGold(): number {
  return 220;
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
