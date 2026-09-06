import { createBaseLives, onLeak } from './baseLives';
import { reward, startEconomy, trySpend } from './economy';
import { getEnemyType } from './enemyTypes';
import { getMap } from './mapCatalog';
import { advancePath } from './pathSystem';
import { canMergeTowers } from './towerMerge';
import { tickCombat } from './towerCombat';
import { getTowerType } from './towerTypes';
import { getWaves, levelMultipliers } from './waveSystem';
import type {
  Enemy,
  PendingSpawn,
  TdEvent,
  TdState,
  TowerKind,
} from './types';

let idSeq = 1;
function nextId(prefix: string): string {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

export function resetIdSeq(n = 1): void {
  idSeq = n;
}

function scaleEnemy(kind: Enemy['kind'], hpMult: number): Enemy {
  const def = getEnemyType(kind);
  const hp = Math.round(def.hp * hpMult);
  return {
    id: nextId('e'),
    kind,
    hp,
    maxHp: hp,
    speed: def.speed,
    pathT: 0,
    slowUntil: 0,
    slowFactor: 1,
    rewardGold: def.rewardGold,
    baseDamage: def.baseDamage,
    radius: def.radius,
    color: def.color,
  };
}

function queueWaveSpawns(
  state: TdState,
  waveIndex: number,
  nowMs: number,
): PendingSpawn[] {
  const wave = state.waves[waveIndex];
  if (!wave) return [];
  const pending: PendingSpawn[] = [];
  let t = nowMs;
  for (const spawn of wave.spawns) {
    for (let i = 0; i < spawn.count; i++) {
      pending.push({ kind: spawn.kind, atMs: t });
      t += spawn.intervalMs;
    }
  }
  return pending;
}

export function createLevel(levelIndex: number, nowMs = 0): TdState {
  const map = getMap(levelIndex);
  const waves = getWaves(levelIndex);
  const { startingGold } = levelMultipliers(levelIndex);
  const eco = startEconomy(startingGold);
  return {
    status: 'preparing',
    levelIndex,
    waveIndex: 0,
    lives: createBaseLives(),
    gold: eco.gold,
    towers: [],
    occupiedPads: new Set(),
    enemies: [],
    projectiles: [],
    pendingSpawns: [],
    waveActive: false,
    nowMs,
    map,
    waves,
  };
}

/** Sale de preparación e inicia la oleada 1. */
export function startWaves(state: TdState, nowMs: number): TdState {
  if (state.status !== 'preparing') return state;
  const pending = queueWaveSpawns(state, 0, nowMs);
  return {
    ...state,
    status: 'playing',
    waveIndex: 0,
    pendingSpawns: pending,
    waveActive: true,
    nowMs,
  };
}

export function canPlace(
  state: TdState,
  kind: TowerKind,
  padId: string,
): boolean {
  if (
    state.status !== 'playing' &&
    state.status !== 'waveBreak' &&
    state.status !== 'preparing'
  ) {
    return false;
  }
  if (state.occupiedPads.has(padId)) return false;
  const pad = state.map.pads.find((p) => p.id === padId);
  if (!pad) return false;
  const cost = getTowerType(kind).cost;
  return state.gold >= cost;
}

export function placeTower(
  state: TdState,
  kind: TowerKind,
  padId: string,
): { state: TdState; events: TdEvent[]; ok: boolean } {
  if (!canPlace(state, kind, padId)) {
    return { state, events: [], ok: false };
  }
  const pad = state.map.pads.find((p) => p.id === padId)!;
  const def = getTowerType(kind);
  const spent = trySpend({ gold: state.gold }, def.cost);
  if (!spent.ok) return { state, events: [], ok: false };

  const occupiedPads = new Set(state.occupiedPads);
  occupiedPads.add(padId);
  const tower = {
    id: nextId('t'),
    kind,
    tier: 1 as const,
    padId,
    pos: { x: pad.x, y: pad.y },
    cooldownUntil: state.nowMs,
  };

  return {
    ok: true,
    events: [{ type: 'towerPlaced', kind, cost: def.cost }],
    state: {
      ...state,
      gold: spent.eco.gold,
      towers: [...state.towers, tower],
      occupiedPads,
    },
  };
}

/** Fusiona src sobre dst: misma clase+tier → torre tier+1 en pad de dst. */
export function mergeTowers(
  state: TdState,
  sourceId: string,
  targetId: string,
): { state: TdState; events: TdEvent[]; ok: boolean; reason?: string } {
  if (
    state.status !== 'playing' &&
    state.status !== 'waveBreak' &&
    state.status !== 'preparing'
  ) {
    return { state, events: [], ok: false, reason: 'Estado inválido' };
  }
  const src = state.towers.find((t) => t.id === sourceId);
  const dst = state.towers.find((t) => t.id === targetId);
  if (!src || !dst) {
    return { state, events: [], ok: false, reason: 'Torre no encontrada' };
  }
  const check = canMergeTowers(src, dst);
  if (!check.ok) {
    return { state, events: [], ok: false, reason: check.reason };
  }

  const occupiedPads = new Set(state.occupiedPads);
  occupiedPads.delete(src.padId);
  // dst pad remains occupied

  const merged = {
    id: nextId('t'),
    kind: dst.kind,
    tier: check.nextTier,
    padId: dst.padId,
    pos: { ...dst.pos },
    cooldownUntil: state.nowMs,
  };

  const towers = state.towers
    .filter((t) => t.id !== sourceId && t.id !== targetId)
    .concat(merged);

  return {
    ok: true,
    events: [{ type: 'towerMerged', kind: merged.kind, tier: merged.tier }],
    state: {
      ...state,
      towers,
      occupiedPads,
    },
  };
}

export function startNextWave(state: TdState, nowMs: number): TdState {
  if (state.status !== 'waveBreak') return state;
  const nextIndex = state.waveIndex + 1;
  if (nextIndex >= state.waves.length) {
    return { ...state, status: 'levelVictory' };
  }
  const pending = queueWaveSpawns(
    { ...state, waveIndex: nextIndex },
    nextIndex,
    nowMs,
  );
  return {
    ...state,
    status: 'playing',
    waveIndex: nextIndex,
    pendingSpawns: pending,
    waveActive: true,
    nowMs,
  };
}

export function step(
  state: TdState,
  dtMs: number,
): { state: TdState; events: TdEvent[] } {
  if (state.status !== 'playing') {
    return { state, events: [] };
  }

  const nowMs = state.nowMs + dtMs;
  const hpMult = levelMultipliers(state.levelIndex).hp;
  const events: TdEvent[] = [];

  let pendingSpawns = [...state.pendingSpawns];
  let enemies = [...state.enemies];
  const due = pendingSpawns.filter((p) => p.atMs <= nowMs);
  pendingSpawns = pendingSpawns.filter((p) => p.atMs > nowMs);
  for (const s of due) {
    enemies.push(scaleEnemy(s.kind, hpMult));
  }

  const still: Enemy[] = [];
  let lives = state.lives;
  for (const e of enemies) {
    const slowed = nowMs < e.slowUntil ? e.slowFactor : 1;
    const speed = e.speed * slowed;
    const distance = (speed * dtMs) / 1000;
    const adv = advancePath(state.map.path, e.pathT, distance);
    if (adv.reachedBase) {
      const leak = onLeak(lives, e.kind);
      lives = leak.lives;
      events.push({ type: 'enemyLeaked', kind: e.kind, damage: leak.damage });
      if (leak.defeated) {
        return {
          events: [...events, { type: 'levelLost' }],
          state: {
            ...state,
            status: 'defeat',
            lives: 0,
            enemies: [],
            pendingSpawns: [],
            projectiles: [],
            nowMs,
            waveActive: false,
          },
        };
      }
    } else {
      still.push({ ...e, pathT: adv.t });
    }
  }
  enemies = still;

  const combat = tickCombat(
    state.towers,
    enemies,
    state.projectiles,
    state.map,
    nowMs,
  );
  enemies = combat.enemies;
  events.push(...combat.events);

  let gold = state.gold;
  for (const ev of combat.events) {
    if (ev.type === 'enemyKilled') {
      gold = reward({ gold }, ev.gold).gold;
    }
  }

  const waveDone =
    pendingSpawns.length === 0 && enemies.length === 0 && state.waveActive;

  if (waveDone) {
    events.push({ type: 'waveCleared', waveIndex: state.waveIndex });
    const isLast = state.waveIndex >= state.waves.length - 1;
    if (isLast) {
      events.push({ type: 'levelWon' });
      return {
        events,
        state: {
          ...state,
          status: 'levelVictory',
          lives,
          gold,
          towers: combat.towers,
          enemies: [],
          projectiles: combat.projectiles,
          pendingSpawns: [],
          waveActive: false,
          nowMs,
        },
      };
    }
    return {
      events,
      state: {
        ...state,
        status: 'waveBreak',
        lives,
        gold,
        towers: combat.towers,
        enemies: [],
        projectiles: combat.projectiles,
        pendingSpawns: [],
        waveActive: false,
        nowMs,
      },
    };
  }

  return {
    events,
    state: {
      ...state,
      lives,
      gold,
      towers: combat.towers,
      enemies,
      projectiles: combat.projectiles,
      pendingSpawns,
      nowMs,
    },
  };
}
