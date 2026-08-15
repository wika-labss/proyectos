import {
  BALL_RADIUS,
  BALL_SPEED,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_Y,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants/game';
import { Brick, hitBrick } from './brickField';

export type Vec2 = { x: number; y: number };

export type Paddle = { x: number; y: number; w: number; h: number };

export type Ball = {
  pos: Vec2;
  vel: Vec2;
  r: number;
  launched: boolean;
};

export type WorldState = {
  width: number;
  height: number;
  paddle: Paddle;
  ball: Ball;
  bricks: Brick[];
};

export type StepEvent =
  | 'moved'
  | 'wallBounce'
  | 'paddleBounce'
  | 'brickHit'
  | 'brickDestroyed'
  | 'ballLost'
  | 'levelCleared';

export type StepResult = {
  state: WorldState;
  events: StepEvent[];
  destroyedBrick: Brick | null;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function normalizeSpeed(vel: Vec2, speed: number): Vec2 {
  const mag = Math.hypot(vel.x, vel.y) || 1;
  return { x: (vel.x / mag) * speed, y: (vel.y / mag) * speed };
}

export function createWorld(bricks: Brick[]): WorldState {
  const paddleX = (WORLD_WIDTH - PADDLE_WIDTH) / 2;
  const ballPos = {
    x: WORLD_WIDTH / 2,
    y: PADDLE_Y - BALL_RADIUS - 2,
  };
  return {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    paddle: {
      x: paddleX,
      y: PADDLE_Y,
      w: PADDLE_WIDTH,
      h: PADDLE_HEIGHT,
    },
    ball: {
      pos: ballPos,
      vel: { x: 0, y: 0 },
      r: BALL_RADIUS,
      launched: false,
    },
    bricks,
  };
}

export function setPaddleX(state: WorldState, centerX: number): WorldState {
  const x = clamp(centerX - state.paddle.w / 2, 0, state.width - state.paddle.w);
  const paddle = { ...state.paddle, x };
  let ball = state.ball;
  if (!ball.launched) {
    ball = {
      ...ball,
      pos: {
        x: x + paddle.w / 2,
        y: paddle.y - ball.r - 2,
      },
    };
  }
  return { ...state, paddle, ball };
}

export function launchBall(state: WorldState): WorldState {
  if (state.ball.launched) return state;
  const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
  const vel = normalizeSpeed(
    { x: Math.cos(angle) * BALL_SPEED, y: Math.sin(angle) * BALL_SPEED },
    BALL_SPEED
  );
  // Prefer upward launch
  if (vel.y > 0) vel.y = -Math.abs(vel.y);
  return {
    ...state,
    ball: { ...state.ball, vel, launched: true },
  };
}

function circleRectOverlap(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  const nearestX = clamp(cx, rx, rx + rw);
  const nearestY = clamp(cy, ry, ry + rh);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy <= r * r;
}

function bounceOffPaddle(ball: Ball, paddle: Paddle): Ball {
  const hit = (ball.pos.x - paddle.x) / paddle.w; // 0..1
  const t = clamp(hit, 0, 1);
  // Classic: left edge → more left, center → up, right → more right
  const angle = -Math.PI / 2 + (t - 0.5) * (Math.PI * 0.7);
  const vel = {
    x: Math.cos(angle) * BALL_SPEED,
    y: Math.sin(angle) * BALL_SPEED,
  };
  if (vel.y > 0) vel.y = -Math.abs(vel.y);
  return {
    ...ball,
    pos: { ...ball.pos, y: paddle.y - ball.r - 0.5 },
    vel: normalizeSpeed(vel, BALL_SPEED),
  };
}

export function step(state: WorldState, dtMs: number): StepResult {
  const events: StepEvent[] = [];
  let destroyedBrick: Brick | null = null;

  if (!state.ball.launched) {
    return { state, events: ['moved'], destroyedBrick };
  }

  const dt = Math.min(dtMs, 32) / 1000;
  let ball = {
    ...state.ball,
    pos: {
      x: state.ball.pos.x + state.ball.vel.x * dt,
      y: state.ball.pos.y + state.ball.vel.y * dt,
    },
    vel: { ...state.ball.vel },
  };
  let bricks = state.bricks;

  // Walls L/R
  if (ball.pos.x - ball.r <= 0) {
    ball.pos.x = ball.r;
    ball.vel.x = Math.abs(ball.vel.x);
    events.push('wallBounce');
  } else if (ball.pos.x + ball.r >= state.width) {
    ball.pos.x = state.width - ball.r;
    ball.vel.x = -Math.abs(ball.vel.x);
    events.push('wallBounce');
  }

  // Ceiling
  if (ball.pos.y - ball.r <= 0) {
    ball.pos.y = ball.r;
    ball.vel.y = Math.abs(ball.vel.y);
    events.push('wallBounce');
  }

  // Bottom = ball lost
  if (ball.pos.y - ball.r > state.height) {
    events.push('ballLost');
    return {
      state: { ...state, ball: { ...ball, launched: false, vel: { x: 0, y: 0 } } },
      events,
      destroyedBrick,
    };
  }

  // Paddle
  const p = state.paddle;
  if (
    ball.vel.y > 0 &&
    circleRectOverlap(ball.pos.x, ball.pos.y, ball.r, p.x, p.y, p.w, p.h)
  ) {
    ball = bounceOffPaddle(ball, p);
    events.push('paddleBounce');
  }

  // Bricks — check one collision per frame
  for (const brick of bricks) {
    if (
      !circleRectOverlap(
        ball.pos.x,
        ball.pos.y,
        ball.r,
        brick.x,
        brick.y,
        brick.w,
        brick.h
      )
    ) {
      continue;
    }

    // Resolve bounce by penetration axis
    const nearestX = clamp(ball.pos.x, brick.x, brick.x + brick.w);
    const nearestY = clamp(ball.pos.y, brick.y, brick.y + brick.h);
    const dx = ball.pos.x - nearestX;
    const dy = ball.pos.y - nearestY;

    if (Math.abs(dx) > Math.abs(dy)) {
      ball.vel.x = dx > 0 ? Math.abs(ball.vel.x) : -Math.abs(ball.vel.x);
      ball.pos.x = dx > 0 ? brick.x + brick.w + ball.r : brick.x - ball.r;
    } else {
      ball.vel.y = dy > 0 ? Math.abs(ball.vel.y) : -Math.abs(ball.vel.y);
      ball.pos.y = dy > 0 ? brick.y + brick.h + ball.r : brick.y - ball.r;
    }

    const hit = hitBrick(bricks, brick.id);
    bricks = hit.bricks;
    if (hit.destroyed) {
      destroyedBrick = hit.destroyed;
      events.push('brickDestroyed');
      if (hit.cleared) events.push('levelCleared');
    } else {
      events.push('brickHit');
    }
    break;
  }

  ball.vel = normalizeSpeed(ball.vel, BALL_SPEED);
  if (events.length === 0) events.push('moved');

  return {
    state: { ...state, ball, bricks },
    events,
    destroyedBrick,
  };
}

/** Reset paddle + ball on life lost; keep bricks. */
export function resetBallOnPaddle(state: WorldState): WorldState {
  const paddleX = (state.width - state.paddle.w) / 2;
  const paddle = { ...state.paddle, x: paddleX };
  return {
    ...state,
    paddle,
    ball: {
      pos: {
        x: paddleX + paddle.w / 2,
        y: paddle.y - BALL_RADIUS - 2,
      },
      vel: { x: 0, y: 0 },
      r: BALL_RADIUS,
      launched: false,
    },
  };
}
