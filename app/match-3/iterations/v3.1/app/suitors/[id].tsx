import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, fonts, radius, relationColors, spacing, typography } from '../../src/constants/theme';
import { getCountry } from '../../src/data/countries';
import { giftTitle } from '../../src/data/gifts';
import { getSuitor } from '../../src/data/suitors';
import {
  AFFINITY,
  giftDelta,
  giftNumberFromRewardId,
  relationshipStatus,
  statusLabel,
} from '../../src/engine/affinity';
import { useProgress } from '../../src/hooks/ProgressProvider';
import { Match3SuitorBust } from '../../src/modules/match3-ui-kit/Match3SuitorBust';
import { RelationChip } from '../../src/modules/match3-ui-kit/RelationChip';
import { VisualAssets } from '../../src/modules/match3-visual/assets';
import { DiamondRule } from '../../src/modules/match3-visual/DiamondRule';
import { NightScreen } from '../../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../../src/modules/match3-visual/PixelPanel';
import { SheetSprite } from '../../src/modules/match3-visual/SheetSprite';
import { isCountryUnlocked } from '../../src/modules/progress/progressStore';

export default function SuitorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const suitor = getSuitor(id ?? '');
  const { progress, sendGift } = useProgress();

  if (!suitor) {
    return (
      <NightScreen>
        <View style={styles.center}>
          <Text style={styles.title}>No encontrado</Text>
          <PrimaryButton label="Volver" onPress={() => router.back()} />
        </View>
      </NightScreen>
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
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <PixelPanel>
          <View style={styles.header}>
            <Match3SuitorBust
              countryId={suitor.countryId}
              slot={suitor.slot}
              size={120}
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>{suitor.name.toUpperCase()}</Text>
              <DiamondRule />
              <Text style={styles.meta}>
                {(country?.name ?? '').toUpperCase()} · {suitor.gender}
              </Text>
              <RelationChip status={status} />
            </View>
          </View>
        </PixelPanel>

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

        <Text style={styles.section}>REGALOS</Text>
        {!unlocked ? (
          <Text style={styles.meta}>Desbloquea el país para regalar.</Text>
        ) : uniqueRewards.length === 0 ? (
          <Text style={styles.meta}>
            Sin regalos. Gana niveles pares (2, 4, 6, 8, 10).
          </Text>
        ) : (
          <ScrollView contentContainerStyle={styles.gifts}>
            {uniqueRewards.map((rewardId) => {
              const n = giftNumberFromRewardId(rewardId);
              const delta = giftDelta(n, suitor.slot);
              const count = progress.inventory.filter((i) => i.id === rewardId)
                .length;
              const idx = Math.max(0, Math.min(7, n - 1));
              return (
                <PixelPanel key={rewardId}>
                  <View style={styles.giftRow}>
                    <SheetSprite
                      source={VisualAssets.gifts}
                      cols={4}
                      rows={2}
                      col={idx % 4}
                      row={Math.floor(idx / 4)}
                      size={40}
                    />
                    <View style={styles.giftInfo}>
                      <Text style={styles.giftName}>{giftTitle(rewardId)}</Text>
                      <Text style={styles.giftDelta}>
                        ×{count} · {delta > 2 ? '+10 slot' : '+2'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => void sendGift(suitor.id, rewardId)}
                      style={styles.giveBtn}
                    >
                      <Text style={styles.giveLabel}>DAR</Text>
                    </Pressable>
                  </View>
                </PixelPanel>
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
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: fonts.pixel,
    fontSize: typography.title,
    color: colors.star,
  },
  meta: {
    fontFamily: fonts.pixel,
    fontSize: typography.sm,
    color: colors.muted,
    marginTop: 4,
  },
  status: {
    fontFamily: fonts.pixel,
    fontSize: typography.sm,
    marginBottom: 8,
  },
  barTrack: {
    height: 10,
    backgroundColor: colors.nightDeep,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.cyan,
  },
  barFill: {
    height: '100%',
  },
  section: {
    fontFamily: fonts.pixel,
    color: colors.cyanHi,
    fontSize: typography.sm,
    marginBottom: 8,
  },
  gifts: { gap: 8, paddingBottom: spacing.lg },
  giftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  giftInfo: { flex: 1 },
  giftName: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontSize: typography.body,
  },
  giftDelta: {
    color: colors.muted,
    fontFamily: fonts.pixel,
    fontSize: 8,
    marginTop: 2,
  },
  giveBtn: {
    backgroundColor: colors.cyan,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  giveLabel: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontSize: 8,
    fontWeight: '700',
  },
});
