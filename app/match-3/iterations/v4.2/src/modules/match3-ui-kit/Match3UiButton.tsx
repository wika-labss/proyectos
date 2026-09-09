import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  borderWidth,
  colors,
  fonts,
  layout,
  radius,
  spacing,
  typography,
} from '../../design-system';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** Fila HUD / mapa: comparte ancho sin maxWidth 340. */
  inline?: boolean;
  /** Overlay fin de nivel. */
  large?: boolean;
};

const FILL: Record<Variant, string> = {
  primary: colors.cyan,
  secondary: colors.cobalt,
  danger: colors.panic,
  ghost: colors.night,
};

/** Match3UiButton — spec design-system/components/match3-ui-kit/match3-ui-button */
export function Match3UiButton({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled,
  inline,
  large,
}: Props) {
  const fill = FILL[variant];
  const labelColor = variant === 'ghost' ? colors.cyanHi : colors.star;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        inline ? styles.inline : styles.wrap,
        large && styles.wrapLarge,
        style,
        { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
      ]}
    >
      <View
        style={[
          styles.outline,
          variant === 'ghost' && styles.ghostOutline,
        ]}
      >
        <View style={[styles.face, large && styles.faceLarge, { backgroundColor: fill }]}>
          <Text style={[styles.label, large && styles.labelLarge, { color: labelColor }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: layout.ctaMaxWidth,
    alignSelf: 'center',
    minHeight: layout.touchMin,
  },
  inline: {
    flex: 1,
    minHeight: layout.touchMin,
    alignSelf: 'stretch',
  },
  outline: {
    borderWidth: borderWidth.outline,
    borderColor: colors.outline,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  ghostOutline: {
    borderColor: colors.cyan,
  },
  face: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.touchMin,
    borderTopWidth: borderWidth.bevel,
    borderLeftWidth: borderWidth.bevel,
    borderTopColor: colors.cyanHi,
    borderLeftColor: colors.cyanHi,
    borderBottomWidth: borderWidth.bevel,
    borderRightWidth: borderWidth.bevel,
    borderBottomColor: colors.nightDeep,
    borderRightColor: colors.nightDeep,
  },
  label: {
    fontFamily: fonts.pixel,
    fontSize: typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  wrapLarge: {
    minHeight: 72,
  },
  faceLarge: {
    minHeight: 72,
    paddingVertical: spacing.lg,
  },
  labelLarge: {
    fontSize: typography.title,
  },
});
