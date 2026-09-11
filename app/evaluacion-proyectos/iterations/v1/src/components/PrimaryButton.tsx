import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing, touchMin } from '../constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    minHeight: touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 340,
    alignSelf: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  label: {
    color: colors.background,
    fontSize: fonts.body,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
