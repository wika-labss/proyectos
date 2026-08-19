import { SCORE_BOSS, SCORE_HARD, SCORE_NORMAL } from '../constants/game';
import type { BrickType } from './types';

export function onBrickDestroyed(type: BrickType): number {
  return type === 'hard' ? SCORE_HARD : SCORE_NORMAL;
}

export function onBossDefeated(): number {
  return SCORE_BOSS;
}

export function considerHighScore(score: number, highScore: number): number {
  return Math.max(Math.max(0, Math.floor(score)), Math.max(0, Math.floor(highScore)));
}

export function resetRunScore(): number {
  return 0;
}
