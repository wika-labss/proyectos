import { LevelConfig } from '../types';

export const TOTAL_LEVELS = 20;

export const LEVELS: LevelConfig[] = Array.from({ length: TOTAL_LEVELS }, (_, index) => {
  const id = index + 1;

  if (id <= 4) {
    return {
      id,
      name: `Nivel ${id}`,
      difficulty: 'easy',
      minClues: 42,
      maxClues: 46,
      maxHints: 3,
    };
  }

  if (id <= 8) {
    return {
      id,
      name: `Nivel ${id}`,
      difficulty: 'easy+',
      minClues: 38,
      maxClues: 41,
      maxHints: 3,
    };
  }

  if (id <= 12) {
    return {
      id,
      name: `Nivel ${id}`,
      difficulty: 'medium',
      minClues: 32,
      maxClues: 37,
      maxHints: 3,
    };
  }

  if (id <= 16) {
    return {
      id,
      name: `Nivel ${id}`,
      difficulty: 'hard',
      minClues: 26,
      maxClues: 31,
      maxHints: 2,
    };
  }

  return {
    id,
    name: `Nivel ${id}`,
    difficulty: 'expert',
    minClues: 20,
    maxClues: 25,
    maxHints: 1,
  };
});

export function getLevelConfig(levelId: number): LevelConfig {
  const level = LEVELS.find((item) => item.id === levelId);
  if (!level) {
    throw new Error(`Level ${levelId} not found`);
  }
  return level;
}

export const DIFFICULTY_LABELS: Record<LevelConfig['difficulty'], string> = {
  easy: 'Fácil',
  'easy+': 'Fácil+',
  medium: 'Medio',
  hard: 'Difícil',
  expert: 'Experto',
};
