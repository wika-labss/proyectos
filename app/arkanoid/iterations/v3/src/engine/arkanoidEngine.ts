import {
  BALL_RADIUS,
  BALL_SPEED_BASE,
  BALL_SPEED_PER_LEVEL,
  DOOR_HEIGHT,
  DOOR_WIDTH,
  DT_CLAMP_MS,
  LAUNCH_ANGLE,
  MAX_SUBSTEP_PX,
  PADDLE_BOTTOM_GAP,
  PADDLE_HEIGHT,
  PADDLE_MAX_BOUNCE_ANGLE,
  PADDLE_WIDTH,
  SLOW_FACTOR,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants/game';
import { aliveBricks, hitBrick, loadLevel } from './brickField';
import {
  collectCapsules,
  fireLaser,
  maybeSpawnCapsule,
  moveCapsules,
  moveLasers,
} from './capsules';
import type {
  Ball,
  Brick,
  CapsuleKind,
  EngineEvent,
  Laser,
  Paddle,
  StepResult,
  WorldState,
} from './types';

export type Rng = () => number;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function ballSpeedForLevel(levelIndex: number): number {
  return BALL_SPEED_BASE + Math.max(0, levelIndex) * BALL_SPEED_PER_LEVEL;
}

function hypot(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function setSpeed(ball: Ball, speed: number): Ball {
  if (!ball.launched) return ball;
  const mag = hypot(ball.vel.x, ball.vel.y);
  if (mag < 1e-6) {
    return { ...ball, vel: { x: 0, y: -speed } };
  }
  const k = speed / mag;
  return { ...ball, vel: { x: ball.vel.x * k, y: ball.vel.y * k } };
}

function targetSpeed(state: WorldState): number {
  const base = ballSpeedForLevel(state.levelIndex);
  return state.slow ? base * SLOW_FACTOR : base;
}

export function paddleY(height: number): number {
  return height - PADDLE_BOTTOM_GAP - PADDLE_HEIGHT;
}

export function doorRect(width: number, height: number): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  return {
    x: width - DOOR_WIDTH,
    y: height - PADDLE_BOTTOM_GAP - DOOR_HEIGHT,
    w: DOOR_WIDTH,
    h: DOOR_HEIGHT,
  };
}

function restBallOnPaddle(paddle: Paddle, r: number): { x: number; y: number } {
  return {
    x: paddle.x + paddle.w / 2,
    y: paddle.y - r - 0.5,
  };
}

function makeBall(paddle: Paddle, id = 'ball-0'): Ball {
  return {
    id,
    pos: restBallOnPaddle(paddle, BALL_RADIUS),
    vel: { x: 0, y: 0 },
    r: BALL_RADIUS,
    launched: false,
  };
}

function idleWorldFields() {
  return {
    extraBalls: [] as Ball[],
    capsules: [] as WorldState['capsules'],
    lasers: [] as Laser[],
    power: null,
    slow: false,
    doorOpen: false,
    doorExit: false,
    laserCooldownMs: 0,
  };
}

export function createWorld(
  width: number = WORLD_WIDTH,
  height: number = WORLD_HEIGHT,
  levelIndex: number = 0,
  bricks?: Brick[],
): WorldState {
  const paddle: Paddle = {
    x: (width - PADDLE_WIDTH) / 2,
    y: paddleY(height),
    w: PADDLE_WIDTH,
    h: PADDLE_HEIGHT,
  };
  return {
    width,
    height,
    paddle,
    ball: makeBall(paddle),
    bricks: bricks ?? loadLevel(levelIndex, width),
    levelIndex,
    ...idleWorldFields(),
  };
}

function maxPaddleX(state: WorldState): number {
  if (!state.doorOpen) return state.width - state.paddle.w;
  return state.width - state.paddle.w + DOOR_WIDTH + 2;
}

function paddleEnteredDoor(state: WorldState): boolean {
  if (!state.doorOpen) return false;
  return state.paddle.x + state.paddle.w >= state.width;
}

export function setPaddleX(state: WorldState, x: number): WorldState {
  const nextX = clamp(x, 0, maxPaddleX(state));
  const paddle = { ...state.paddle, x: nextX };
  const parked = !state.ball.launched
    ? { ...state.ball, pos: restBallOnPaddle(paddle, state.ball.r) }
    : state.ball;
  const next = {
    ...state,
    paddle,
    ball: parked,
    doorExit: state.doorExit || paddleEnteredDoor({ ...state, paddle }),
  };
  return next;
}

export function launchBall(state: WorldState): WorldState {
  if (state.ball.launched) return state;
  const speed = targetSpeed(state);
  const vx = speed * LAUNCH_ANGLE;
  const vy = -Math.sqrt(Math.max(0, speed * speed - vx * vx));
  return {
    ...state,
    ball: {
      ...state.ball,
      launched: true,
      vel: { x: vx, y: vy },
      pos: restBallOnPaddle(state.paddle, state.ball.r),
    },
  };
}

export function resetBall(state: WorldState): WorldState {
  const paddle = {
    ...state.paddle,
    w: PADDLE_WIDTH,
    x: clamp(
      state.paddle.x + (state.paddle.w - PADDLE_WIDTH) / 2,
      0,
      state.width - PADDLE_WIDTH,
    ),
  };
  return {
    ...state,
    paddle,
    ball: makeBall(paddle, state.ball.id),
    ...idleWorldFields(),
  };
}

export function fireLasers(state: WorldState): WorldState {
  return fireLaser(state);
}

function circleHitsAabb(
  cx: number,
  cy: number,
  r: number,
  x: number,
  y: number,
  w: number,
  h: number,
): boolean {
  const closestX = clamp(cx, x, x + w);
  const closestY = clamp(cy, y, y + h);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

type Rect = { x: number; y: number; w: number; h: number };

function bounceOffAabb(ball: Ball, box: Rect): Ball {
  const left = box.x;
  const right = box.x + box.w;
  const top = box.y;
  const bottom = box.y + box.h;
  const insideX = ball.pos.x >= left && ball.pos.x <= right;
  const insideY = ball.pos.y >= top && ball.pos.y <= bottom;

  if (insideX && insideY) {
    const ol = ball.pos.x - left;
    const or = right - ball.pos.x;
    const ot = ball.pos.y - top;
    const ob = bottom - ball.pos.y;
    const min = Math.min(ol, or, ot, ob);
    if (min === ol) {
      return {
        ...ball,
        pos: { ...ball.pos, x: left - ball.r },
        vel: { ...ball.vel, x: -Math.abs(ball.vel.x) },
      };
    }
    if (min === or) {
      return {
        ...ball,
        pos: { ...ball.pos, x: right + ball.r },
        vel: { ...ball.vel, x: Math.abs(ball.vel.x) },
      };
    }
    if (min === ot) {
      return {
        ...ball,
        pos: { ...ball.pos, y: top - ball.r },
        vel: { ...ball.vel, y: -Math.abs(ball.vel.y) },
      };
    }
    return {
      ...ball,
      pos: { ...ball.pos, y: bottom + ball.r },
      vel: { ...ball.vel, y: Math.abs(ball.vel.y) },
    };
  }

  const closestX = clamp(ball.pos.x, left, right);
  const closestY = clamp(ball.pos.y, top, bottom);
  const dx = ball.pos.x - closestX;
  const dy = ball.pos.y - closestY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) {
      return {
        ...ball,
        pos: { ...ball.pos, x: left - ball.r },
        vel: { ...ball.vel, x: -Math.abs(ball.vel.x) },
      };
    }
    return {
      ...ball,
      pos: { ...ball.pos, x: right + ball.r },
      vel: { ...ball.vel, x: Math.abs(ball.vel.x) },
    };
  }

  if (dy < 0) {
    return {
      ...ball,
      pos: { ...ball.pos, y: top - ball.r },
      vel: { ...ball.vel, y: -Math.abs(ball.vel.y) },
    };
  }
  return {
    ...ball,
    pos: { ...ball.pos, y: bottom + ball.r },
    vel: { ...ball.vel, y: Math.abs(ball.vel.y) },
  };
}

