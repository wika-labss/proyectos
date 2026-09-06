import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { bit, fontPixel } from '../../constants/theme';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Props = TextProps & {
  size?: Size;
  color?: string;
};

const SIZE: Record<Size, number> = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
};

export function PixelText({ size = 'sm', color = bit.ink, style, ...rest }: Props) {
  const fontSize = SIZE[size];
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { color, fontSize, lineHeight: Math.round(fontSize * 1.7) },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontPixel,
  },
});
