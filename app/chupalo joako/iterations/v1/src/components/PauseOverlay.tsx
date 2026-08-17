import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  visible: boolean;
  onResume: () => void;
  onMenu: () => void;
};

export function PauseOverlay({ visible, onResume, onMenu }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Pausa</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onResume}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>Reanudar</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onMenu}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryText}>Menú</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,6,15,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  title: {
    color: colors.neonText,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
  },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  primaryText: {
    color: colors.void,
    fontSize: 18,
    fontWeight: '800',
  },
  secondary: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.muted,
  },
  secondaryText: {
    color: colors.hud,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
