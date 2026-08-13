import { LevelConfig } from '../types';

export const TOTAL_LEVELS = 20;

export const LEVELS: LevelConfig[] = Array.from({ length: TOTAL_LEVELS }, (_, index) => {
  const id = index + 1;
  if (id <= 4) return { id, name: `Nivel ${id}`, minClues: 42, maxClues: 46 };
  if (id <= 8) return { id, name: `Nivel ${id}`, minClues: 38, maxClues: 41 };
  if (id <= 12) return { id, name: `Nivel ${id}`, minClues: 32, maxClues: 37 };
  if (id <= 16) return { id, name: `Nivel ${id}`, minClues: 26, maxClues: 31 };
  return { id, name: `Nivel ${id}`, minClues: 20, maxClues: 25 };
});

export function getLevelConfig(levelId: number): LevelConfig {
  const level = LEVELS.find((item) => item.id === levelId);
  if (!level) throw new Error(`Level ${levelId} not found`);
  return level;
}
