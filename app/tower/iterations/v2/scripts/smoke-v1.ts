/**
 * Smoke V2 — pure engine gates (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
  assertAllPadsInRange,
  assertDistinctMaps,
  canPlace,
  createLevel,
  getTowerType,
  getWaves,
  initialCampaign,
  isUnlocked,
  levelMultipliers,
  listTowerTypes,
  onLevelWon,
  onLeak,
  placeTower,
  positionAt,
  resetIdSeq,
  reward,
  startEconomy,
  startNextWave,
  startWaves,
  step,
  trySpend,
} from '../src/engine';
import { LEVEL_COUNT } from '../src/constants/game';

function testMapsDistinct() {
  const d = assertDistinctMaps();
  assert.equal(d.count, 25);
  assert.equal(d.uniqueIds, 25);
  assert.equal(d.uniqueMotifs, 25);
  assert.equal(d.uniquePalettes, 25);
  assert.equal(d.uniquePathSignatures, 25);
}

function testAllPadsInRange() {
  const r = assertAllPadsInRange();
  assert.equal(r.ok, true, JSON.stringify(r.offenders.slice(0, 5)));
  assert.ok(r.maxDist <= r.minRange);
}

function testFourTowers() {
  const types = listTowerTypes();
  assert.equal(types.length, 4);
  const minR = Math.min(...types.map((t) => t.range));
  assert.equal(minR, getTowerType('cannon').range);
}

function testWavesScale() {
  const w1 = getWaves(0);
  const w25 = getWaves(24);
  const m1 = levelMultipliers(0);
  const m25 = levelMultipliers(24);
  assert.ok(w25.length > w1.length);
  assert.ok(m25.hp > m1.hp);
  assert.ok(m25.waveCount > m1.waveCount);
}

function testPreparingThenWaves() {
  resetIdSeq();
  let state = createLevel(2, 0); // Puente
  assert.equal(state.status, 'preparing');
  assert.equal(state.pendingSpawns.length, 0);
  assert.equal(state.enemies.length, 0);

  const pad = state.map.pads[0]!;
  assert.equal(canPlace(state, 'archer', pad.id), true);
  const placed = placeTower(state, 'archer', pad.id);
  assert.equal(placed.ok, true);
  state = placed.state;
  assert.equal(state.status, 'preparing');

  state = startWaves(state, 100);
  assert.equal(state.status, 'playing');
  assert.ok(state.pendingSpawns.length > 0);
}

function testPlaceDuringWaveAndBreak() {
  resetIdSeq();
  let state = createLevel(0, 0);
  state = startWaves(state, 0);
  assert.equal(canPlace(state, 'frost', state.map.pads[1]!.id), true);

  // Force wave break
  state = {
    ...state,
    pendingSpawns: [],
    enemies: [],
    waveActive: true,
  };
  const r = step(state, 50);
  assert.equal(r.state.status, 'waveBreak');
  assert.equal(canPlace(r.state, 'cannon', r.state.map.pads[2]!.id), true);
}

function testCombatOnPuente() {
  resetIdSeq();
  let state = createLevel(2, 0); // was broken in V1
  const pad = state.map.pads[0]!;
  const placed = placeTower(state, 'cannon', pad.id); // menor rango
  assert.equal(placed.ok, true);
  state = startWaves(placed.state, 0);

  // Put enemy near pad projection on path
  const near = positionAt(state.map.path, 0.2);
  state = {
    ...state,
    pendingSpawns: [],
    enemies: [
      {
        id: 'e-weak',
        kind: 'runner',
        hp: 8,
        maxHp: 8,
        speed: 0.01,
        pathT: 0.2,
        slowUntil: 0,
        slowFactor: 1,
        rewardGold: 10,
        baseDamage: 1,
        radius: 2,
        color: '#ffa',
      },
    ],
    towers: state.towers.map((t) => ({
      ...t,
      pos: { x: near.x + 10, y: near.y }, // within cannon range 26
      cooldownUntil: 0,
    })),
  };

  let killed = false;
  for (let i = 0; i < 50; i++) {
    const r = step(state, 100);
    state = r.state;
    if (r.events.some((e) => e.type === 'enemyKilled')) {
      killed = true;
      break;
    }
  }
  assert.equal(killed, true);
}

function testEconomyAndCampaign() {
  let eco = startEconomy(100);
  const spend = trySpend(eco, 50);
  assert.equal(spend.ok, true);
  eco = reward(spend.eco, 8);
  assert.equal(eco.gold, 58);

  const leak = onLeak(1, 'boss');
  assert.equal(leak.defeated, true);

  let p = initialCampaign();
  assert.equal(isUnlocked(1, p.maxUnlockedLevel), true);
  p = onLevelWon(1, p);
  assert.equal(p.maxUnlockedLevel, 2);
  p = onLevelWon(LEVEL_COUNT, p);
  assert.equal(p.campaignComplete, true);
  assert.equal(p.maxUnlockedLevel, LEVEL_COUNT);
}

function testNextWave() {
  resetIdSeq();
  let state = createLevel(0, 0);
  state = startWaves(state, 0);
  state = {
    ...state,
    pendingSpawns: [],
    enemies: [],
    waveActive: true,
  };
  const broken = step(state, 50).state;
  assert.equal(broken.status, 'waveBreak');
  state = startNextWave(broken, 1000);
  assert.equal(state.status, 'playing');
  assert.equal(state.waveIndex, 1);
}

function main() {
  testMapsDistinct();
  testAllPadsInRange();
  testFourTowers();
  testWavesScale();
  testPreparingThenWaves();
  testPlaceDuringWaveAndBreak();
  testCombatOnPuente();
  testEconomyAndCampaign();
  testNextWave();
  console.log(
    'smoke-v2: PASSED (25 maps, pad range, preparing, place phases, combat, campaign)',
  );
}

main();
