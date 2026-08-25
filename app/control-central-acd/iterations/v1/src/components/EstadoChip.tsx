import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing, touchMin } from '../constants/theme';
import { estadoTokenKey } from '../engine/licitaciones';

type EstadoChipProps = {
  codigo: number;
  nombre: string;
  selected?: boolean;
  onPress?: () => void;
};

export function EstadoChip({ codigo, nombre, selected, onPress }: EstadoChipProps) {
  const token = colors.estado[estadoTokenKey(codigo)];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        { borderColor: token },
        selected && { backgroundColor: token },
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.label, selected && styles.labelSelected, !selected && { color: token }]}>
        {nombre}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: touchMin,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fonts.caption,
    fontWeight: '700',
  },
  labelSelected: {
    color: colors.background,
  },
});
