import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, layout } from '../constants/theme';

interface RemoteButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export function RemoteButton({
  label,
  style,
  compact = false,
  disabled = false,
  ...props
}: RemoteButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.button,
        compact ? styles.compact : styles.regular,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.buttonBackground,
    borderRadius: layout.buttonRadius,
    justifyContent: 'center',
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
  },
  compact: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  regular: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pressed: {
    backgroundColor: colors.buttonPressed,
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelDisabled: {
    color: colors.buttonText,
  },
});
