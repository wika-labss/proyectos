import { LEVEL_COUNT } from '../constants/game';

export type LevelAdvance = {
  levelIndex: number;
  victory: boolean;
};

/** After clearing a level: advance or declare victory. */
export function onLevelCleared(levelIndex: number): LevelAdvance {
  const next = levelIndex + 1;
  if (next >= LEVEL_COUNT) {
    return { levelIndex, victory: true };
  }
  return { levelIndex: next, victory: false };
}

export function isValidLevel(levelIndex: number): boolean {
  return levelIndex >= 0 && levelIndex < LEVEL_COUNT;
}
