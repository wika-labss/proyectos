import React from 'react';
import { GestureResponderEvent, PanResponder, StyleSheet, View } from 'react-native';
import { bit, chrome } from '../../design-system/tokens';

type Props = {
  enabled: boolean;
  worldWidth: number;
  trackWidth: number;
  value: number;
  onChange: (worldCenterX: number) => void;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function PaddleSlider({ enabled, worldWidth, trackWidth, value, onChange }: Props) {
  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          if (!enabled) return;
          const x = e.nativeEvent.locationX;
          onChange(clamp((x / trackWidth) * worldWidth, 0, worldWidth));
        },
        onPanResponderMove: (e: GestureResponderEvent) => {
          if (!enabled) return;
          const x = e.nativeEvent.locationX;
          onChange(clamp((x / trackWidth) * worldWidth, 0, worldWidth));
        },
      }),
    [enabled, onChange, trackWidth, worldWidth],
  );

  const ratio = worldWidth <= 0 ? 0 : clamp(value / worldWidth, 0, 1);
  const thumbW = 36;
  const thumbLeft = clamp(ratio * trackWidth - thumbW / 2, 0, Math.max(0, trackWidth - thumbW));

  return (
    <View style={[styles.hit, { width: trackWidth, minHeight: chrome.hit }]} {...pan.panHandlers}>
      <View style={styles.track} />
      <View style={[styles.thumb, { left: thumbLeft, width: thumbW }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hit: {
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 10,
    backgroundColor: bit.panel,
    borderWidth: chrome.outline,
    borderColor: bit.outline,
  },
  thumb: {
    position: 'absolute',
    height: 18,
    borderRadius: 9,
    backgroundColor: bit.cyan,
    borderWidth: chrome.hairline,
    borderColor: bit.outline,
  },
});
