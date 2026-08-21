/**
 * Smoke V1 — pure engine + levels data (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import { allLevels, getLevel } from '../src/data/levels';
import { COUNTRIES } from '../src/data/countries';
import {
  createBoard,
  createGame,
  findHintMove,
  findMatches,
  hasValidMoves,
  reshuffle,
  resolveAll,
  trySwap,
  usePanic,
  type Board,
  type GemType,
} from '../src/engine/match3Engine';
import {
  applyVictory,
  defaultProgress,
} from '../src/modules/progress/progressStore';
import { REWARDS_TO_UNLOCK_COUNTRY } from '../src/constants/game';

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function testBoardSize() {
  const b = createBoard(seededRng(1));
  assert.equal(b.length, 10);
  assert.equal(b[0]!.length, 8);
}

function testNoInitialMatches() {
  for (let seed = 1; seed < 30; seed++) {
    const b = createBoard(seededRng(seed));
    assert.equal(findMatches(b).length, 0, `seed ${seed} had matches`);
  }
}

function forceMatchBoard(): Board {
  const b = createBoard(seededRng(42));
  // Create horizontal match by swapping into place via direct paint
  for (let c = 0; c < 8; c++) {
    for (let r = 0; r < 10; r++) b[r]![c] = ((r + c) % 5) as GemType;
  }
  // Row 5: A A B A — swap B with neighbor to make A A A
  b[5]![0] = 0;
  b[5]![1] = 0;
  b[5]![2] = 1;
  b[5]![3] = 0;
  b[4]![2] = 2;
  b[6]![2] = 3;
  return b;
}

function testSwapAndScore() {
  const board = forceMatchBoard();
  let state = createGame(25, 800, 1, seededRng(7));
  state = { ...state, board };
  const before = state.score;
  const next = trySwap(state, { r: 5, c: 2 }, { r: 5, c: 3 }, seededRng(9));
  assert.ok(next.score > before || next.movesLeft === state.movesLeft - 1 || next === state);
  // Valid swap should consume move and increase score
  assert.equal(next.movesLeft, 24);
  assert.ok(next.score > before);
}

function testHintAndReshuffle() {
  const b = createBoard(seededRng(3));
  const hint = findHintMove(b);
  assert.ok(hint === null || hasValidMoves(b));
  const shuffled = reshuffle(b, seededRng(99));
  assert.equal(findMatches(shuffled).length, 0);
  assert.equal(hasValidMoves(shuffled), true);
}

function testPanic() {
  let state = createGame(20, 1200, 1, seededRng(5));
  state = usePanic(state, seededRng(11));
  assert.equal(state.panicUsesLeft, 0);
  assert.equal(hasValidMoves(state.board), true);
}

function testWinLose() {
  let state = createGame(1, 100, 1, seededRng(2));
  state = { ...state, score: 100 };
  const board = forceMatchBoard();
  state = { ...state, board, movesLeft: 1 };
  const next = trySwap(state, { r: 5, c: 2 }, { r: 5, c: 3 }, seededRng(4));
  assert.equal(next.status, 'won');

  let lose = createGame(1, 99999, 1, seededRng(2));
  lose = { ...lose, board: forceMatchBoard(), movesLeft: 1, score: 0 };
  const lost = trySwap(lose, { r: 5, c: 2 }, { r: 5, c: 3 }, seededRng(4));
  // After one move, if still under minScore and moves 0 → lost
  if (lost.score < lost.minScore && lost.movesLeft <= 0) {
    assert.equal(lost.status, 'lost');
  }
}

function testLevelsData() {
  assert.equal(COUNTRIES.length, 5);
  assert.equal(allLevels().length, 50);
  const easy = getLevel('mx', 0);
  assert.equal(easy.difficulty, 'easy');
  assert.equal(easy.moves, 25);
  assert.equal(easy.minScore, 800);
  const med = getLevel('mx', 1);
  assert.equal(med.difficulty, 'medium');
  assert.equal(med.moves, 20);
  assert.equal(med.minScore, 1200 + 75);
}

function testProgressUnlock() {
  assert.equal(REWARDS_TO_UNLOCK_COUNTRY, 3);
  let p = defaultProgress();
  // Win levels 0..8 with rewards
  for (let i = 0; i < 9; i++) {
    p = applyVictory(p, 'mx', i, 1000, () => 0.1);
  }
  assert.equal(p.unlockedLevelByCountry.mx, 9);
  assert.equal(p.unlockedCountryIndex, 0);
  // Need ≥3 rewards — already have 9
  assert.ok(p.inventory.length >= REWARDS_TO_UNLOCK_COUNTRY);
  p = applyVictory(p, 'mx', 9, 1000, () => 0.2);
  assert.equal(p.unlockedCountryIndex, 1);
  assert.equal(p.unlockedLevelByCountry.co, 0);
}

function testResolveStable() {
  const board = forceMatchBoard();
  // Paint a clear triple
  board[0]![0] = 0;
  board[0]![1] = 0;
  board[0]![2] = 0;
  let state = createGame(25, 800, 1, seededRng(1));
  state = { ...state, board };
  state = resolveAll(state, seededRng(2));
  assert.equal(findMatches(state.board).length, 0);
}

const tests = [
  testBoardSize,
  testNoInitialMatches,
  testSwapAndScore,
  testHintAndReshuffle,
  testPanic,
  testWinLose,
  testLevelsData,
  testProgressUnlock,
  testResolveStable,
];

for (const t of tests) {
  t();
  console.log(`ok ${t.name}`);
}
console.log(`\n${tests.length} smoke tests passed`);
