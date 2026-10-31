import {
  BOSS_HEIGHT,
  BOSS_HITS,
  BOSS_SPEED,
  BOSS_WIDTH,
  BRICK_GAP,
  BRICK_HEIGHT,
  BRICK_TOP,
} from '../constants/game';
import type { Boss } from './types';

export function isBossAlive(boss: Boss | null): boolean {
  return boss != null && boss.hitsLeft > 0;
}

export function createBoss(worldW: number): Boss {
  return {
    id: 'boss',
    x: (worldW - BOSS_WIDTH) / 2,
    y: BRICK_TOP + 3 * (BRICK_HEIGHT + BRICK_GAP),
    w: BOSS_WIDTH,
    h: BOSS_HEIGHT,
    vx: BOSS_SPEED,
    hitsLeft: BOSS_HITS,
    hitsMax: BOSS_HITS,
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
