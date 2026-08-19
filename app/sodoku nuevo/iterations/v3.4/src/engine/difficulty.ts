import { getLevelConfig } from '../constants/levels';

export function getTargetClues(levelId: number): number {
  const level = getLevelConfig(levelId);
  return level.minClues + Math.floor(Math.random() * (level.maxClues - level.minClues + 1));
}
