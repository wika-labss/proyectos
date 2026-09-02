import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, fonts, spacing, typography } from '../../src/constants/theme';
import { COUNTRIES } from '../../src/data/countries';
import {
  matchesPreference,
  suitorsForCountry,
} from '../../src/data/suitors';
import { relationshipStatus } from '../../src/engine/affinity';
import { useProgress } from '../../src/hooks/ProgressProvider';
import { Match3SuitorBust } from '../../src/modules/match3-ui-kit/Match3SuitorBust';
import { RelationChip } from '../../src/modules/match3-ui-kit/RelationChip';
import { DiamondRule } from '../../src/modules/match3-visual/DiamondRule';
import { NightScreen } from '../../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../../src/modules/match3-visual/PixelPanel';
import { isCountryUnlocked } from '../../src/modules/progress/progressStore';

export default function SuitorsScreen() {
  const { progress } = useProgress();
  const preference = progress.profile?.preference ?? 'ambos';

  return (
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <Text style={styles.heart}>♥</Text>
        <Text style={styles.title}>PRETENDIENTES</Text>
        <Text style={styles.meta}>Preferencia: {preference}</Text>

        <ScrollView contentContainerStyle={styles.list}>
          {COUNTRIES.map((country) => {
            const unlocked = isCountryUnlocked(progress, country.order);
            const suitors = suitorsForCountry(country.id).filter((s) =>
              matchesPreference(s, preference),
            );
            return (
              <View key={country.id} style={styles.block}>
                <Text style={styles.country}>
                  {unlocked ? '●' : '○'} {country.name.toUpperCase()}
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
                    >
                      <PixelPanel>
                        <View style={[styles.row, !unlocked && styles.locked]}>
                          <Match3SuitorBust
                            countryId={s.countryId}
                            slot={s.slot}
                            size={72}
                          />
                          <View style={styles.rowText}>
                            <Text style={styles.name}>{s.name.toUpperCase()}</Text>
                            <DiamondRule />
                            {unlocked ? (
                              <RelationChip status={status} />
                            ) : (
                              <Text style={styles.blocked}>BLOQUEADO</Text>
                            )}
                          </View>
                        </View>
                      </PixelPanel>
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
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
  },
  heart: {
    textAlign: 'center',
    color: colors.ligue,
    fontSize: 14,
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: typography.title,
    color: colors.star,
    textAlign: 'center',
  },
  meta: {
    fontFamily: fonts.pixel,
    fontSize: typography.sm,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  list: { gap: spacing.lg, paddingBottom: spacing.lg },
  block: { gap: 10 },
  country: {
    fontFamily: fonts.pixel,
    color: colors.cyanHi,
    fontSize: typography.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locked: { opacity: 0.45 },
  rowText: { flex: 1 },
  name: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontSize: typography.body,
  },
  blocked: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.muted,
  },
});
