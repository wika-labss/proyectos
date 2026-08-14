/**
 * Smoke local (sin Expo) — rewards + inventory + progression API.
 * npx --yes tsx scripts/smoke-v3.ts
 */
import { getContinueLevelId, completeLevel, createInitialProgress } from '../src/modules/level-progression';
import { countGifts, listGifts } from '../src/modules/inventory';
import { rollReward } from '../src/modules/rewards';
import { REWARD_NAMES } from '../src/types';
import { getInternalDifficulty, TOTAL_LEVELS } from '../src/constants/levels';

let failed = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  } else {
    console.log('OK', msg);
  }
}

assert(TOTAL_LEVELS === 100, 'TOTAL_LEVELS=100');
assert(getInternalDifficulty(1) === 'easy', 'level 1 internal easy');
assert(getInternalDifficulty(2) === 'medium', 'level 2 internal medium');
assert(getInternalDifficulty(99) === 'easy', 'level 99 internal easy');
assert(getInternalDifficulty(100) === 'medium', 'level 100 internal medium');

const seen = new Set<string>();
for (let i = 0; i < 200; i += 1) seen.add(rollReward());
assert(seen.size === 8, 'rollReward covers all 8 names');
for (const name of REWARD_NAMES) assert(seen.has(name), `seen ${name}`);

let progress = createInitialProgress();
assert(getContinueLevelId(progress) === 1, 'continue starts at 1');
assert(countGifts(progress.inventory) === 0, 'inventory empty');

progress = completeLevel(progress, 1, 100, 'regalo 3');
assert(progress.lastReward === 'regalo 3', 'lastReward set');
assert(listGifts(progress.inventory).includes('regalo 3'), 'inventory has regalo 3');
assert(progress.unlockedLevels.includes(2), 'unlocks level 2');
assert(getContinueLevelId(progress) === 2, 'continue advances to 2');

if (failed > 0) {
  console.error(`smoke-v3 FAILED (${failed})`);
  process.exit(1);
}
console.log('smoke-v3 PASSED');
