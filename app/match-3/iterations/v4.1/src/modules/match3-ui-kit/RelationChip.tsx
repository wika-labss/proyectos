import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RelationshipStatus } from '../../engine/affinity';
import { statusLabel } from '../../engine/affinity';
import { colors, fonts, radius, spacing } from '../../design-system';
import { relationColors } from '../../constants/theme';

export function RelationChip({ status }: { status: RelationshipStatus }) {
  return (
    <View style={[styles.chip, { backgroundColor: relationColors[status] }]}>
      <Text style={styles.heart}>♥</Text>
      <Text style={styles.label}>{statusLabel(status).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.outline,
    alignSelf: 'flex-start',
  },
  heart: {
    color: colors.star,
    fontSize: 10,
  },
  label: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontSize: 8,
    fontWeight: '700',
  },
});
