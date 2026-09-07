import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../design-system/tokens';
import { StoneButton } from '../modules/tower-ui-kit';

type Props = {
  onResume: () => void;
  onMenu: () => void;
};

export function PauseOverlay({ onResume, onMenu }: Props) {
  return (
    <View style={styles.overlay}>
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
  title: {
    color: colors.mist,
    fontSize: typography.title,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
});
