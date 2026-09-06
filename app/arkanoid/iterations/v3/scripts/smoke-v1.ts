/**
 * Smoke V3 — classic engine (no boss, no /lose /win).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
  BALL_RADIUS,
  INITIAL_LIVES,
  LEVEL_COUNT,
  PADDLE_WIDTH,
  PADDLE_WIDTH_ENLARGED,
  SCORE_HARD,
  SCORE_NORMAL,
  SLOW_FACTOR,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../src/constants/game';
import {
  createWorld,
  fireLasers,
  launchBall,
  setPaddleX,
  step,
} from '../src/engine/arkanoidEngine';
import { applyCapsule } from '../src/engine/capsules';
import { hitBrick, isCleared, loadLevel } from '../src/engine/brickField';
import { createLives, onBallLost, onExtraLife } from '../src/engine/livesSystem';
import { considerHighScore, onBrickDestroyed } from '../src/engine/arkanoidScore';
import { onLevelCleared } from '../src/engine/levelProgress';
import {
  DEFAULT_AMBIENT_THEME,
  nextAmbientTheme,
  parseStoredTheme,
  resolveAmbientTheme,
} from '../src/modules/ambient-audio/themes';
import {
  clampVolume,
  defaultVolume,
  parseStoredVolume,
} from '../src/modules/ambient-audio/volume';
import type { CapsuleKind, WorldState } from '../src/engine/types';

const neverDrop = () => 1;
const alwaysDrop = () => 0;

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
  const result = step(world, 16, neverDrop);
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
  const result = step(world, 16, neverDrop);
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
    neverDrop,
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
    neverDrop,
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
  const result = step(world, 16, neverDrop);
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
  const result = step(world, 32, neverDrop);
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

function flyingWorld(): WorldState {
  const base = emptyWorld();
  return launchBall({
    ...base,
    ball: {
      ...base.ball,
      launched: false,
    },
  });
}

function testCapsuleLaser() {
  const armed = applyCapsule(flyingWorld(), 'L');
  assert.equal(armed.power, 'laser');
  const shot = fireLasers(armed);
  assert.equal(shot.lasers.length, 2);
  const brick = loadLevel(0)[0]!;
  const aimed = {
    ...shot,
    bricks: [brick],
    lasers: shot.lasers.map((lz) => ({
      ...lz,
      x: brick.x + brick.w / 2,
      y: brick.y + brick.h + 4,
    })),
  };
  const result = step(aimed, 16, neverDrop);
  assert.ok(
    result.events.some((e) => e.type === 'brickDestroyed' || e.type === 'brickHit'),
    'laser should damage bricks',
  );
}

function testCapsuleEnlarge() {
  const wide = applyCapsule(createWorld(), 'E');
  assert.equal(wide.power, 'enlarge');
  assert.equal(wide.paddle.w, PADDLE_WIDTH_ENLARGED);
}

function testCapsuleCatch() {
  const world = applyCapsule(emptyWorld(), 'C');
  assert.equal(world.power, 'catch');
  const result = step(
    {
      ...world,
      ball: {
        ...world.ball,
        launched: true,
        pos: { x: world.paddle.x + world.paddle.w / 2, y: world.paddle.y - BALL_RADIUS - 1 },
        vel: { x: 0, y: 280 },
      },
    },
    16,
    neverDrop,
  );
  assert.equal(result.state.ball.launched, false, 'catch should stick the ball');
}

function testCapsuleSlow() {
  const launched = flyingWorld();
  const before = Math.hypot(launched.ball.vel.x, launched.ball.vel.y);
  const slowed = applyCapsule(launched, 'S');
  assert.equal(slowed.slow, true);
  const result = step(slowed, 16, neverDrop);
  const after = Math.hypot(result.state.ball.vel.x, result.state.ball.vel.y);
  assert.ok(after < before * SLOW_FACTOR + 1, 'slow should reduce ball speed');
}

function testCapsuleBreak() {
  const opened = applyCapsule(createWorld(), 'B');
  assert.equal(opened.doorOpen, true);
  const slid = setPaddleX(opened, 9999);
  assert.ok(slid.doorExit, 'paddle entering the door should exit');
}

function testCapsuleDisrupt() {
  const split = applyCapsule(flyingWorld(), 'D');
  assert.equal(split.power, 'disrupt');
  assert.equal(split.extraBalls.length, 2);
}

function testDisruptKeepsLifeUntilLastBall() {
  const split = applyCapsule(flyingWorld(), 'D');
  const lostOne = step(
    {
      ...split,
      extraBalls: [
        {
          ...split.extraBalls[0]!,
          pos: { x: 80, y: WORLD_HEIGHT - 2 },
          vel: { x: 0, y: 280 },
        },
        split.extraBalls[1]!,
      ],
    },
    32,
    neverDrop,
  );
  assert.ok(!lostOne.events.some((e) => e.type === 'ballLost'), 'one extra lost is not a life');
  assert.ok(lostOne.state.extraBalls.length + 1 >= 2);
}

function testCapsulePlayer() {
  assert.equal(onExtraLife(3), 4);
  assert.equal(onExtraLife(6), 6);
  const idle = applyCapsule(createWorld(), 'P');
  assert.equal(idle.power, null);
  assert.equal(idle.paddle.w, PADDLE_WIDTH);
}

function testCapsuleSpawnOnDestroy() {
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
  const result = step(world, 16, alwaysDrop);
  assert.ok(result.events.some((e) => e.type === 'capsuleSpawned'));
  assert.ok(result.state.capsules.length >= 1);
  const kinds: CapsuleKind[] = ['L', 'E', 'C', 'S', 'B', 'D', 'P'];
  assert.ok(kinds.includes(result.state.capsules[0]!.kind));
}

function testCapsulePlayerEvent() {
  const world = createWorld();
  const withP = {
    ...applyCapsule(world, 'E'),
    capsules: [
      {
        id: 'p',
        kind: 'P' as const,
        x: world.paddle.x,
        y: world.paddle.y - 4,
        w: 22,
        h: 12,
        vy: 80,
      },
    ],
  };
  const result = step(withP, 16, neverDrop);
  assert.ok(result.events.some((e) => e.type === 'extraLife'));
  assert.equal(result.state.power, 'enlarge');
}

function testExclusiveReplace() {
  const enlarged = applyCapsule(createWorld(), 'E');
  const laser = applyCapsule(enlarged, 'L');
  assert.equal(laser.power, 'laser');
  assert.equal(laser.paddle.w, PADDLE_WIDTH);
  assert.equal(laser.slow, false);
}

function testAmbientVolumeChannel() {
  assert.equal(clampVolume(-1), 0);
  assert.equal(clampVolume(2), 1);
  assert.equal(clampVolume(Number.NaN), defaultVolume('ambient'));
  assert.equal(parseStoredVolume(null, 'ambient'), defaultVolume('ambient'));
  assert.equal(parseStoredVolume('0.2', 'ambient'), 0.2);
  assert.equal(parseStoredVolume(null, 'sfx'), defaultVolume('sfx'));
  assert.notEqual(defaultVolume('ambient'), defaultVolume('sfx'));
}

function testAmbientThemeSwitch() {
  const castle = resolveAmbientTheme('castle');
  assert.equal(castle.id, 'castle');
  assert.equal(castle.file, 'ambient-castle.mp3');
  const unknown = resolveAmbientTheme('missing');
  assert.equal(unknown.id, DEFAULT_AMBIENT_THEME);
  assert.equal(unknown.file, 'ambient-castle.mp3');
  assert.equal(parseStoredTheme(null), 'castle');
  assert.equal(parseStoredTheme('nebula'), 'castle');
  assert.equal(nextAmbientTheme('castle'), 'castle');
}

function testNoBossRoutes() {
  assert.equal(LEVEL_COUNT, 3);
  const last = onLevelCleared(2);
  assert.equal(last.kind, 'victory');
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
  testCapsuleLaser();
  testCapsuleEnlarge();
  testCapsuleCatch();
  testCapsuleSlow();
  testCapsuleBreak();
  testCapsuleDisrupt();
  testDisruptKeepsLifeUntilLastBall();
  testCapsulePlayer();
  testCapsulePlayerEvent();
  testExclusiveReplace();
  testCapsuleSpawnOnDestroy();
  testAmbientVolumeChannel();
  testAmbientThemeSwitch();
  testNoBossRoutes();
  console.log(
    'smoke-v3: PASSED (classic + Vaus capsules + castle ambient only; no boss)',
  );
}

main();
