import { GRAVITY_MS, MAX_LEVEL, SCORE_PER_LEVEL } from '../constants/game';

export function levelFromScore(score: number): number {
  const s = Math.max(0, Math.floor(score));
  return Math.min(MAX_LEVEL, 1 + Math.floor(s / SCORE_PER_LEVEL));
}

export function gravityMs(level: number): number {
  const idx = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level))) - 1;
  return GRAVITY_MS[idx]!;
}

export function softDropMs(level: number): number {
  return Math.min(gravityMs(level), 50);
}
