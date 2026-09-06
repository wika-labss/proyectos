import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { clampVolume } from '../modules/ambient-audio/volume';
import { bit } from '../constants/theme';
import { PixelText } from './pixel/PixelText';

type Props = {
  volume: number;
  onChange: (value: number) => void;
  tone?: 'future' | 'retro';
};

const TRACK_WIDTH = 140;
const STEP = 0.1;

export function AmbientVolumeControl({ volume, onChange }: Props) {
  const fillWidth = useMemo(() => Math.round(clampVolume(volume) * TRACK_WIDTH), [volume]);
  const percent = Math.round(clampVolume(volume) * 100);

  return (
    <View style={styles.wrap} accessibilityRole="adjustable" accessibilityLabel="Volumen ambiente">
      <PixelText size="xs" color={bit.muted}>
        AMBIENTE
      </PixelText>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bajar ambiente"
          onPress={() => onChange(clampVolume(volume - STEP))}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
        >
          <PixelText size="sm" color={bit.gold}>
            -
          </PixelText>
        </Pressable>
        <View
          style={styles.track}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(event) =>
            onChange(clampVolume(event.nativeEvent.locationX / TRACK_WIDTH))
          }
          onResponderMove={(event) =>
            onChange(clampVolume(event.nativeEvent.locationX / TRACK_WIDTH))
          }
        >
          <View style={[styles.fill, { width: fillWidth }]} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Subir ambiente"
          onPress={() => onChange(clampVolume(volume + STEP))}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
        >
          <PixelText size="sm" color={bit.gold}>
            +
          </PixelText>
        </Pressable>
        <PixelText size="xs" color={bit.ink} style={styles.percent}>
          {percent}
        </PixelText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  step: {
    minWidth: 28,
    minHeight: 28,
    borderWidth: 3,
    borderColor: bit.gold,
    backgroundColor: bit.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: TRACK_WIDTH,
    height: 12,
    borderWidth: 3,
    borderColor: bit.wall,
    backgroundColor: bit.night,
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
    backgroundColor: bit.gold,
  },
  percent: {
    minWidth: 28,
  },
  pressed: {
    opacity: 0.7,
  },
});
