import type { CountryId } from './countries';
import { COUNTRIES } from './countries';

export type Difficulty = 'easy' | 'medium';

export type LevelConfig = {
  countryId: CountryId;
  levelIndex: number; // 0..9
  levelNumber: number; // 1..10
  difficulty: Difficulty;
  moves: number;
  minScore: number;
  rewardOnClear: boolean;
};

/** Niveles 1-based impares = fácil; pares = media. */
export function buildLevel(
  countryId: CountryId,
  levelIndex: number,
): LevelConfig {
  const levelNumber = levelIndex + 1;
  const difficulty: Difficulty =
    levelNumber % 2 === 1 ? 'easy' : 'medium';
  const i = levelIndex;
  const moves = difficulty === 'easy' ? 25 : 20;
  const minScore =
    difficulty === 'easy' ? 800 + i * 50 : 1200 + i * 75;
  return {
    countryId,
    levelIndex,
    levelNumber,
    difficulty,
    moves,
    minScore,
    rewardOnClear: levelNumber % 2 === 0,
  };
}

export function getLevel(
  countryId: CountryId,
  levelIndex: number,
): LevelConfig {
  return buildLevel(countryId, levelIndex);
}

export function allLevels(): LevelConfig[] {
  const out: LevelConfig[] = [];
  for (const c of COUNTRIES) {
    for (let i = 0; i < 10; i++) out.push(buildLevel(c.id, i));
  }
  return out;
}
