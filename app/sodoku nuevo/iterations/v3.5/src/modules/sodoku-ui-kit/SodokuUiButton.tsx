import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import {
  colors,
  typography,
  fontWeight,
  layout,
  radius,
  interaction,
} from '../../design-system';
import { SodokuButtonVariant, UiAssets, variantHeight } from './assets';

interface Props {
  label: string;
  variant?: SodokuButtonVariant;
  onPress?: () => void;
  style?: ViewStyle;
  textColor?: string;
}

const sourceFor: Record<SodokuButtonVariant, ImageSourcePropType> = {
  ctaFull: UiAssets.ctaFull,
  ctaCompact: UiAssets.ctaCompact,
  ctaMedium: UiAssets.ctaMedium,
  actionBar: UiAssets.actionBar,
  actionHint: UiAssets.actionHint,
  actionBarSecondary: UiAssets.actionBarSecondary,
  clearBar: UiAssets.clearBar,
  pillLink: UiAssets.pillLink,
};

/** SodokuUiButton — spec: design-system/components/sodoku-ui-kit/sodoku-ui-button */
export function SodokuUiButton({
  label,
  variant = 'ctaFull',
  onPress,
  style,
  textColor,
}: Props) {
  const height = variantHeight[variant];
  const isSecondary =
    variant === 'ctaCompact' ||
    variant === 'actionBarSecondary' ||
    variant === 'clearBar' ||
    variant === 'pillLink';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        style,
        pressed && {
          opacity: interaction.pressedOpacity,
          transform: [{ scale: interaction.pressedScale }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <ImageBackground
        source={sourceFor[variant]}
        style={[styles.btn, { height }]}
        imageStyle={styles.img}
        resizeMode="stretch"
      >
        <Text
          style={[
            styles.label,
            { color: textColor ?? (isSecondary ? colors.text : colors.textOnPink) },
            variant === 'pillLink' && styles.pillLabel,
          ]}
        >
          {label}
        </Text>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: layout.ctaMaxWidth, alignSelf: 'center' },
  btn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  img: { borderRadius: radius.xl },
  label: {
    fontSize: typography.body,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: colors.textShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pillLabel: {
    fontSize: typography.sm,
    fontWeight: '700',
    textShadowRadius: 0,
  },
});
