import { positionAt } from './pathSystem';
import { getTowerCombatStats } from './towerTypes';
import type {
  Enemy,
  MapDefinition,
  PlacedTower,
  Projectile,
  TdEvent,
  TowerKind,
  Vec2,
} from './types';

function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function selectTarget(
  tower: PlacedTower,
  enemies: Enemy[],
  map: MapDefinition,
): Enemy | null {
  const def = getTowerCombatStats(tower.kind, tower.tier);
  let best: Enemy | null = null;
  let bestT = -1;
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    const pos = positionAt(map.path, e.pathT);
    if (dist(tower.pos, pos) <= def.range && e.pathT > bestT) {
      best = e;
      bestT = e.pathT;
    }
  }
  return best;
}

export type CombatResult = {
  enemies: Enemy[];
  projectiles: Projectile[];
  towers: PlacedTower[];
  events: TdEvent[];
};

function applyDamage(
  enemies: Enemy[],
  targetId: string,
  damage: number,
  splashCenter: Vec2 | null,
  splashRadius: number | undefined,
  map: MapDefinition,
  kind: TowerKind,
  nowMs: number,
  slowFactor?: number,
  slowDurationMs?: number,
): { enemies: Enemy[]; events: TdEvent[]; killedIds: string[] } {
  const events: TdEvent[] = [];
  const killedIds: string[] = [];
  const next = enemies.map((e) => {
    if (e.hp <= 0) return e;
    const pos = positionAt(map.path, e.pathT);
    let hit = e.id === targetId;
    if (!hit && splashCenter && splashRadius) {
      hit = dist(splashCenter, pos) <= splashRadius;
    }
    if (!hit) return e;

    let hp = e.hp - damage;
    let slowUntil = e.slowUntil;
    let sf = e.slowFactor;
    if (kind === 'frost') {
      sf = slowFactor ?? 0.45;
      slowUntil = nowMs + (slowDurationMs ?? 1400);
    }
    if (hp <= 0) {
      killedIds.push(e.id);
      events.push({ type: 'enemyKilled', kind: e.kind, gold: e.rewardGold });
      hp = 0;
    }
    return { ...e, hp, slowUntil, slowFactor: sf };
  });
  return { enemies: next.filter((e) => e.hp > 0), events, killedIds };
}

export function tickCombat(
  towers: PlacedTower[],
  enemies: Enemy[],
  projectiles: Projectile[],
  map: MapDefinition,
  nowMs: number,
): CombatResult {
  let nextEnemies = enemies;
  let nextTowers = towers;
  let nextProjectiles = projectiles.filter((p) => nowMs - p.bornAt < p.ttlMs);
  const events: TdEvent[] = [];

  nextTowers = nextTowers.map((tower) => {
    if (nowMs < tower.cooldownUntil) return tower;
    const target = selectTarget(tower, nextEnemies, map);
    if (!target) return tower;
    const def = getTowerCombatStats(tower.kind, tower.tier);
    const targetPos = positionAt(map.path, target.pathT);
    nextProjectiles = [
      ...nextProjectiles,
      {
        id: `proj-${tower.id}-${nowMs}`,
        from: { ...tower.pos },
        to: targetPos,
        kind: tower.kind,
        bornAt: nowMs,
        ttlMs: 180,
      },
    ];
    const applied = applyDamage(
      nextEnemies,
      target.id,
      def.damage,
      tower.kind === 'cannon' ? targetPos : null,
      def.splashRadius,
      map,
      tower.kind,
      nowMs,
      def.slowFactor,
      def.slowDurationMs,
    );
    nextEnemies = applied.enemies;
    events.push(...applied.events);
    return { ...tower, cooldownUntil: nowMs + def.fireCooldownMs };
  });

  return {
    enemies: nextEnemies,
    projectiles: nextProjectiles,
    towers: nextTowers,
    events,
  };
}
