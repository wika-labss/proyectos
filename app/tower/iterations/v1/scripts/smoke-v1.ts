/**
 * Smoke V1 — pure engine gates (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
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
  step,
  trySpend,
} from '../src/engine';

function testMapsDistinct() {
  const d = assertDistinctMaps();
  assert.equal(d.count, 15);
  assert.equal(d.uniqueIds, 15);
  assert.equal(d.uniqueMotifs, 15);
  assert.equal(d.uniquePalettes, 15);
  assert.equal(d.uniquePathSignatures, 15);
}

function testFourTowers() {
  const types = listTowerTypes();
  assert.equal(types.length, 4);
  assert.ok(types.every((t) => t.cost > 0 && t.damage > 0 && t.range > 0));
  assert.ok(getTowerType('cannon').splashRadius);
  assert.ok(getTowerType('frost').slowFactor);
  assert.ok(getTowerType('sniper').range > getTowerType('archer').range);
}

function testWavesScale() {
  const w1 = getWaves(0);
  const w15 = getWaves(14);
  const m1 = levelMultipliers(0);
  const m15 = levelMultipliers(14);
  assert.ok(w15.length > w1.length);
  assert.ok(m15.hp > m1.hp);
  assert.ok(m15.waveCount > m1.waveCount);
  assert.ok(m15.startingGold < m1.startingGold);
}

function testPathAndLeak() {
  resetIdSeq();
  let state = createLevel(0, 0);
  // Force a grunt near the end
  state = {
    ...state,
    pendingSpawns: [],
    enemies: [
      {
        id: 'e-test',
        kind: 'grunt',
        hp: 10,
        maxHp: 10,
        speed: 200,
        pathT: 0.99,
        slowUntil: 0,
        slowFactor: 1,
        rewardGold: 8,
        baseDamage: 1,
        radius: 2,
        color: '#fff',
      },
    ],
  };
  const before = state.lives;
  const { state: next, events } = step(state, 500);
  assert.ok(events.some((e) => e.type === 'enemyLeaked'));
  assert.equal(next.lives, before - 1);
}

function testEconomyAndPlace() {
  resetIdSeq();
  let eco = startEconomy(100);
  const spend = trySpend(eco, 50);
  assert.equal(spend.ok, true);
  assert.equal(spend.eco.gold, 50);
  eco = reward(spend.eco, 8);
  assert.equal(eco.gold, 58);

  let state = createLevel(0, 0);
  const pad = state.map.pads[0]!;
  assert.equal(canPlace(state, 'archer', pad.id), true);
  const placed = placeTower(state, 'archer', pad.id);
  assert.equal(placed.ok, true);
  assert.equal(placed.state.towers.length, 1);
  assert.equal(placed.state.occupiedPads.has(pad.id), true);
  assert.ok(placed.state.gold < state.gold);

  const again = placeTower(placed.state, 'cannon', pad.id);
  assert.equal(again.ok, false);
}

function testCombatKill() {
  resetIdSeq();
  let state = createLevel(0, 0);
  const pad = state.map.pads[0]!;
  const placed = placeTower(state, 'sniper', pad.id);
  assert.equal(placed.ok, true);
  state = placed.state;

  // Put weak enemy in sniper range near tower
  const near = positionAt(state.map.path, 0.2);
  // Ensure pad is somewhat near path — place enemy at pathT with HP low
  state = {
    ...state,
    pendingSpawns: [],
    enemies: [
      {
        id: 'e-weak',
        kind: 'runner',
        hp: 5,
        maxHp: 5,
        speed: 0.01,
        pathT: 0.15,
        slowUntil: 0,
        slowFactor: 1,
        rewardGold: 10,
        baseDamage: 1,
        radius: 2,
        color: '#ffa',
      },
    ],
    // Move tower to be near enemy for guaranteed hit in tests:
    towers: state.towers.map((t) => ({
      ...t,
      pos: near,
      cooldownUntil: 0,
    })),
  };

  let goldBefore = state.gold;
  let killed = false;
  for (let i = 0; i < 40; i++) {
    const r = step(state, 100);
    state = r.state;
    if (r.events.some((e) => e.type === 'enemyKilled')) {
      killed = true;
      goldBefore = state.gold;
      break;
    }
  }
  assert.equal(killed, true);
  assert.ok(state.gold >= goldBefore);
}

function testWaveBreakAndWinShortcut() {
  resetIdSeq();
  let state = createLevel(0, 0);
  // Clear first wave artificially
  state = {
    ...state,
    pendingSpawns: [],
    enemies: [],
    waveActive: true,
  };
  const r = step(state, 50);
  assert.equal(r.state.status, 'waveBreak');
  assert.ok(r.events.some((e) => e.type === 'waveCleared'));

  state = startNextWave(r.state, 1000);
  assert.equal(state.status, 'playing');
  assert.equal(state.waveIndex, 1);
}

function testDefeat() {
  const leak = onLeak(1, 'boss');
  assert.equal(leak.defeated, true);
  assert.equal(leak.lives, 0);
  assert.equal(leak.damage, 3);
}

function testCampaign() {
  let p = initialCampaign();
  assert.equal(isUnlocked(1, p.maxUnlockedLevel), true);
  assert.equal(isUnlocked(2, p.maxUnlockedLevel), false);
  p = onLevelWon(1, p);
  assert.equal(p.maxUnlockedLevel, 2);
  p = onLevelWon(15, p);
  assert.equal(p.campaignComplete, true);
  assert.equal(p.maxUnlockedLevel, 15);
}

function main() {
  testMapsDistinct();
  testFourTowers();
  testWavesScale();
  testPathAndLeak();
  testEconomyAndPlace();
  testCombatKill();
  testWaveBreakAndWinShortcut();
  testDefeat();
  testCampaign();
  console.log(
    'smoke-v1: PASSED (maps×15, towers×4, waves, path/leak, economy, combat, campaign)',
  );
}

main();
