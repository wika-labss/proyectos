import React from 'react';
import { StyleSheet, View } from 'react-native';
import { bit, brickRow, capsuleColor, chrome, play } from '../design-system/tokens';
import { PixelText } from './pixel/PixelText';
import { doorRect } from '../engine/arkanoidEngine';
import { aliveBricks } from '../engine/brickField';
import type { Ball, WorldState } from '../engine/types';

type Props = {
  world: WorldState;
  scale: number;
};

export function Playfield({ world, scale }: Props) {
  const width = world.width * scale;
  const height = world.height * scale;
  const bricks = aliveBricks(world.bricks);
  const balls: Ball[] = [world.ball, ...world.extraBalls];
  const door = world.doorOpen ? doorRect(world.width, world.height) : null;
  const paddleColor =
    world.power === 'laser' ? bit.gold : world.power === 'catch' ? bit.purple : play.paddle;

  return (
    <View style={[styles.field, { width, height }]}>
      <View pointerEvents="none" style={styles.grid}>
        {Array.from({ length: 6 }, (_, i) => (
          <View key={`h-${i}`} style={[styles.gridH, { top: `${60 + i * 7}%` }]} />
        ))}
      </View>
      {bricks.map((brick) => {
        const color = brickRow[brick.row % brickRow.length] ?? brickRow[0];
        const cracked = brick.type === 'hard' && brick.hitsLeft === 1;
        return (
          <View
            key={brick.id}
            style={[
              styles.brick,
              {
                left: brick.x * scale,
                top: brick.y * scale,
                width: brick.w * scale,
                height: brick.h * scale,
                backgroundColor: cracked ? bit.peach : color,
              },
            ]}
          >
            {brick.type === 'hard' && brick.hitsLeft > 1 ? <View style={styles.hardStripe} /> : null}
          </View>
        );
      })}

      {door ? (
        <View
          style={[
            styles.door,
            {
              left: door.x * scale,
              top: door.y * scale,
              width: door.w * scale,
              height: door.h * scale,
            },
          ]}
        />
      ) : null}

      {world.capsules.map((cap) => (
        <View
          key={cap.id}
          style={[
            styles.capsule,
            {
              left: cap.x * scale,
              top: cap.y * scale,
              width: cap.w * scale,
              height: cap.h * scale,
              backgroundColor: capsuleColor[cap.kind],
            },
          ]}
        >
          <PixelText size="xs" color={bit.night} style={{ fontSize: Math.max(8, 9 * scale) }}>
            {cap.kind}
          </PixelText>
        </View>
      ))}

      {world.lasers.map((lz) => (
        <View
          key={lz.id}
          style={[
            styles.laser,
            {
              left: lz.x * scale,
              top: lz.y * scale,
              width: Math.max(2, lz.w * scale),
              height: lz.h * scale,
            },
          ]}
        />
      ))}

      <View
        style={[
          styles.paddle,
          {
            left: world.paddle.x * scale,
            top: world.paddle.y * scale,
            width: world.paddle.w * scale,
            height: world.paddle.h * scale,
            backgroundColor: paddleColor,
          },
        ]}
      >
        {world.power === 'laser' ? (
          <>
            <View style={[styles.cannon, { left: 4 * scale }]} />
            <View style={[styles.cannon, { right: 4 * scale }]} />
          </>
        ) : null}
      </View>

      {balls.map((ball) => (
        <View
          key={ball.id}
          style={[
            styles.ball,
            {
              left: (ball.pos.x - ball.r) * scale,
              top: (ball.pos.y - ball.r) * scale,
              width: ball.r * 2 * scale,
              height: ball.r * 2 * scale,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: play.crt,
    borderWidth: chrome.outline,
    borderColor: play.wall,
    overflow: 'hidden',
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: bit.cyan,
    opacity: 0.2,
  },
  brick: {
    position: 'absolute',
    borderWidth: chrome.hairline,
    borderColor: bit.outline,
  },
  hardStripe: {
    height: 3,
    backgroundColor: bit.ink,
    marginTop: 2,
    marginHorizontal: 3,
  },
  paddle: {
    position: 'absolute',
    borderWidth: chrome.hairline,
    borderColor: bit.outline,
  },
  cannon: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 5,
    backgroundColor: bit.hot,
  },
  ball: {
    position: 'absolute',
    backgroundColor: play.ball,
  },
  capsule: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: chrome.hairline,
    borderColor: bit.outline,
  },
  laser: {
    position: 'absolute',
    backgroundColor: bit.hot,
  },
  door: {
    position: 'absolute',
    backgroundColor: bit.pink,
    opacity: 0.9,
  },
});
