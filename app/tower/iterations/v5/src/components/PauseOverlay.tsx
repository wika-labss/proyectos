import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontWeight, spacing, typography } from '../design-system/tokens';
import { chromePause, StoneButton } from '../modules/tower-ui-kit';

type Props = {
  onResume: () => void;
  onMenu: () => void;
};

export function PauseOverlay({ onResume, onMenu }: Props) {
  return (
    <View style={styles.overlay}>
      <Image source={chromePause} style={styles.icon} />
      <Text style={styles.title}>Pausa</Text>
      <StoneButton label="Reanudar" onPress={onResume} variant="secondary" />
      <StoneButton label="Menú" onPress={onMenu} variant="ghost" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    zIndex: 20,
    paddingHorizontal: spacing.lg,
  },
  icon: { width: 72, height: 72 },
  title: {
    color: colors.mist,
    fontSize: typography.title,
    fontWeight: fontWeight.extrabold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
});
