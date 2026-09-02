import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderWidth, colors, fonts, radius, spacing } from '../../design-system';

type Kind = 'score' | 'moves' | 'timer' | 'panic' | 'info';

export function Match3HudChip({
  kind,
  label,
  value,
}: {
  kind: Kind;
  label?: string;
  value: string;
}) {
  const accent =
    kind === 'timer'
      ? colors.cyanHi
      : kind === 'panic'
        ? colors.panic
        : kind === 'score'
          ? colors.coin
          : kind === 'moves'
            ? colors.coin
            : colors.star;
  const panic = kind === 'panic';
  return (
    <View style={[styles.chip, panic && styles.panic]}>
      {label ? (
        <Text style={[styles.caption, { color: accent }]} numberOfLines={1}>
          {panic ? `☠ ${label}` : label}
        </Text>
      ) : null}
      <Text
        style={[styles.value, { color: panic ? colors.panic : kind === 'timer' ? colors.cyanHi : colors.star }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    backgroundColor: colors.night,
    borderWidth: borderWidth.outline,
    borderColor: colors.cyan,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  panic: {
    borderColor: colors.panic,
  },
  caption: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    fontWeight: '700',
  },
  value: {
    fontFamily: fonts.pixel,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
