import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../constants/game';
import { retro } from '../constants/theme';
import { WorldState } from '../engine/arkanoidEngine';

type Props = {
  world: WorldState;
  scale: number;
};

export function Playfield({ world, scale }: Props) {
  const style = useMemo(
    () => ({
      width: WORLD_WIDTH * scale,
      height: WORLD_HEIGHT * scale,
    }),
    [scale]
  );

  return (
    <View style={[styles.field, style]}>
      {world.bricks.map((b) => {
        const color =
          b.type === 'hard'
            ? b.hitsLeft > 1
              ? retro.hardBrick
              : retro.hardBrickHit
            : retro.bricks[b.row % retro.bricks.length];
        return (
          <View
            key={b.id}
            style={{
              position: 'absolute',
              left: b.x * scale,
              top: b.y * scale,
              width: b.w * scale,
              height: b.h * scale,
              backgroundColor: color,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: '#00000055',
            }}
          />
        );
      })}

      <View
        style={{
          position: 'absolute',
          left: world.paddle.x * scale,
          top: world.paddle.y * scale,
          width: world.paddle.w * scale,
          height: world.paddle.h * scale,
          backgroundColor: retro.paddle,
          borderRadius: 3,
        }}
      />

      <View
        style={{
          position: 'absolute',
          left: (world.ball.pos.x - world.ball.r) * scale,
          top: (world.ball.pos.y - world.ball.r) * scale,
          width: world.ball.r * 2 * scale,
          height: world.ball.r * 2 * scale,
          borderRadius: world.ball.r * scale,
          backgroundColor: retro.ball,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: retro.crt,
    overflow: 'hidden',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#2A1A30',
  },
});
