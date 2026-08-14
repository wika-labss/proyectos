import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../modules/app-theme';
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
          <Pressable key={n} style={styles.btn} onPress={() => onPress(n)}>
            <Text style={styles.text}>{n}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.clear} onPress={onClear}>
        <Text style={styles.clearText}>Borrar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  btn: {
    width: 36,
    height: 44,
    borderWidth: 2,
    borderColor: colors.buttonBorder,
    backgroundColor: colors.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clear: {
    borderWidth: 2,
    borderColor: colors.buttonSecondaryBorder,
    backgroundColor: colors.buttonSecondaryBg,
    paddingVertical: 10,
    alignItems: 'center',
  },
  text: { color: colors.surface, fontSize: typography.body, fontWeight: '700' },
  clearText: { color: colors.accent, fontSize: typography.body, fontWeight: '700' },
});