function bouncePaddle(ball: Ball, paddle: Paddle, speed: number): Ball {
  const center = paddle.x + paddle.w / 2;
  const half = paddle.w / 2;
  const t = clamp((ball.pos.x - center) / half, -1, 1);
  const angle = t * PADDLE_MAX_BOUNCE_ANGLE;
  return {
    ...ball,
    pos: { ...ball.pos, y: paddle.y - ball.r - 0.5 },
    vel: {
      x: speed * Math.sin(angle),
      y: -speed * Math.cos(angle),
    },
  };
}

function catchBall(ball: Ball, paddle: Paddle): Ball {
  return {
    ...ball,
    launched: false,
    vel: { x: 0, y: 0 },
    pos: {
      x: clamp(ball.pos.x, paddle.x + ball.r, paddle.x + paddle.w - ball.r),
      y: paddle.y - ball.r - 0.5,
    },
  };
}

function ballInDoor(ball: Ball, width: number, height: number): boolean {
  const door = doorRect(width, height);
  return (
    ball.pos.x + ball.r >= door.x &&
    ball.pos.y >= door.y &&
    ball.pos.y <= door.y + door.h
  );
}

function collideWalls(
  ball: Ball,
  state: WorldState,
  events: EngineEvent[],
): { ball: Ball; exited: boolean } {
  let { pos, vel } = ball;
  let bounced = false;

  if (pos.x - ball.r <= 0) {
    pos = { ...pos, x: ball.r };
    vel = { ...vel, x: Math.abs(vel.x) };
    bounced = true;
  } else if (pos.x + ball.r >= state.width) {
    if (state.doorOpen && ballInDoor({ ...ball, pos }, state.width, state.height)) {
      return { ball: { ...ball, pos, vel }, exited: true };
    }
    pos = { ...pos, x: state.width - ball.r };
    vel = { ...vel, x: -Math.abs(vel.x) };
    bounced = true;
  }

  if (pos.y - ball.r <= 0) {
    pos = { ...pos, y: ball.r };
    vel = { ...vel, y: Math.abs(vel.y) };
    bounced = true;
  }

  if (bounced) events.push({ type: 'wallBounce' });
  return { ball: { ...ball, pos, vel }, exited: false };
}

