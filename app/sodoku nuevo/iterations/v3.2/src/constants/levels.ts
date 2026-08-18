import { InternalDifficulty, LevelConfig } from '../types';

export const TOTAL_LEVELS = 100;

/**
 * Dificultad interna (solo generación).
 * Impares = easy, pares = medium. Nunca exponer en UI.
 */
export function getInternalDifficulty(levelId: number): InternalDifficulty {
  return levelId % 2 === 1 ? 'easy' : 'medium';
}

function cluesForInternalDifficulty(difficulty: InternalDifficulty): {
  minClues: number;
  maxClues: number;
} {
  if (difficulty === 'easy') return { minClues: 40, maxClues: 46 };
  return { minClues: 30, maxClues: 36 };
}

export const LEVELS: LevelConfig[] = Array.from({ length: TOTAL_LEVELS }, (_, index) => {
  const id = index + 1;
  const { minClues, maxClues } = cluesForInternalDifficulty(getInternalDifficulty(id));
  return { id, name: `Nivel ${id}`, minClues, maxClues };
});

export function getLevelConfig(levelId: number): LevelConfig {
  const level = LEVELS.find((item) => item.id === levelId);
  if (!level) throw new Error(`Level ${levelId} not found`);
  return level;
}
