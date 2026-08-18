import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  typography,
  fontWeight,
  layout,
  radius,
  componentHeights,
} from '../design-system';
import { UiAssets } from '../modules/sodoku-ui-kit';
import { CellValue } from '../types';

interface Props {
  onPress: (value: CellValue) => void;
  onClear: () => void;
}

export function NumberPad({ onPress, onClear }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[]).map((n) => (
          <Pressable key={n} onPress={() => onPress(n)} accessibilityLabel={`Número ${n}`}>
            <ImageBackground
              source={UiAssets.keyDigit}
              style={styles.key}
              imageStyle={styles.keyImg}
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
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  key: {
    width: layout.keyWidth,
    height: layout.keyHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyImg: { borderRadius: radius.sm },
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