function applyBrickHit(
  state: WorldState,
  brick: Brick,
  ball: Ball,
  events: EngineEvent[],
  rng: Rng,
): { state: WorldState; ball: Ball } {
  const bounced = bounceOffAabb(ball, brick);
  const hit = hitBrick(state.bricks, brick.id);
  let capsules = state.capsules;
  if (hit.destroyed && hit.type) {
    events.push({
      type: 'brickDestroyed',
      brickId: brick.id,
      brickType: hit.type,
    });
    const capsule = maybeSpawnCapsule(brick, undefined, rng);
    if (capsule) {
      events.push({ type: 'capsuleSpawned', kind: capsule.kind });
      capsules = [...capsules, capsule];
    }
  } else {
    events.push({
      type: 'brickHit',
      brickId: brick.id,
      hitsLeft: hit.hitsLeft,
    });
  }
  if (hit.cleared) events.push({ type: 'cleared' });
  return { state: { ...state, bricks: hit.bricks, capsules }, ball: bounced };
}

function damageBrick(
  state: WorldState,
  brick: Brick,
  events: EngineEvent[],
  rng: Rng,
): WorldState {
  const hit = hitBrick(state.bricks, brick.id);
  let capsules = state.capsules;
  if (hit.destroyed && hit.type) {
    events.push({
      type: 'brickDestroyed',
      brickId: brick.id,
      brickType: hit.type,
    });
    const capsule = maybeSpawnCapsule(brick, undefined, rng);
    if (capsule) {
      events.push({ type: 'capsuleSpawned', kind: capsule.kind });
      capsules = [...capsules, capsule];
    }
  } else {
    events.push({
      type: 'brickHit',
      brickId: brick.id,
      hitsLeft: hit.hitsLeft,
    });
  }
  if (hit.cleared) events.push({ type: 'cleared' });
  return { ...state, bricks: hit.bricks, capsules };
}

function stepBall(
  state: WorldState,
  ball: Ball,
  dtSec: number,
  events: EngineEvent[],
  rng: Rng,
): { state: WorldState; ball: Ball | null; exited: boolean } {
  const speed = hypot(ball.vel.x, ball.vel.y);
  let nextBall: Ball = {
    ...ball,
    pos: {
      x: ball.pos.x + ball.vel.x * dtSec,
      y: ball.pos.y + ball.vel.y * dtSec,
    },
  };

  const walls = collideWalls(nextBall, state, events);
  nextBall = walls.ball;
  if (walls.exited) {
    return { state, ball: nextBall, exited: true };
  }

  if (nextBall.pos.y - nextBall.r >= state.height) {
    return { state, ball: null, exited: false };
  }

  const paddle = state.paddle;
  const hitsPaddle = circleHitsAabb(
    nextBall.pos.x,
    nextBall.pos.y,
    nextBall.r,
    paddle.x,
    paddle.y,
    paddle.w,
    paddle.h,
  );
  if (hitsPaddle && nextBall.vel.y > 0) {
    if (state.power === 'catch') {
      nextBall = catchBall(nextBall, paddle);
      events.push({ type: 'paddleBounce' });
    } else {
      nextBall = bouncePaddle(nextBall, paddle, Math.max(speed, targetSpeed(state)));
      events.push({ type: 'paddleBounce' });
    }
  }

  const live = aliveBricks(state.bricks);
  for (const brick of live) {
    if (
      circleHitsAabb(
        nextBall.pos.x,
        nextBall.pos.y,
        nextBall.r,
        brick.x,
        brick.y,
        brick.w,
        brick.h,
      )
    ) {
      const hit = applyBrickHit(state, brick, nextBall, events, rng);
      return { state: hit.state, ball: hit.ball, exited: false };
    }
  }

  return { state, ball: nextBall, exited: false };
}

