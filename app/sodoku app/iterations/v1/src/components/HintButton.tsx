import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { spacing, touchTarget, typography } from '../constants/theme';
import { ThemeColors } from '../types';

interface HintButtonProps {
  remaining: number;
  colors: ThemeColors;
  onPress: () => void;
}

export function HintButton({ remaining, colors, onPress }: HintButtonProps) {
  const disabled = remaining <= 0;

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Pista, ${remaining} restantes`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled
            ? colors.gridLine
            : pressed
              ? colors.highlightSame
              : colors.surface,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>Pista</Text>
      <Text style={[styles.count, { color: colors.textSecondary }]}>{remaining}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    minWidth: 72,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  count: {
    fontSize: typography.small,
  },
});
