import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PetHealth } from '../engine';
import { colors, fonts, radius, spacing } from '../constants/theme';

export function HealthBanner({ health }: { health?: PetHealth }) {
  if (!health || health.status === 'sano') return null;
  const tone = health.status === 'enfermo' ? colors.error : colors.warning;
  const label = health.status === 'enfermo' ? 'Enfermo' : 'En recuperación';
  return (
    <View style={[styles.box, { borderColor: tone }]}>
      <Text style={[styles.title, { color: tone }]}>
        {label}
        {health.symptoms.length ? ` · ${health.symptoms.join(', ')}` : ''}
      </Text>
      <Text style={styles.disclaimer}>
        Registro del cuidador. No sustituye consulta veterinaria.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: fonts.sizeSm,
    fontFamily: fonts.base,
  },
});
