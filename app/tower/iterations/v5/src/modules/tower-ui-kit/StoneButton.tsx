import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  colors,
  fontWeight,
  layout,
  motion,
  radius,
  spacing,
  typography,
} from '../../design-system/tokens';
import {
  chromeCtaEmber,
  chromeCtaStone,
  chromePlaqueBreach,
} from './assets';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PLATE: Record<Exclude<Variant, 'ghost'>, ImageSourcePropType> = {
  primary: chromeCtaEmber,
  secondary: chromeCtaStone,
  danger: chromePlaqueBreach,
};

export function StoneButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  compact,
  style,
}: Props) {
  if (variant === 'ghost') {
    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.ghost,
          !compact && styles.ghostFull,
          compact && styles.ghostCompact,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
      >
        <Text style={styles.ghostLabel}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.hit,
        compact && styles.hitCompact,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <ImageBackground
        source={PLATE[variant]}
        style={styles.plate}
        imageStyle={styles.plateImg}
        resizeMode="stretch"
      >
        <Text
          style={[
            styles.label,
            variant === 'secondary' && styles.secondaryLabel,
            variant === 'danger' && styles.dangerLabel,
          ]}
        >
          {label}
        </Text>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    minHeight: layout.touchMin,
    maxWidth: layout.ctaMaxWidth,
    width: '100%',
    alignSelf: 'center',
    height: 56,
  },
  hitCompact: {
    maxWidth: '100%',
    height: 48,
  },
  plate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  plateImg: {
    borderRadius: radius.sm,
  },
  label: {
    fontSize: typography.subtitle,
    fontWeight: fontWeight.extrabold,
    color: colors.mist,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  secondaryLabel: { color: colors.torchGold },
  dangerLabel: { color: colors.mist },
  ghost: {
    minHeight: layout.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  ghostFull: {
    maxWidth: layout.ctaMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  ghostCompact: { alignSelf: 'flex-start' },
  ghostLabel: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  pressed: { opacity: motion.pressOpacity },
  disabled: { opacity: 0.45 },
});
