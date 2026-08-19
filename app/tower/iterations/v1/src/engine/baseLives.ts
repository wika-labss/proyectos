import { INITIAL_BASE_LIVES } from '../constants/game';
import type { EnemyKind } from './types';
import { getEnemyType } from './enemyTypes';

export function createBaseLives(lives = INITIAL_BASE_LIVES): number {
  return lives;
}

export function onLeak(
  lives: number,
  kind: EnemyKind,
): { lives: number; defeated: boolean; damage: number } {
  const damage = getEnemyType(kind).baseDamage;
  const next = Math.max(0, lives - damage);
  return { lives: next, defeated: next <= 0, damage };
}
