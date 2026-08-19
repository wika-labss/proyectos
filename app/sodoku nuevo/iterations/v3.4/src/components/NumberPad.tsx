import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  typography,
  layout,
  radius,
  componentHeights,
} from '../design-system';
import { VisualAssets } from '../modules/sodoku-visual/assets';
import { UiAssets } from '../modules/sodoku-ui-kit';
import { CellValue } from '../types';

interface Props {
  onPress: (value: CellValue) => void;
  onClear: () => void;
  /** v4 = teclas redondas estilo visual-expectation */
  variant?: 'default' | 'v4';
}

export function NumberPad({ onPress, onClear, variant = 'v4' }: Props) {
  const keyAsset = variant === 'v4' ? VisualAssets.keyDigitRound : UiAssets.keyDigit;
  const keySize = variant === 'v4' ? 44 : layout.keyWidth;
  const keyHeight = variant === 'v4' ? 44 : layout.keyHeight;
  const keyRadius = variant === 'v4' ? keySize / 2 : radius.sm;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[]).map((n) => (
          <Pressable key={n} onPress={() => onPress(n)} accessibilityLabel={`Número ${n}`}>
            <ImageBackground
              source={keyAsset}
              style={[styles.key, { width: keySize, height: keyHeight, borderRadius: keyRadius }]}
              imageStyle={{ borderRadius: keyRadius }}
              resizeMode="cover"
            >
              <Text style={styles.text}>{n}</Text>
            </ImageBackground>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={onClear} style={styles.clearWrap}>
        <ImageBackground
          source={UiAssets.clearBar}
          style={styles.clear}
          imageStyle={styles.clearImg}
          resizeMode="stretch"
        >
          <Text style={styles.clearText}>Borrar</Text>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  key: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '800',
    textShadowColor: colors.textShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  clearWrap: { width: '100%' },
  clear: {
    width: '100%',
    height: componentHeights.clearBar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearImg: { borderRadius: radius.md },
  clearText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
