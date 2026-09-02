import React from 'react';
import { Image, type ImageSourcePropType, View } from 'react-native';

type Props = {
  source: ImageSourcePropType;
  cols: number;
  rows: number;
  col: number;
  row: number;
  size: number;
};

/** Recorte de sprite sheet (grid uniforme). */
export function SheetSprite({ source, cols, rows, col, row, size }: Props) {
  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={source}
        style={{
          width: size * cols,
          height: size * rows,
          marginLeft: -col * size,
          marginTop: -row * size,
        }}
      />
    </View>
  );
}
