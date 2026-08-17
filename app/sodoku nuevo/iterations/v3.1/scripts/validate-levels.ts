/**
 * Gate WIKA V3 — valida que los 100 niveles generen puzzles con solución única.
 * Dificultad interna easy/medium alternada (oculta al jugador).
 * npm run validate:levels
 */
import { getInternalDifficulty } from '../src/constants/levels';
import { assertLevelPuzzle } from '../src/engine/generator';

const LEVELS = 100;
let failed = 0;

console.log('=== Sodoku nuevo V3 — validate:levels ===');

for (let levelId = 1; levelId <= LEVELS; levelId += 1) {
  try {
    const result = assertLevelPuzzle(levelId);
    const internal = getInternalDifficulty(levelId);
    console.log(
      `OK level ${result.levelId} clues=${result.clues} solutions=${result.solutions} [internal=${internal}]`
    );
  } catch (error) {
    failed += 1;
    console.error(`FAIL level ${levelId}:`, error instanceof Error ? error.message : error);
  }
}

if (failed > 0) {
  console.error(`\nvalidate:levels FAILED (${failed}/${LEVELS})`);
  process.exit(1);
}

console.log(`\nvalidate:levels PASSED (${LEVELS}/${LEVELS})`);
