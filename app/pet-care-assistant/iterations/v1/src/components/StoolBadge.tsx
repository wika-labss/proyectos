import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getStoolMeta, type StoolCode } from '../engine';
import { colors, fonts, radius, spacing } from '../constants/theme';

const severityColor = {
  ok: colors.accent,
  warning: colors.warning,
  error: colors.error,
} as const;

export function StoolBadge({ code }: { code: StoolCode }) {
  const meta = getStoolMeta(code);
  return (
    <View style={[styles.badge, { backgroundColor: severityColor[meta.severity] }]}>
      <Text style={styles.text}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    color: colors.surface,
    fontSize: fonts.sizeSm,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
});
