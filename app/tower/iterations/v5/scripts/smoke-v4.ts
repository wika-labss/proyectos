/**
 * Smoke V4 — dificultad ↑, venta 70%, infinito, shop catalog.
 */
import assert from 'node:assert/strict';
import {
  LEVEL_COUNT,
  SELL_REFUND_RATE,
  TOWER_MAX_TIER,
} from '../src/constants/game';
import {
  assertAllPadsInRange,
  assertDistinctMaps,
  buildInfiniteWave,
  canMergeTowers,
  createInfiniteRun,
  createLevel,
  getTowerCombatStats,
  getTowerDisplayName,
  getWaves,
  infiniteHpMult,
  levelMultipliers,
  mergeTowers,
  placeTower,
  resetIdSeq,
  sellRefundAmount,
  sellTower,
  startNextWave,
  startWaves,
} from '../src/engine';
import { CONTENT_PACK_PREVIEW, SHOP_PRODUCTS } from '../src/engine/shopCatalog';

function testMaps() {
  const d = assertDistinctMaps();
  assert.equal(d.count, LEVEL_COUNT);
  assert.equal(assertAllPadsInRange().ok, true);
}

function testHarderThanV3N10() {
  const m = levelMultipliers(9); // N10
  // V3 N10: gold ~184, hp ~1.4
  assert.ok(m.startingGold < 185, `gold too soft ${m.startingGold}`);
  assert.ok(m.startingGold >= 160, `gold too harsh ${m.startingGold}`);
  assert.ok(m.hp > 1.4, `hp should be > V3 ${m.hp}`);
  assert.ok(m.hp <= 1.6, `hp too harsh ${m.hp}`);
  const waves = getWaves(9);
  let total = 0;
  for (const w of waves) for (const s of w.spawns) total += s.count;
  assert.ok(total < 180, `enemies ${total}`);
  assert.ok(m.startingGold / 50 >= 3);
}

function testSellRefund() {
  assert.equal(SELL_REFUND_RATE, 0.7);
  assert.equal(sellRefundAmount(50), 35);
  assert.equal(sellRefundAmount(75), 52);
  assert.equal(sellRefundAmount(100), 70);

  resetIdSeq();
  let state = createLevel(0, 0);
  state = { ...state, gold: 999 };
  const pad = state.map.pads[0]!;
  const placed = placeTower(state, 'archer', pad.id);
  assert.equal(placed.ok, true);
  state = placed.state;
  const tower = state.towers[0]!;
  assert.equal(tower.investedGold, 50);
  const goldBefore = state.gold;
  const sold = sellTower(state, tower.id);
  assert.equal(sold.ok, true);
  state = sold.state;
  assert.equal(state.towers.length, 0);
  assert.equal(state.gold, goldBefore + 35);
  assert.ok(!state.occupiedPads.has(pad.id));
  const ev = sold.events.find((e) => e.type === 'towerSold');
  assert.ok(ev && ev.type === 'towerSold' && ev.refund === 35);
}

function testSellEvolved() {
  resetIdSeq();
  let state = createLevel(0, 0);
  state = { ...state, gold: 999 };
  const pads = state.map.pads;
  for (let i = 0; i < 2; i++) {
    const r = placeTower(state, 'archer', pads[i]!.id);
    assert.equal(r.ok, true);
    state = r.state;
  }
  const a = state.towers[0]!;
  const b = state.towers[1]!;
  assert.equal(canMergeTowers(a, b).ok, true);
  const merged = mergeTowers(state, a.id, b.id);
  assert.equal(merged.ok, true);
  state = merged.state;
  const t = state.towers[0]!;
  assert.equal(t.tier, 2);
  assert.equal(t.investedGold, 100); // 50+50
  const goldBefore = state.gold;
  const sold = sellTower(state, t.id);
  assert.equal(sold.ok, true);
  assert.equal(sold.state.gold, goldBefore + 70); // floor(100*0.7)
}

function testInfinite() {
  resetIdSeq();
  let state = createInfiniteRun(0);
  assert.equal(state.mode, 'infinite');
  assert.equal(state.waves.length, 1);
  assert.ok(state.gold >= 200);
  assert.equal(infiniteHpMult(0), 1);
  assert.ok(infiniteHpMult(10) > infiniteHpMult(0));

  const w0 = buildInfiniteWave(0);
  const w10 = buildInfiniteWave(10);
  const c0 = w0.spawns.reduce((s, sp) => s + sp.count, 0);
  const c10 = w10.spawns.reduce((s, sp) => s + sp.count, 0);
  assert.ok(c10 > c0, `infinite scale ${c0} → ${c10}`);

  state = startWaves(state, 0);
  // Simulate clear → waveBreak by emptying field
  state = {
    ...state,
    enemies: [],
    pendingSpawns: [],
    waveActive: true,
    status: 'playing',
  };
  // Force wave break path via startNextWave after manual waveBreak
  state = { ...state, status: 'waveBreak', waveActive: false };
  state = startNextWave(state, 1000);
  assert.equal(state.waveIndex, 1);
  assert.ok(state.waves.length >= 2);
  assert.equal(state.status, 'playing');
}

function testShopCatalog() {
  assert.equal(SHOP_PRODUCTS.length, 2);
  assert.ok(SHOP_PRODUCTS.some((p) => p.id === 'infinite'));
  assert.ok(SHOP_PRODUCTS.some((p) => p.id === 'content_pack'));
  assert.equal(CONTENT_PACK_PREVIEW.maps.length, 10);
  assert.ok(CONTENT_PACK_PREVIEW.towers.length >= 2);
  assert.ok(CONTENT_PACK_PREVIEW.hardcore.length > 0);
}

function testTierNames() {
  assert.equal(TOWER_MAX_TIER, 4);
  assert.equal(getTowerDisplayName('archer', 4), 'Ballesta Élite');
  const l1 = getTowerCombatStats('archer', 1);
  const l4 = getTowerCombatStats('archer', 4);
  assert.ok(l4.damage > l1.damage);
}

console.log('smoke-v4…');
testMaps();
testHarderThanV3N10();
testSellRefund();
testSellEvolved();
testInfinite();
testShopCatalog();
testTierNames();
console.log('smoke-v4 OK');
