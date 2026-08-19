import React from 'react';
import { GestureResponderEvent, PanResponder, StyleSheet, View } from 'react-native';

type Props = {
  enabled: boolean;
  worldWidth: number;
  scale: number;
  width: number;
  height: number;
  onMove: (worldX: number) => void;
  onLaunch: () => void;
  children: React.ReactNode;
};

export function PaddleControls({
  enabled,
  worldWidth,
  scale,
  width,
  height,
  onMove,
  onLaunch,
  children,
}: Props) {
  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          if (!enabled) return;
          const x = e.nativeEvent.locationX / scale;
          onMove(clamp(x, 0, worldWidth));
          onLaunch();
        },
        onPanResponderMove: (e: GestureResponderEvent) => {
          if (!enabled) return;
          const x = e.nativeEvent.locationX / scale;
          onMove(clamp(x, 0, worldWidth));
        },
      }),
    [enabled, onLaunch, onMove, scale, worldWidth],
  );

  return (
    <View style={[styles.wrap, { width, height }]} {...pan.panHandlers}>
      {children}
    </View>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
});
