import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { spacing, touchTarget, typography } from '../constants/theme';
import { ThemeColors } from '../types';

interface ActionButtonProps {
  label: string;
  colors: ThemeColors;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function ActionButton({ label, colors, active = false, disabled = false, onPress }: ActionButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: active
            ? colors.primary
            : pressed
              ? colors.highlightSame
              : colors.surface,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: active ? colors.buttonText : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.small,
    fontWeight: '600',
  },
});
