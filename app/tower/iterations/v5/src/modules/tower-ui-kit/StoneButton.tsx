import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  borderWidth,
  colors,
  layout,
  radius,
  spacing,
  typography,
} from '../../design-system/tokens';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
};

export function StoneButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.touchMin,
    maxWidth: layout.ctaMaxWidth,
    width: '100%',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: borderWidth.medium,
    borderColor: 'transparent',
  },
  primary: { backgroundColor: colors.ember },
  secondary: {
    backgroundColor: colors.stone,
    borderColor: colors.torchGold,
  },
  danger: { backgroundColor: colors.breach },
  ghost: { backgroundColor: 'transparent' },
  label: {
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  primaryLabel: { color: colors.mist },
  secondaryLabel: { color: colors.torchGold },
  dangerLabel: { color: colors.mist },
  ghostLabel: { color: colors.muted },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.45 },
});
