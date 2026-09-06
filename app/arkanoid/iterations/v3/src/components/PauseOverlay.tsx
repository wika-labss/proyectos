import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { play } from '../constants/theme';
import { useAmbientAudio } from '../hooks/AmbientAudioProvider';
import { AmbientThemeControl } from './AmbientThemeControl';
import { AmbientVolumeControl } from './AmbientVolumeControl';

type Props = {
  onResume: () => void;
  onMenu: () => void;
};

export function PauseOverlay({ onResume, onMenu }: Props) {
  const { ambientVolume, setAmbientVolume, theme, setAmbientTheme } = useAmbientAudio();
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Pausa</Text>
      <AmbientThemeControl
        tone="retro"
        theme={theme}
        onChange={(id) => {
          void setAmbientTheme(id);
        }}
      />
      <AmbientVolumeControl
        tone="retro"
        volume={ambientVolume}
        onChange={(value) => {
          void setAmbientVolume(value);
        }}
      />
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        onPress={onResume}
      >
        <Text style={styles.ctaText}>Reanudar</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        onPress={onMenu}
      >
        <Text style={styles.secondaryText}>Menú</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: play.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    zIndex: 20,
  },
  title: {
    color: play.hud,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  cta: {
    backgroundColor: play.paddle,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaText: {
    color: play.crt,
    fontWeight: '800',
    fontSize: 16,
  },
  secondary: {
    paddingVertical: 10,
  },
  secondaryText: {
    color: play.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
