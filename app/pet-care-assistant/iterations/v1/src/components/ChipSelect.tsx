import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  multi?: boolean;
  values?: T[];
  onToggle?: (value: T) => void;
};

export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  multi,
  values,
  onToggle,
}: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = multi ? values?.includes(opt.value) : value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => (multi && onToggle ? onToggle(opt.value) : onChange(opt.value))}
            style={[styles.chip, selected && styles.chipOn]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextOn]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.text,
    fontSize: fonts.sizeSm,
    fontFamily: fonts.base,
  },
  chipTextOn: {
    color: colors.accent,
    fontWeight: fonts.weightBold,
  },
});
