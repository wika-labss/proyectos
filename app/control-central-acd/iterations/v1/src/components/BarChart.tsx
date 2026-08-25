import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing, touchMin } from '../constants/theme';
import type { ChartBar } from '../engine/resumen';
import { chartMax } from '../engine/resumen';

type BarChartProps = {
  title: string;
  bars: ChartBar[];
  onPressBar?: (bar: ChartBar) => void;
};

export function BarChart({ title, bars, onPressBar }: BarChartProps) {
  const max = chartMax(bars) || 1;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {bars.length === 0 ? (
        <Text style={styles.empty}>Sin datos en este filtro</Text>
      ) : (
        bars.map((bar) => {
          const width = `${Math.max(8, Math.round((bar.value / max) * 100))}%`;
          const inner = (
            <View style={styles.row}>
              <Text style={styles.label} numberOfLines={1}>
                {bar.label}
              </Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: width as `${number}%` }]} />
              </View>
            </View>
          );
          if (!onPressBar) {
            return (
              <View key={bar.key} style={styles.hit}>
                {inner}
              </View>
            );
          }
          return (
            <Pressable key={bar.key} onPress={() => onPressBar(bar)} style={styles.hit} accessibilityRole="button">
              {inner}
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: fonts.heading,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    fontSize: fonts.caption,
  },
  hit: {
    minHeight: touchMin,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  row: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: fonts.caption,
  },
  track: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
});
