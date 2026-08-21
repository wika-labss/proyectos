import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

type HoroscopeCardProps = {
  title: string;
  value: string | number;
  accent?: boolean;
};

export function HoroscopeCard({ title, value, accent }: HoroscopeCardProps) {
  return (
    <View style={[styles.card, accent && styles.cardAccent]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardAccent: {
    borderColor: colors.accent,
  },
  title: {
    color: colors.accent,
    fontSize: fonts.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.text,
    fontSize: fonts.body,
    lineHeight: 22,
  },
});
