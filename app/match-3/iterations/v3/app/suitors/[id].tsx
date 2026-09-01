import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SuitorGlyph } from '../../src/components/SuitorGlyph';
import { colors, fonts, radius, relationColors, spacing } from '../../src/constants/theme';
import { getCountry } from '../../src/data/countries';
import { getSuitor } from '../../src/data/suitors';
import {
  AFFINITY,
  giftDelta,
  giftNumberFromRewardId,
  relationshipStatus,
  statusLabel,
} from '../../src/engine/affinity';
import { useProgress } from '../../src/hooks/ProgressProvider';
import { isCountryUnlocked } from '../../src/modules/progress/progressStore';

export default function SuitorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const suitor = getSuitor(id ?? '');
  const { progress, sendGift } = useProgress();

  if (!suitor) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No encontrado</Text>
        <PrimaryButton label="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  const country = getCountry(suitor.countryId);
  const unlocked = country
    ? isCountryUnlocked(progress, country.order)
    : false;
  const aff = progress.affinityBySuitor[suitor.id] ?? 0;
  const status = relationshipStatus(
    aff,
    progress.partnerId === suitor.id,
    progress.partnerId != null,
  );
  const bar = Math.min(1, aff / AFFINITY.matrimonio);

  const uniqueRewards = Array.from(
    new Set(progress.inventory.map((i) => i.id)),
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <SuitorGlyph name={suitor.name} slot={suitor.slot} size={64} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{suitor.name}</Text>
          <Text style={styles.meta}>
            {country?.name} · {suitor.gender}
          </Text>
        </View>
      </View>

      <Text style={[styles.status, { color: relationColors[status] }]}>
        {statusLabel(status)} · {aff} pts
      </Text>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${bar * 100}%`,
              backgroundColor: relationColors[status],
            },
          ]}
        />
      </View>

      <Text style={styles.section}>Regalos</Text>
      {!unlocked ? (
        <Text style={styles.meta}>Desbloquea el país para regalar.</Text>
      ) : uniqueRewards.length === 0 ? (
        <Text style={styles.meta}>
          Sin regalos en inventario. Gana niveles pares (2, 4, 6, 8, 10).
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.gifts}>
          {uniqueRewards.map((rewardId) => {
            const n = giftNumberFromRewardId(rewardId);
            const delta = giftDelta(n, suitor.slot);
            const count = progress.inventory.filter((i) => i.id === rewardId)
              .length;
            return (
              <View key={rewardId} style={styles.giftRow}>
                <View style={styles.giftInfo}>
                  <Text style={styles.giftName}>{rewardId}</Text>
                  <Text style={styles.giftDelta}>
                    ×{count} · {delta > 2 ? '+10 slot' : '+2'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => void sendGift(suitor.id, rewardId)}
                  style={styles.giveBtn}
                >
                  <Text style={styles.giveLabel}>Dar</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}

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
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: spacing.md,
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: fonts.brand,
    fontSize: 28,
    color: colors.textOnDark,
  },
  meta: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginTop: 4,
  },
  status: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  barTrack: {
    height: 10,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  barFill: {
    height: '100%',
  },
  section: {
    fontFamily: fonts.body,
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  gifts: { gap: 8, paddingBottom: spacing.lg },
  giftRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  giftInfo: { flex: 1 },
  giftName: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  giftDelta: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  giveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  giveLabel: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
});
