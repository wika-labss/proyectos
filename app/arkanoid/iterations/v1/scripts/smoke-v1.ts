/**
 * Smoke V1 — pure engine gates (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
  BALL_RADIUS,
  INITIAL_LIVES,
  LEVEL_COUNT,
  SCORE_HARD,
  SCORE_NORMAL,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../src/constants/game';
import {
  createWorld,
  launchBall,
  setPaddleX,
  step,
} from '../src/engine/arkanoidEngine';
import { hitBrick, isCleared, loadLevel } from '../src/engine/brickField';
import { createLives, onBallLost } from '../src/engine/livesSystem';
import { considerHighScore, onBrickDestroyed } from '../src/engine/arkanoidScore';
import { onLevelCleared } from '../src/engine/levelProgress';

function emptyWorld() {
  const world = createWorld();
  return { ...world, bricks: [] };
}

function testWallBounce() {
  const base = emptyWorld();
  const world = {
    ...base,
    ball: {
      ...base.ball,
      pos: { x: BALL_RADIUS + 1, y: 300 },
      vel: { x: -280, y: 40 },
      launched: true,
    },
  };
  const result = step(world, 16);
  assert.ok(result.state.ball.vel.x > 0, 'left wall should flip vx');
  assert.ok(result.events.some((e) => e.type === 'wallBounce'));
}

function testCeilingBounce() {
  const base = emptyWorld();
  const world = {
    ...base,
    ball: {
      ...base.ball,
      pos: { x: 180, y: BALL_RADIUS + 1 },
      vel: { x: 20, y: -280 },
      launched: true,
    },
  };
  const result = step(world, 16);
  assert.ok(result.state.ball.vel.y > 0, 'ceiling should flip vy downward');
}

function testPaddleBounceZones() {
  const world = emptyWorld();
  const paddle = world.paddle;

  const hitLeft = step(
    {
      ...world,
      ball: {
        ...world.ball,
        launched: true,
        pos: { x: paddle.x + 8, y: paddle.y - BALL_RADIUS - 1 },
        vel: { x: 10, y: 280 },
      },
    },
    16,
  );
  assert.ok(hitLeft.events.some((e) => e.type === 'paddleBounce'));
  assert.ok(hitLeft.state.ball.vel.y < 0, 'paddle bounce goes up');
  assert.ok(hitLeft.state.ball.vel.x < 0, 'left edge sends ball left');

  const hitRight = step(
    {
      ...world,
      ball: {
        ...world.ball,
        launched: true,
        pos: { x: paddle.x + paddle.w - 8, y: paddle.y - BALL_RADIUS - 1 },
        vel: { x: -10, y: 280 },
      },
    },
    16,
  );
  assert.ok(hitRight.state.ball.vel.x > 0, 'right edge sends ball right');
}

function testBrickDestroy() {
  const bricks = loadLevel(0);
  const first = bricks[0]!;
  const hit = hitBrick(bricks, first.id);
  assert.equal(hit.destroyed, true);
  assert.equal(hit.type, 'normal');
  assert.equal(hit.cleared, false);
  assert.equal(hit.bricks.find((b) => b.id === first.id)?.hitsLeft, 0);
}

function testHardBrickTwoHits() {
  const bricks = loadLevel(1);
  const hard = bricks.find((b) => b.type === 'hard');
  assert.ok(hard);
  const first = hitBrick(bricks, hard.id);
  assert.equal(first.destroyed, false);
  assert.equal(first.hitsLeft, 1);
  const second = hitBrick(first.bricks, hard.id);
  assert.equal(second.destroyed, true);
  assert.equal(second.type, 'hard');
}

function testEngineBrickCollision() {
  let world = createWorld(WORLD_WIDTH, WORLD_HEIGHT, 0);
  const brick = world.bricks[0]!;
  world = {
    ...world,
    bricks: [brick],
    ball: {
      ...world.ball,
      launched: true,
      pos: { x: brick.x + brick.w / 2, y: brick.y + brick.h + BALL_RADIUS + 1 },
      vel: { x: 0, y: -280 },
    },
  };
  const result = step(world, 16);
  assert.ok(
    result.events.some((e) => e.type === 'brickDestroyed' || e.type === 'brickHit'),
    'ball hitting brick emits hit/destroy',
  );
  const after = result.state.bricks.find((b) => b.id === brick.id);
  assert.equal(after?.hitsLeft, 0);
}

function testBallLost() {
  const base = emptyWorld();
  const world = {
    ...base,
    ball: {
      ...base.ball,
      launched: true,
      pos: { x: 100, y: WORLD_HEIGHT - 2 },
      vel: { x: 0, y: 280 },
    },
  };
  const result = step(world, 32);
  assert.ok(result.events.some((e) => e.type === 'ballLost'));
}

function testLevelClear() {
  const bricks = loadLevel(0);
  let current = bricks;
  for (const b of bricks) {
    current = hitBrick(current, b.id).bricks;
  }
  assert.equal(isCleared(current), true);
}

function testLives() {
  let lives = createLives(INITIAL_LIVES);
  assert.equal(lives, 3);
  let r = onBallLost(lives);
  assert.equal(r.lives, 2);
  assert.equal(r.gameOver, false);
  r = onBallLost(r.lives);
  r = onBallLost(r.lives);
  assert.equal(r.lives, 0);
  assert.equal(r.gameOver, true);
}

function testScore() {
  assert.equal(onBrickDestroyed('normal'), SCORE_NORMAL);
  assert.equal(onBrickDestroyed('hard'), SCORE_HARD);
  assert.equal(considerHighScore(400, 200), 400);
  assert.equal(considerHighScore(50, 200), 200);
}

function testLevels() {
  assert.equal(LEVEL_COUNT, 3);
  assert.ok(loadLevel(0).length >= 8 * 5);
  assert.ok(loadLevel(1).some((b) => b.type === 'hard'));
  assert.ok(loadLevel(2).some((b) => b.type === 'hard'));
  const a1 = onLevelCleared(0);
  assert.equal(a1.kind, 'next');
  if (a1.kind === 'next') assert.equal(a1.nextIndex, 1);
  const a2 = onLevelCleared(1);
  assert.equal(a2.kind, 'next');
  const last = onLevelCleared(2);
  assert.equal(last.kind, 'victory');
}

function testPaddleClamp() {
  const world = createWorld();
  const left = setPaddleX(world, -40);
  assert.equal(left.paddle.x, 0);
  const right = setPaddleX(world, 9999);
  assert.equal(right.paddle.x, world.width - world.paddle.w);
}

function testLaunchFromPaddle() {
  const world = launchBall(createWorld());
  assert.equal(world.ball.launched, true);
  assert.ok(world.ball.vel.y < 0);
}

function main() {
  testWallBounce();
  testCeilingBounce();
  testPaddleBounceZones();
  testBrickDestroy();
  testHardBrickTwoHits();
  testEngineBrickCollision();
  testBallLost();
  testLevelClear();
  testLives();
  testScore();
  testLevels();
  testPaddleClamp();
  testLaunchFromPaddle();
  console.log(
    'smoke-v1: PASSED (walls, paddle zones, bricks, ball lost, lives, score, levels)',
  );
}

main();
