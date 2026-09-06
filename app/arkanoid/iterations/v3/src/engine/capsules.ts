import {
  CAPSULE_DROP_CHANCE,
  CAPSULE_FALL_SPEED,
  CAPSULE_HEIGHT,
  CAPSULE_WIDTH,
  LASER_COOLDOWN_MS,
  LASER_HEIGHT,
  LASER_SPEED,
  LASER_WIDTH,
  PADDLE_WIDTH,
  PADDLE_WIDTH_ENLARGED,
} from '../constants/game';
import type {
  Ball,
  Brick,
  Capsule,
  CapsuleKind,
  ExclusivePower,
  Laser,
  WorldState,
} from './types';

export const CAPSULE_KINDS: CapsuleKind[] = ['L', 'E', 'C', 'S', 'B', 'D', 'P'];

export const CAPSULE_LABEL: Record<CapsuleKind, string> = {
  L: 'Láser',
  E: 'Enlarge',
  C: 'Catch',
  S: 'Slow',
  B: 'Break',
  D: 'Disrupt',
  P: 'Player',
};

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

export function maybeSpawnCapsule(
  brick: Brick,
  chance: number = CAPSULE_DROP_CHANCE,
  roll: () => number = Math.random,
  pick: () => CapsuleKind = () =>
    CAPSULE_KINDS[Math.floor(roll() * CAPSULE_KINDS.length)] ?? 'E',
): Capsule | null {
  if (roll() > chance) return null;
  const kind = pick();
  return {
    id: nextId('cap'),
    kind,
    x: brick.x + brick.w / 2 - CAPSULE_WIDTH / 2,
    y: brick.y + brick.h,
    w: CAPSULE_WIDTH,
    h: CAPSULE_HEIGHT,
    vy: CAPSULE_FALL_SPEED,
  };
}

export function moveCapsules(capsules: Capsule[], dtSec: number, height: number): Capsule[] {
  return capsules
    .map((c) => ({ ...c, y: c.y + c.vy * dtSec }))
    .filter((c) => c.y < height + c.h);
}

function hitsPaddle(
  x: number,
  y: number,
  w: number,
  h: number,
  paddle: WorldState['paddle'],
): boolean {
  return x < paddle.x + paddle.w && x + w > paddle.x && y < paddle.y + paddle.h && y + h > paddle.y;
}

function resetExclusive(state: WorldState): WorldState {
  const cx = state.paddle.x + state.paddle.w / 2;
  const w = PADDLE_WIDTH;
  return {
    ...state,
    power: null,
    slow: false,
    extraBalls: [],
    paddle: {
      ...state.paddle,
      w,
      x: Math.max(0, Math.min(state.width - w, cx - w / 2)),
    },
  };
}

function splitBalls(ball: Ball): Ball[] {
  const speed = Math.hypot(ball.vel.x, ball.vel.y) || 220;
  const angles = [-0.42, 0.42];
  return angles.map((a, i) => {
    const vx = ball.vel.x * Math.cos(a) - ball.vel.y * Math.sin(a);
    const vy = ball.vel.x * Math.sin(a) + ball.vel.y * Math.cos(a);
    const mag = Math.hypot(vx, vy) || 1;
    return {
      id: nextId(`xb-${i}`),
      pos: { ...ball.pos },
      vel: { x: (vx / mag) * speed, y: (vy / mag) * speed },
      r: ball.r,
      launched: true,
    };
  });
}

export function applyCapsule(state: WorldState, kind: CapsuleKind): WorldState {
  if (kind === 'P') {
    return state;
  }
  if (kind === 'B') {
    return { ...state, doorOpen: true };
  }

  let next = resetExclusive(state);
  if (kind === 'L') {
    return { ...next, power: 'laser' };
  }
  if (kind === 'E') {
    const w = PADDLE_WIDTH_ENLARGED;
    const cx = next.paddle.x + next.paddle.w / 2;
    return {
      ...next,
      power: 'enlarge',
      paddle: {
        ...next.paddle,
        w,
        x: Math.max(0, Math.min(next.width - w, cx - w / 2)),
      },
    };
  }
  if (kind === 'C') {
    return { ...next, power: 'catch' };
  }
  if (kind === 'S') {
    return { ...next, power: 'slow', slow: true };
  }
  if (kind === 'D') {
    if (!next.ball.launched) return { ...next, power: 'disrupt' };
    return {
      ...next,
      power: 'disrupt',
      extraBalls: splitBalls(next.ball),
    };
  }
  return next;
}

export function collectCapsules(
  state: WorldState,
): { state: WorldState; caught: CapsuleKind[] } {
  const caught: CapsuleKind[] = [];
  const remaining: Capsule[] = [];
  let next = state;
  for (const cap of state.capsules) {
    if (hitsPaddle(cap.x, cap.y, cap.w, cap.h, next.paddle)) {
      caught.push(cap.kind);
      next = applyCapsule(next, cap.kind);
    } else {
      remaining.push(cap);
    }
  }
  return { state: { ...next, capsules: remaining }, caught };
}

export function fireLaser(state: WorldState): WorldState {
  if (state.power !== 'laser' || state.laserCooldownMs > 0) return state;
  const y = state.paddle.y - LASER_HEIGHT;
  const shots: Laser[] = [8, state.paddle.w - 8 - LASER_WIDTH].map((offset, i) => ({
    id: nextId(`lz-${i}`),
    x: state.paddle.x + offset,
    y,
    w: LASER_WIDTH,
    h: LASER_HEIGHT,
    vy: -LASER_SPEED,
  }));
  return {
    ...state,
    lasers: [...state.lasers, ...shots],
    laserCooldownMs: LASER_COOLDOWN_MS,
  };
}

export function moveLasers(lasers: Laser[], dtSec: number): Laser[] {
  return lasers
    .map((lz) => ({ ...lz, y: lz.y + lz.vy * dtSec }))
    .filter((lz) => lz.y + lz.h > 0);
}

export function powerLabel(
  power: ExclusivePower | null,
  doorOpen: boolean,
  slow = false,
): string | undefined {
  if (doorOpen) return 'B Break — sal por la derecha';
  if (power === 'laser') return 'L Láser — toca para disparar';
  if (power === 'enlarge') return slow ? 'E Enlarge · S Slow' : 'E Enlarge';
  if (power === 'catch') return 'C Catch — toca para soltar';
  if (power === 'disrupt') return 'D Disrupt';
  if (power === 'slow' || slow) return 'S Slow';
  return undefined;
}
