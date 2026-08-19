import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { brickRow, play } from '../constants/theme';
import { aliveBricks } from '../engine/brickField';
import type { WorldState } from '../engine/types';

type Props = {
  world: WorldState;
  scale: number;
};

export function Playfield({ world, scale }: Props) {
  const width = world.width * scale;
  const height = world.height * scale;
  const bricks = aliveBricks(world.bricks);

  return (
    <View style={[styles.field, { width, height }]}>
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

      {world.boss && world.boss.hitsLeft > 0 ? (
        <Image
          source={require('../../assets/boss.png')}
          style={{
            position: 'absolute',
            left: world.boss.x * scale,
            top: world.boss.y * scale,
            width: world.boss.w * scale,
            height: world.boss.h * scale,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: play.bossCore,
          }}
          resizeMode="cover"
        />
      ) : null}

      <View
        style={[
          styles.paddle,
          {
            left: world.paddle.x * scale,
            top: world.paddle.y * scale,
            width: world.paddle.w * scale,
            height: world.paddle.h * scale,
          },
        ]}
      />

      <View
        style={[
          styles.ball,
          {
            left: (world.ball.pos.x - world.ball.r) * scale,
            top: (world.ball.pos.y - world.ball.r) * scale,
            width: world.ball.r * 2 * scale,
            height: world.ball.r * 2 * scale,
            borderRadius: world.ball.r * scale,
          },
        ]}
      />
    </View>
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
  brick: {
    position: 'absolute',
    borderRadius: 2,
  },
  hardStripe: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    marginHorizontal: 3,
    borderRadius: 1,
  },
  paddle: {
    position: 'absolute',
    backgroundColor: play.paddle,
    borderRadius: 3,
  },
  ball: {
    position: 'absolute',
    backgroundColor: play.ball,
  },
});
