import React from 'react';
import {
  Image,
  Platform,
  type ImageSourcePropType,
  View,
} from 'react-native';

type Props = {
  source: ImageSourcePropType;
  cols: number;
  rows: number;
  col: number;
  row: number;
  size: number;
};

/** Recorte entero + nearest. El sheet fuente debe ser grilla 1:1. */
export function SheetSprite({ source, cols, rows, col, row, size }: Props) {
  const s = Math.max(1, Math.floor(size));
  return (
    <View style={{ width: s, height: s, overflow: 'hidden' }}>
      <Image
        source={source}
        resizeMethod="resize"
        resizeMode="stretch"
        style={{
          width: s * cols,
          height: s * rows,
          marginLeft: -col * s,
          marginTop: -row * s,
          ...(Platform.OS === 'web'
            ? ({ imageRendering: 'pixelated' } as object)
            : null),
        }}
      />
    </View>
  );
}
