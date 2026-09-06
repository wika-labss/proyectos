import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { menu, play } from '../constants/theme';
import { clampVolume } from '../modules/ambient-audio';

type Tone = 'future' | 'retro';

type Props = {
  volume: number;
  onChange: (value: number) => void;
  tone?: Tone;
};

const TRACK_WIDTH = 168;
const STEP = 0.1;

export function AmbientVolumeControl({ volume, onChange, tone = 'future' }: Props) {
  const colors = tone === 'future'
    ? { label: menu.muted, fill: menu.neon, track: menu.magenta, text: menu.text }
    : { label: play.muted, fill: play.hud, track: play.wall, text: play.hud };

  const fillWidth = useMemo(() => Math.round(clampVolume(volume) * TRACK_WIDTH), [volume]);
  const percent = Math.round(clampVolume(volume) * 100);

  const bump = (delta: number) => {
    onChange(clampVolume(volume + delta));
  };

  const setFromTouch = (locationX: number) => {
    onChange(clampVolume(locationX / TRACK_WIDTH));
  };

  return (
    <View style={styles.wrap} accessibilityRole="adjustable" accessibilityLabel="Volumen ambiente">
      <Text style={[styles.label, { color: colors.label }]}>Ambiente</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bajar ambiente"
          onPress={() => bump(-STEP)}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
        >
          <Text style={[styles.stepText, { color: colors.text }]}>−</Text>
        </Pressable>
        <View
          style={[styles.track, { borderColor: colors.track, width: TRACK_WIDTH }]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(event) => setFromTouch(event.nativeEvent.locationX)}
          onResponderMove={(event) => setFromTouch(event.nativeEvent.locationX)}
        >
          <View style={[styles.fill, { width: fillWidth, backgroundColor: colors.fill }]} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Subir ambiente"
          onPress={() => bump(STEP)}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
        >
          <Text style={[styles.stepText, { color: colors.text }]}>+</Text>
        </Pressable>
        <Text style={[styles.percent, { color: colors.text }]}>{percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  step: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 22,
    fontWeight: '800',
  },
  track: {
    height: 10,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
  },
  percent: {
    minWidth: 40,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
