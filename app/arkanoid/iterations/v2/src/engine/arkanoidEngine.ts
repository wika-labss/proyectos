import {
  BALL_RADIUS,
  BALL_SPEED_BASE,
  BALL_SPEED_PER_LEVEL,
  BOSS_LEVEL_INDEX,
  DT_CLAMP_MS,
  LAUNCH_ANGLE,
  MAX_SUBSTEP_PX,
  PADDLE_BOTTOM_GAP,
  PADDLE_HEIGHT,
  PADDLE_MAX_BOUNCE_ANGLE,
  PADDLE_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants/game';
import { aliveBricks, isLevelCleared, hitBrick, loadLevel } from './brickField';
import { createBoss, hitBoss, isBossAlive, moveBoss } from './boss';
import type {
  Ball,
  Brick,
  EngineEvent,
  Paddle,
  StepResult,
  WorldState,
} from './types';

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
  const mag = hypot(ball.vel.x, ball.vel.y);
  if (mag < 1e-6) {
    return { ...ball, vel: { x: 0, y: -speed } };
  }
  const k = speed / mag;
  return { ...ball, vel: { x: ball.vel.x * k, y: ball.vel.y * k } };
}

export function paddleY(height: number): number {
  return height - PADDLE_BOTTOM_GAP - PADDLE_HEIGHT;
}

