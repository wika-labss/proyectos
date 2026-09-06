import { LEVEL_COUNT } from '../constants/game';

export type LevelAdvance =
  | { kind: 'next'; nextIndex: number }
  | { kind: 'victory' };

export function onLevelCleared(levelIndex: number): LevelAdvance {
  const next = levelIndex + 1;
  if (next >= LEVEL_COUNT) return { kind: 'victory' };
  return { kind: 'next', nextIndex: next };
}

export function isLastLevel(levelIndex: number): boolean {
  return levelIndex >= LEVEL_COUNT - 1;
}
