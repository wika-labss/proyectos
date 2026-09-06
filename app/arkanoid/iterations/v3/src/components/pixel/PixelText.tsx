import React, { useContext } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { PixelFontReadyContext } from '../../constants/fonts';
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
  const pixelReady = useContext(PixelFontReadyContext);
  return (
    <Text
      {...rest}
      style={[
        { color, fontSize, lineHeight: Math.round(fontSize * 1.7) },
        pixelReady ? styles.pixel : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  pixel: {
    fontFamily: fontPixel,
  },
});