function restBallOnPaddle(paddle: Paddle, r: number): { x: number; y: number } {
  return {
    x: paddle.x + paddle.w / 2,
    y: paddle.y - r - 0.5,
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
  const pos = restBallOnPaddle(paddle, BALL_RADIUS);
  return {
    width,
    height,
    paddle,
    ball: {
      pos,
      vel: { x: 0, y: 0 },
      r: BALL_RADIUS,
      launched: false,
    },
    bricks: bricks ?? loadLevel(levelIndex, width),
    boss: levelIndex === BOSS_LEVEL_INDEX ? createBoss(width) : null,
    levelIndex,
  };
}

export function setPaddleX(state: WorldState, x: number): WorldState {
  const nextX = clamp(x, 0, state.width - state.paddle.w);
  const paddle = { ...state.paddle, x: nextX };
  if (state.ball.launched) {
    return { ...state, paddle };
  }
  return {
    ...state,
    paddle,
    ball: { ...state.ball, pos: restBallOnPaddle(paddle, state.ball.r) },
  };
}

export function launchBall(state: WorldState): WorldState {
  if (state.ball.launched) return state;
  const speed = ballSpeedForLevel(state.levelIndex);
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
  return {
    ...state,
    ball: {
      ...state.ball,
      launched: false,
      vel: { x: 0, y: 0 },
      pos: restBallOnPaddle(state.paddle, state.ball.r),
    },
  };
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

function collideWalls(state: WorldState, events: EngineEvent[]): WorldState {
  const { ball, width } = state;
  let { pos, vel } = ball;
  let bounced = false;

  if (pos.x - ball.r <= 0) {
    pos = { ...pos, x: ball.r };
    vel = { ...vel, x: Math.abs(vel.x) };
    bounced = true;
  } else if (pos.x + ball.r >= width) {
    pos = { ...pos, x: width - ball.r };
    vel = { ...vel, x: -Math.abs(vel.x) };
    bounced = true;
  }

  if (pos.y - ball.r <= 0) {
    pos = { ...pos, y: ball.r };
    vel = { ...vel, y: Math.abs(vel.y) };
    bounced = true;
  }

  if (bounced) events.push({ type: 'wallBounce' });
  return { ...state, ball: { ...ball, pos, vel } };
}

function applyBrickHit(
  state: WorldState,
  brick: Brick,
  events: EngineEvent[],
): WorldState {
  const bounced = bounceOffAabb(state.ball, brick);
  const hit = hitBrick(state.bricks, brick.id);
  if (hit.destroyed && hit.type) {
    events.push({
      type: 'brickDestroyed',
      brickId: brick.id,
      brickType: hit.type,
    });
  } else {
    events.push({
      type: 'brickHit',
      brickId: brick.id,
      hitsLeft: hit.hitsLeft,
    });
  }
  const next = { ...state, ball: bounced, bricks: hit.bricks };
  if (isLevelCleared(hit.bricks, next.boss, next.levelIndex)) {
    events.push({ type: 'cleared' });
  }
  return next;
}

function applyBossHit(state: WorldState, events: EngineEvent[]): WorldState {
  if (!state.boss || !isBossAlive(state.boss)) return state;
  const bounced = bounceOffAabb(state.ball, state.boss);
  const { boss, defeated } = hitBoss(state.boss);
  events.push({ type: 'bossHit', hitsLeft: boss.hitsLeft });
  const next: WorldState = { ...state, ball: bounced, boss };
  if (defeated) {
    events.push({ type: 'bossDefeated' });
    if (isLevelCleared(next.bricks, next.boss, next.levelIndex)) {
      events.push({ type: 'cleared' });
    }
  }
  return next;
}

function substep(state: WorldState, dtSec: number, events: EngineEvent[]): WorldState {
  const speed = hypot(state.ball.vel.x, state.ball.vel.y);
  let next: WorldState = {
    ...state,
    boss: state.boss ? moveBoss(state.boss, dtSec, state.width) : state.boss,
    ball: {
      ...state.ball,
      pos: {
        x: state.ball.pos.x + state.ball.vel.x * dtSec,
        y: state.ball.pos.y + state.ball.vel.y * dtSec,
      },
    },
  };

  next = collideWalls(next, events);

  if (next.ball.pos.y - next.ball.r >= next.height) {
    events.push({ type: 'ballLost' });
    return next;
  }

  const paddle = next.paddle;
  const hitsPaddle = circleHitsAabb(
    next.ball.pos.x,
    next.ball.pos.y,
    next.ball.r,
    paddle.x,
    paddle.y,
    paddle.w,
    paddle.h,
  );
  if (hitsPaddle && next.ball.vel.y > 0) {
    next = {
      ...next,
      ball: bouncePaddle(next.ball, paddle, Math.max(speed, ballSpeedForLevel(next.levelIndex))),
    };
    events.push({ type: 'paddleBounce' });
  }

  if (
    isBossAlive(next.boss) &&
    next.boss &&
    circleHitsAabb(
      next.ball.pos.x,
      next.ball.pos.y,
      next.ball.r,
      next.boss.x,
      next.boss.y,
      next.boss.w,
      next.boss.h,
    )
  ) {
    next = applyBossHit(next, events);
    return next;
  }

  const live = aliveBricks(next.bricks);
  for (const brick of live) {
    if (
      circleHitsAabb(
        next.ball.pos.x,
        next.ball.pos.y,
        next.ball.r,
        brick.x,
        brick.y,
        brick.w,
        brick.h,
      )
    ) {
      next = applyBrickHit(next, brick, events);
      break;
    }
  }

  return next;
}

export function step(state: WorldState, dtMs: number): StepResult {
  const events: EngineEvent[] = [];
  const dt = Math.min(Math.max(dtMs, 0), DT_CLAMP_MS) / 1000;

  if (!state.ball.launched) {
    const boss = state.boss && dt > 0 ? moveBoss(state.boss, dt, state.width) : state.boss;
    return {
      state: {
        ...state,
        boss,
        ball: {
          ...state.ball,
          pos: restBallOnPaddle(state.paddle, state.ball.r),
        },
      },
      events,
    };
  }

  if (dt <= 0) return { state, events };

  const speed = Math.max(hypot(state.ball.vel.x, state.ball.vel.y), 1);
  const slices = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP_PX));
  const sliceDt = dt / slices;
  let current = state;

  for (let i = 0; i < slices; i += 1) {
    const before = events.length;
    current = substep(current, sliceDt, events);
    const added = events.slice(before);
    if (added.some((e) => e.type === 'ballLost' || e.type === 'cleared')) {
      break;
    }
  }

  current = {
    ...current,
    ball: setSpeed(current.ball, ballSpeedForLevel(current.levelIndex)),
  };

  return { state: current, events };
}
