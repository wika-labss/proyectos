/**
 * Gate WIKA V2 — valida que los 20 niveles generen puzzles con solución única.
 * npm run validate:levels
 */
import { assertLevelPuzzle } from '../src/engine/generator';

const LEVELS = 20;
let failed = 0;

console.log('=== Sodoku nuevo V2 — validate:levels ===');

for (let levelId = 1; levelId <= LEVELS; levelId += 1) {
  try {
    const result = assertLevelPuzzle(levelId);
    console.log(
      `OK level ${result.levelId} clues=${result.clues} solutions=${result.solutions}`
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
