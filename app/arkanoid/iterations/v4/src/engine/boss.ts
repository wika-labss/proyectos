import {
  BOSS_HEIGHT,
  BOSS_HITS_BASE,
  BOSS_HITS_PER_LEVEL,
  BOSS_SPEED_BASE,
  BOSS_SPEED_PER_LEVEL,
  BOSS_WIDTH,
  BRICK_GAP,
  BRICK_HEIGHT,
  BRICK_TOP,
} from '../constants/game';
import type { Boss } from './types';

export function isBossAlive(boss: Boss | null): boolean {
  return boss != null && boss.hitsLeft > 0;
}

export function bossHitsForLevel(levelIndex: number): number {
  return BOSS_HITS_BASE + Math.max(0, levelIndex) * BOSS_HITS_PER_LEVEL;
}

export function bossSpeedForLevel(levelIndex: number): number {
  return BOSS_SPEED_BASE + Math.max(0, levelIndex) * BOSS_SPEED_PER_LEVEL;
}

export function createBoss(worldW: number, levelIndex: number = 0): Boss {
  const hits = bossHitsForLevel(levelIndex);
  const rows = levelIndex === 0 ? 5 : 6;
  const y = BRICK_TOP + rows * (BRICK_HEIGHT + BRICK_GAP) + BRICK_GAP;
  return {
    id: 'boss',
    x: (worldW - BOSS_WIDTH) / 2,
    y,
    w: BOSS_WIDTH,
    h: BOSS_HEIGHT,
    vx: bossSpeedForLevel(levelIndex),
    hitsLeft: hits,
    hitsMax: hits,
  };
}

export function moveBoss(boss: Boss, dtSec: number, worldW: number): Boss {
  if (boss.hitsLeft <= 0) return boss;
  let x = boss.x + boss.vx * dtSec;
  let vx = boss.vx;
  if (x <= 0) {
    x = 0;
    vx = Math.abs(vx);
  } else if (x + boss.w >= worldW) {
    x = worldW - boss.w;
    vx = -Math.abs(vx);
  }
  return { ...boss, x, vx };
}

export function hitBoss(boss: Boss): { boss: Boss; defeated: boolean } {
  if (boss.hitsLeft <= 0) return { boss, defeated: false };
  const hitsLeft = boss.hitsLeft - 1;
  return {
    boss: { ...boss, hitsLeft },
    defeated: hitsLeft <= 0,
  };
}
