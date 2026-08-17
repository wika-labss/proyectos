import { HARD_DROP_PTS, LINE_SCORES, SOFT_DROP_PTS } from '../constants/game';

export function onLinesCleared(n: number): number {
  if (n === 1 || n === 2 || n === 3 || n === 4) return LINE_SCORES[n];
  return 0;
}

export function onSoftDrop(cells: number): number {
  return Math.max(0, Math.floor(cells)) * SOFT_DROP_PTS;
}

export function onHardDrop(cells: number): number {
  return Math.max(0, Math.floor(cells)) * HARD_DROP_PTS;
}

export function considerHighScore(score: number, highScore: number): number {
  return Math.max(Math.max(0, Math.floor(score)), Math.max(0, Math.floor(highScore)));
}
