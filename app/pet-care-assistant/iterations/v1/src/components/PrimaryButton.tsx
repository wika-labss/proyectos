import React, { forwardRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

type Props = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export const PrimaryButton = forwardRef<React.ElementRef<typeof Pressable>, Props>(
  function PrimaryButton({ label, variant = 'primary', style, disabled, ...rest }, ref) {
    const bg =
      variant === 'primary'
        ? colors.accent
        : variant === 'danger'
          ? colors.error
          : colors.accentMuted;
    const fg = variant === 'secondary' ? colors.text : colors.surface;
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
          style,
        ]}
        {...rest}
      >
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  btn: {
    minHeight: 44,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.base,
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
  },
});
