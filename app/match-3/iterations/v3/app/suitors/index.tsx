import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SuitorGlyph } from '../../src/components/SuitorGlyph';
import { colors, fonts, radius, relationColors, spacing } from '../../src/constants/theme';
import { COUNTRIES } from '../../src/data/countries';
import {
  matchesPreference,
  suitorsForCountry,
} from '../../src/data/suitors';
import {
  relationshipStatus,
  statusLabel,
} from '../../src/engine/affinity';
import { useProgress } from '../../src/hooks/ProgressProvider';
import { isCountryUnlocked } from '../../src/modules/progress/progressStore';

export default function SuitorsScreen() {
  const { progress } = useProgress();
  const preference = progress.profile?.preference ?? 'ambos';

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Pretendientes</Text>
      <Text style={styles.meta}>
        Preferencia: {preference}. Retratos de elenco en un pase posterior.
      </Text>

      <ScrollView contentContainerStyle={styles.list}>
        {COUNTRIES.map((country) => {
          const unlocked = isCountryUnlocked(progress, country.order);
          const suitors = suitorsForCountry(country.id).filter((s) =>
            matchesPreference(s, preference),
          );
          return (
            <View key={country.id} style={styles.block}>
              <Text style={styles.country}>
                {unlocked ? '●' : '○'} {country.name}
              </Text>
              {suitors.map((s) => {
                const aff = progress.affinityBySuitor[s.id] ?? 0;
                const status = relationshipStatus(
                  aff,
                  progress.partnerId === s.id,
                  progress.partnerId != null,
                );
                return (
                  <Pressable
                    key={s.id}
                    disabled={!unlocked}
                    onPress={() => router.push(`/suitors/${s.id}`)}
                    style={[styles.row, !unlocked && styles.locked]}
                  >
                    <SuitorGlyph name={s.name} slot={s.slot} />
                    <View style={styles.rowText}>
                      <Text style={styles.name}>{s.name}</Text>
                      <Text
                        style={[
                          styles.status,
                          { color: relationColors[status] },
                        ]}
                      >
                        {unlocked
                          ? `${statusLabel(status)} · ${aff}`
                          : 'Bloqueado'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <PrimaryButton
        label="Volver"
        variant="ghost"
        onPress={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.brand,
    fontSize: 28,
    color: colors.textOnDark,
  },
  meta: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  list: { gap: spacing.lg, paddingBottom: spacing.lg },
  block: { gap: 8 },
  country: {
    fontFamily: fonts.body,
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locked: { opacity: 0.45 },
  rowText: { flex: 1 },
  name: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
});
