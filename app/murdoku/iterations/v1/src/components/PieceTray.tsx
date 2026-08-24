import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { getPieceSet, type BoardSize } from '../engine';

type Props = {
  size: BoardSize;
  selectedPiece: number | null;
  onSelect: (id: number) => void;
};

export function PieceTray({ size, selectedPiece, onSelect }: Props) {
  const pieces = getPieceSet(size);

  return (
    <View style={styles.row}>
      {pieces.map((p) => {
        const bg =
          p.kind === 'victim'
            ? colors.victim
            : p.kind === 'killer'
              ? colors.killer
              : colors.suspect;
        const selected = selectedPiece === p.id;
        return (
          <Pressable
            key={p.id}
            onPress={() => onSelect(p.id)}
            style={[
              styles.chip,
              {
                backgroundColor: bg,
                borderColor: selected ? colors.accent : colors.border,
                borderWidth: selected ? 3 : 1,
              },
            ]}
          >
            <Text style={[styles.short, { fontFamily: fonts.body }]}>
              {p.short}
            </Text>
            <Text style={[styles.label, { fontFamily: fonts.body }]} numberOfLines={1}>
              {p.label}
            </Text>
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
    justifyContent: 'center',
  },
  chip: {
    minWidth: 56,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  short: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 16,
  },
  label: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '600',
  },
});
