import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { CASTLE_PLAYFIELD_BG } from '../constants/inspiration';
import { bit, brickRow, capsuleColor, play } from '../constants/theme';
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

  return (
    <ImageBackground
      source={CASTLE_PLAYFIELD_BG}
      resizeMode="cover"
      style={[styles.field, { width, height }]}
      imageStyle={styles.fieldImage}
    >
      <View pointerEvents="none" style={styles.fieldDim} />
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
                backgroundColor: cracked ? shade(color, 0.65) : color,
              },
            ]}
          >
            {brick.type === 'hard' && brick.hitsLeft > 1 ? (
              <View style={styles.hardStripe} />
            ) : null}
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
          <Text style={[styles.capsuleLetter, { fontSize: Math.max(8, 9 * scale) }]}>
            {cap.kind}
          </Text>
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
            backgroundColor:
              world.power === 'laser'
                ? '#F8C471'
                : world.power === 'catch'
                  ? '#1ABC9C'
                  : play.paddle,
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
              borderRadius: ball.r * scale,
            },
          ]}
        />
      ))}
    </ImageBackground>
  );
}

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `rgb(${r},${g},${b})`;
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: play.crt,
    borderWidth: 3,
    borderColor: play.wall,
    overflow: 'hidden',
    position: 'relative',
  },
  fieldImage: {
    opacity: 1,
  },
  fieldDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 6, 14, 0.28)',
  },
  brick: {
    position: 'absolute',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#00000055',
  },
  hardStripe: {
    height: 3,
    backgroundColor: '#F8F8F8',
    marginTop: 2,
    marginHorizontal: 3,
  },
  paddle: {
    position: 'absolute',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#5C4A6E',
  },
  cannon: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 5,
    backgroundColor: bit.red,
  },
  ball: {
    position: 'absolute',
    backgroundColor: play.ball,
    borderRadius: 0,
  },
  capsule: {
    position: 'absolute',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00000066',
  },
  capsuleLetter: {
    color: '#111',
    fontWeight: '800',
  },
  laser: {
    position: 'absolute',
    backgroundColor: bit.red,
  },
  door: {
    position: 'absolute',
    backgroundColor: bit.pink,
    opacity: 0.9,
  },
});
