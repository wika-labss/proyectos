/**
 * Smoke V3 — engine + economy + travel + affinity.
 */
import assert from 'node:assert/strict';
import { STARTING_COINS } from '../src/constants/game';
import { AVATAR_IDS } from '../src/data/avatarIds';
import { COUNTRIES } from '../src/data/countries';
import { allLevels, getLevel } from '../src/data/levels';
import { SUITORS, getSuitor } from '../src/data/suitors';
import {
  applyGift,
  emptyAffinity,
  giftDelta,
  relationshipStatus,
} from '../src/engine/affinity';
import { coinsAwarded, travelCost } from '../src/engine/economy';
import {
  createBoard,
  createGame,
  findHintMove,
  findMatches,
  hasValidMoves,
  loseByTime,
  reshuffle,
  resolveAll,
  trySwap,
  usePanic,
  type Board,
  type GemType,
} from '../src/engine/match3Engine';
import {
  applyVictory,
  canTravelToNext,
  defaultProgress,
  giveGift,
  saveProfile,
  travelToNextCountry,
} from '../src/modules/progress/progressStore';

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
  for (let c = 0; c < 8; c++) {
    for (let r = 0; r < 10; r++) b[r]![c] = ((r + c) % 5) as GemType;
  }
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
  const board = forceMatchBoard();
  state = { ...state, board, movesLeft: 1, score: 100 };
  const next = trySwap(state, { r: 5, c: 2 }, { r: 5, c: 3 }, seededRng(4));
  assert.equal(next.status, 'won');
}

function testTimeout() {
  let playing = createGame(25, 99999, 1, seededRng(1));
  playing = loseByTime(playing);
  assert.equal(playing.status, 'lost');
  let winning = createGame(25, 10, 1, seededRng(1));
  winning = { ...winning, score: 10 };
  winning = loseByTime(winning);
  assert.equal(winning.status, 'won');
}

function testLevelsData() {
  assert.equal(COUNTRIES.length, 5);
  assert.equal(allLevels().length, 50);
  assert.equal(getLevel('mx', 0).difficulty, 'easy');
  assert.equal(getLevel('mx', 1).difficulty, 'medium');
}

function testCoinsFormula() {
  assert.equal(coinsAwarded(0), 3);
  assert.equal(coinsAwarded(150), 200);
  assert.equal(travelCost(false), 500);
  assert.equal(travelCost(true), 1000);
}

function completeMexico(p = defaultProgress()) {
  for (let i = 0; i < 10; i++) {
    p = applyVictory(p, 'mx', i, 2000, 150, () => 0.1);
  }
  return p;
}

function testPayoutAndNoAutoTravel() {
  assert.equal(defaultProgress().coins, STARTING_COINS);
  let p = defaultProgress();
  p = { ...p, coins: 0 };
  p = applyVictory(p, 'mx', 0, 1000, 0, () => 0.1);
  assert.equal(p.coins, 3);
  p = applyVictory(p, 'mx', 1, 1000, 150, () => 0.1);
  assert.equal(p.coins, 203);
  assert.equal(p.inventory.length, 1);
  p = completeMexico({ ...defaultProgress(), coins: 0 });
  assert.equal(p.countryCleared.mx, true);
  assert.equal(p.unlockedCountryIndex, 0);
}

function testTravelGates() {
  let incomplete = defaultProgress();
  incomplete = { ...incomplete, coins: 500 };
  assert.equal(canTravelToNext(incomplete), false);
  for (let i = 0; i < 9; i++) {
    incomplete = applyVictory(incomplete, 'mx', i, 2000, 150, () => 0.1);
  }
  incomplete = { ...incomplete, coins: 500 };
  assert.equal(incomplete.countryCleared.mx, false);
  assert.equal(canTravelToNext(incomplete), false);

  let p = completeMexico({ ...defaultProgress(), coins: 0 });
  p = { ...p, coins: 0 };
  assert.equal(canTravelToNext(p), false);
  p = { ...p, coins: 499 };
  assert.equal(canTravelToNext(p), false);
  p = { ...p, coins: 500 };
  assert.equal(canTravelToNext(p), true);
  p = travelToNextCountry(p);
  assert.equal(p.coins, 0);
  assert.equal(p.unlockedCountryIndex, 1);
  assert.equal(p.unlockedLevelByCountry.co, 0);

  let withPartner = completeMexico({ ...defaultProgress(), coins: 0 });
  withPartner = { ...withPartner, partnerId: 'mx-h1', coins: 999 };
  assert.equal(canTravelToNext(withPartner), false);
  withPartner = { ...withPartner, coins: 1000 };
  assert.equal(canTravelToNext(withPartner), true);
  withPartner = travelToNextCountry(withPartner);
  assert.equal(withPartner.coins, 0);
  assert.equal(withPartner.unlockedCountryIndex, 1);
}

function testGiftDelta() {
  assert.equal(giftDelta(1, 'h1'), 10);
  assert.equal(giftDelta(1, 'm1'), 2);
}

function testPartnerAndMirror() {
  let aff = emptyAffinity();
  const diego = getSuitor('mx-h1')!;
  const camila = getSuitor('mx-m1')!;
  for (let i = 0; i < 12; i++) aff = applyGift(aff, diego.id, 1, diego.slot);
  assert.equal(aff.partnerId, diego.id);
  for (let i = 0; i < 12; i++) aff = applyGift(aff, camila.id, 3, camila.slot);
  assert.equal(
    relationshipStatus(aff.affinityBySuitor[camila.id]!, false, true),
    'amorio',
  );
}

function testCatalogs() {
  assert.equal(AVATAR_IDS.length, 6);
  assert.equal(SUITORS.length, 20);
  let p = defaultProgress();
  p = saveProfile(p, 'Vissiuss', 'ambos', 'avatar-m1');
  assert.equal(p.profile?.username, 'Vissiuss');
}

function testResolveStable() {
  const board = forceMatchBoard();
  board[0]![0] = 0;
  board[0]![1] = 0;
  board[0]![2] = 0;
  let state = createGame(25, 800, 1, seededRng(1));
  state = { ...state, board };
  state = resolveAll(state, seededRng(2));
  assert.equal(findMatches(state.board).length, 0);
}

function testGiveGiftStillWorks() {
  let p = defaultProgress();
  p = applyVictory(p, 'mx', 1, 1000, 10, () => 0);
  assert.ok(p.inventory.length >= 1);
  const id = p.inventory[0]!.id;
  p = giveGift(p, 'mx-h1', id);
  assert.ok((p.affinityBySuitor['mx-h1'] ?? 0) > 0);
}

const tests = [
  testBoardSize,
  testNoInitialMatches,
  testSwapAndScore,
  testHintAndReshuffle,
  testPanic,
  testWinLose,
  testTimeout,
  testLevelsData,
  testCoinsFormula,
  testPayoutAndNoAutoTravel,
  testTravelGates,
  testGiftDelta,
  testPartnerAndMirror,
  testCatalogs,
  testResolveStable,
  testGiveGiftStillWorks,
];

for (const t of tests) {
  t();
  console.log(`ok ${t.name}`);
}
console.log(`\n${tests.length} smoke tests passed`);
