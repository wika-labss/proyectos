import { getLevelConfig } from '../constants/levels';
import { LevelConfig } from '../types';

export function getLevelDifficulty(levelId: number): LevelConfig {
  return getLevelConfig(levelId);
}

export function getTargetClues(levelId: number): number {
  const level = getLevelConfig(levelId);
  return (
    level.minClues +
    Math.floor(Math.random() * (level.maxClues - level.minClues + 1))
  );
}

export function calculateStars(levelId: number, elapsedSeconds: number, hintsUsed: number): number {
  const level = getLevelConfig(levelId);
  const baseTime = (81 - level.minClues) * 12;

  if (hintsUsed === 0 && elapsedSeconds <= baseTime) {
    return 3;
  }

  if (hintsUsed <= 1 && elapsedSeconds <= baseTime * 1.5) {
    return 2;
  }

  return 1;
}
