import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, touchTarget, typography } from '../constants/theme';
import { ThemeColors } from '../types';

interface NumberPadProps {
  colors: ThemeColors;
  onNumberPress: (value: number) => void;
  onClear: () => void;
}

export function NumberPad({ colors, onNumberPress, onClear }: NumberPadProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <Pressable
            key={number}
            accessibilityRole="button"
            accessibilityLabel={`Número ${number}`}
            onPress={() => onNumberPress(number)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed ? colors.highlightSame : colors.surface,
                borderColor: colors.gridLine,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>{number}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Borrar celda"
        onPress={onClear}
        style={({ pressed }) => [
          styles.clearButton,
          {
            backgroundColor: pressed ? colors.highlightSame : colors.primary,
          },
        ]}
      >
        <Text style={[styles.clearText, { color: colors.buttonText }]}>Borrar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  button: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  buttonText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  clearButton: {
    minHeight: touchTarget,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  clearText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
});
