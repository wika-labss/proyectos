import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { borderWidth, colors, radius, spacing } from '../../design-system';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** Estira el chrome (mapa / tablero). */
  fill?: boolean;
};

/** Chrome 8-bit: outline negro + rim cian interior (hero-home / hero-suitors). */
export function PixelPanel({
  children,
  style,
  padded = true,
  fill,
}: Props) {
  return (
    <View style={[styles.outer, fill && styles.fill, style]}>
      <View style={[styles.inner, padded && styles.pad, fill && styles.fill]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.outline,
    padding: borderWidth.outline,
    borderRadius: radius.md,
  },
  inner: {
    backgroundColor: colors.night,
    borderWidth: borderWidth.outline,
    borderColor: colors.cyan,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  pad: {
    padding: spacing.md,
  },
  fill: {
    flex: 1,
  },
});
