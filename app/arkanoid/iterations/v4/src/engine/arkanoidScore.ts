import { SCORE_BOSS_BASE, SCORE_BOSS_PER_LEVEL, SCORE_HARD, SCORE_NORMAL } from '../constants/game';
import type { BrickType } from './types';

export function onBrickDestroyed(type: BrickType): number {
  return type === 'hard' ? SCORE_HARD : SCORE_NORMAL;
}

export function onBossDefeated(levelIndex: number = 0): number {
  return SCORE_BOSS_BASE + Math.max(0, levelIndex) * SCORE_BOSS_PER_LEVEL;
}

export function considerHighScore(score: number, highScore: number): number {
  return Math.max(Math.max(0, Math.floor(score)), Math.max(0, Math.floor(highScore)));
}

export function resetRunScore(): number {
  return 0;
}
