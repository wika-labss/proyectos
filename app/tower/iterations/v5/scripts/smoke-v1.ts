/**
 * Smoke V3 — balance + merge evolution gates.
 */
import assert from 'node:assert/strict';
import { LEVEL_COUNT, TOWER_MAX_TIER } from '../src/constants/game';
import {
  assertAllPadsInRange,
  assertDistinctMaps,
  canMergeTowers,
  createLevel,
  getTowerCombatStats,
  getTowerDisplayName,
  getWaves,
  levelMultipliers,
  mergeTowers,
  placeTower,
  resetIdSeq,
  startWaves,
} from '../src/engine';

function testMaps() {
  const d = assertDistinctMaps();
  assert.equal(d.count, 25);
  assert.equal(assertAllPadsInRange().ok, true);
}

function testBalanceN10() {
  const m = levelMultipliers(9); // N10
  assert.ok(m.startingGold >= 175, `gold ${m.startingGold}`);
  assert.ok(m.hp <= 1.45, `hp ${m.hp}`);
  const waves = getWaves(9);
  let total = 0;
  for (const w of waves) for (const s of w.spawns) total += s.count;
  assert.ok(total < 160, `enemies ${total} (V2 was 217)`);
  // Con oro inicial se pueden poner al menos 3 arqueras
  assert.ok(m.startingGold / 50 >= 3);
}

function testTierStats() {
  const l1 = getTowerCombatStats('archer', 1);
  const l4 = getTowerCombatStats('archer', 4);
  assert.ok(l4.damage > l1.damage);
  assert.ok(l4.fireCooldownMs < l1.fireCooldownMs);
  assert.equal(getTowerDisplayName('archer', 4), 'Ballesta Élite');
  assert.equal(getTowerDisplayName('cannon', 4), 'Mortero Infernal');
  assert.equal(getTowerDisplayName('frost', 4), 'Ventisca Absolute');
  assert.equal(getTowerDisplayName('sniper', 4), 'Águila de Ébano');
}

function testMergeChain() {
  resetIdSeq();
  let state = createLevel(0, 0);
  const pads = state.map.pads;
  // Place 8 archers to merge up to L4 (need 8 L1 for one L4)
  for (let i = 0; i < 8; i++) {
    // Give gold
    state = { ...state, gold: 999 };
    const r = placeTower(state, 'archer', pads[i]!.id);
    assert.equal(r.ok, true);
    state = r.state;
  }
  assert.equal(state.towers.length, 8);
  assert.ok(state.towers.every((t) => t.tier === 1));

  // Merge pairs → 4 L2
  for (let i = 0; i < 4; i++) {
    const a = state.towers[0]!;
    const b = state.towers[1]!;
    const check = canMergeTowers(a, b);
    assert.equal(check.ok, true);
    const r = mergeTowers(state, a.id, b.id);
    assert.equal(r.ok, true);
    state = r.state;
  }
  assert.equal(state.towers.length, 4);
  assert.ok(state.towers.every((t) => t.tier === 2));

  // → 2 L3
  for (let i = 0; i < 2; i++) {
    const a = state.towers[0]!;
    const b = state.towers[1]!;
    const r = mergeTowers(state, a.id, b.id);
    assert.equal(r.ok, true);
    state = r.state;
  }
  assert.equal(state.towers.length, 2);
  assert.ok(state.towers.every((t) => t.tier === 3));

  // → 1 L4
  const r = mergeTowers(state, state.towers[0]!.id, state.towers[1]!.id);
  assert.equal(r.ok, true);
  state = r.state;
  assert.equal(state.towers.length, 1);
  assert.equal(state.towers[0]!.tier, TOWER_MAX_TIER);
  assert.equal(
    getTowerDisplayName(state.towers[0]!.kind, state.towers[0]!.tier),
    'Ballesta Élite',
  );

  // Cannot merge L4 with L1
  state = { ...state, gold: 999 };
  const freePad = state.map.pads.find((p) => !state.occupiedPads.has(p.id));
  assert.ok(freePad);
  const extra = placeTower(state, 'archer', freePad!.id);
  assert.equal(extra.ok, true);
  state = extra.state;
  assert.equal(state.towers.length, 2);
  const fail = mergeTowers(state, state.towers[0]!.id, state.towers[1]!.id);
  assert.equal(fail.ok, false);
}

function testPreparing() {
  resetIdSeq();
  let state = createLevel(2, 0);
  assert.equal(state.status, 'preparing');
  state = startWaves(state, 10);
  assert.equal(state.status, 'playing');
}

function testCampaignCap() {
  assert.equal(LEVEL_COUNT, 25);
}

function main() {
  testMaps();
  testBalanceN10();
  testTierStats();
  testMergeChain();
  testPreparing();
  testCampaignCap();
  console.log(
    'smoke-v3: PASSED (balance N10, merge L1→L4, evolution names, 25 maps)',
  );
}

main();