function laserHitsBrick(lz: Laser, brick: Brick): boolean {
  return (
    lz.x < brick.x + brick.w &&
    lz.x + lz.w > brick.x &&
    lz.y < brick.y + brick.h &&
    lz.y + lz.h > brick.y
  );
}

function stepLasers(
  state: WorldState,
  dtSec: number,
  events: EngineEvent[],
  rng: Rng,
): WorldState {
  const moving = moveLasers(state.lasers, dtSec);
  const leftover: Laser[] = [];
  let next = { ...state, lasers: moving };
  for (const lz of moving) {
    const brick = aliveBricks(next.bricks).find((b) => laserHitsBrick(lz, b));
    if (brick) {
      next = damageBrick(next, brick, events, rng);
    } else {
      leftover.push(lz);
    }
  }
  return { ...next, lasers: leftover };
}

function emitCaught(events: EngineEvent[], kinds: CapsuleKind[]): void {
  for (const kind of kinds) {
    events.push({ type: 'capsuleCaught', kind });
    if (kind === 'P') events.push({ type: 'extraLife' });
  }
}

export function step(state: WorldState, dtMs: number, rng: Rng = Math.random): StepResult {
  const events: EngineEvent[] = [];
  const dtMsClamped = Math.min(Math.max(dtMs, 0), DT_CLAMP_MS);
  const dt = dtMsClamped / 1000;

  let current: WorldState = {
    ...state,
    laserCooldownMs: Math.max(0, state.laserCooldownMs - dtMsClamped),
    capsules: moveCapsules(state.capsules, dt, state.height),
  };

  if (dt > 0) {
    current = stepLasers(current, dt, events, rng);
  }

  const collected = collectCapsules(current);
  current = collected.state;
  emitCaught(events, collected.caught);

  if (current.doorExit || paddleEnteredDoor(current)) {
    current = { ...current, doorExit: true };
    events.push({ type: 'breakExit' });
    return { state: current, events };
  }

  if (events.some((e) => e.type === 'cleared')) {
    return { state: current, events };
  }

  const parkedPrimary = !current.ball.launched
    ? {
        ...current.ball,
        pos: restBallOnPaddle(current.paddle, current.ball.r),
      }
    : current.ball;

  const allBalls: Ball[] = [
    parkedPrimary,
    ...current.extraBalls.filter((b) => b.launched),
  ];
  const launched = allBalls.filter((b) => b.launched);

  if (launched.length === 0) {
    return { state: { ...current, ball: parkedPrimary, extraBalls: [] }, events };
  }

  const speed = Math.max(
    ...launched.map((b) => hypot(b.vel.x, b.vel.y)),
    1,
  );
  const slices = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP_PX));
  const sliceDt = dt / slices;
  let living = allBalls;

  for (let i = 0; i < slices; i += 1) {
    const nextLiving: Ball[] = [];
    for (const ball of living) {
      if (!ball.launched) {
        nextLiving.push({
          ...ball,
          pos: restBallOnPaddle(current.paddle, ball.r),
        });
        continue;
      }
      const before = events.length;
      const result = stepBall(current, ball, sliceDt, events, rng);
      current = result.state;
      if (result.exited) {
        current = { ...current, doorExit: true };
        events.push({ type: 'breakExit' });
        return { state: current, events };
      }
      if (result.ball) nextLiving.push(result.ball);
      const added = events.slice(before);
      if (added.some((e) => e.type === 'cleared')) {
        living = nextLiving;
        break;
      }
    }
    living = nextLiving;
    if (events.some((e) => e.type === 'cleared' || e.type === 'breakExit')) break;
  }

  if (living.length === 0) {
    events.push({ type: 'ballLost' });
    return { state: { ...current, ball: parkedPrimary, extraBalls: [] }, events };
  }

  const speedTarget = targetSpeed(current);
  living = living.map((b) => setSpeed(b, speedTarget));
  current = {
    ...current,
    ball: living[0]!,
    extraBalls: living.slice(1),
  };

  return { state: current, events };
}

export { fireLaser };
