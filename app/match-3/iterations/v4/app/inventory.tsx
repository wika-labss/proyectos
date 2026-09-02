import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, spacing, typography } from '../src/constants/theme';
import { giftTitle } from '../src/data/gifts';
import { giftNumberFromRewardId } from '../src/engine/affinity';
import { useProgress } from '../src/hooks/ProgressProvider';
import { VisualAssets } from '../src/modules/match3-visual/assets';
import { NightScreen } from '../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../src/modules/match3-visual/PixelPanel';
import { SheetSprite } from '../src/modules/match3-visual/SheetSprite';

export default function InventoryScreen() {
  const { progress } = useProgress();

  return (
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>INVENTARIO</Text>
        <Text style={styles.meta}>
          {progress.inventory.length} regalo
          {progress.inventory.length === 1 ? '' : 's'}
          {' · '}
          {progress.rewardsGranted} ganados
        </Text>

        {progress.inventory.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sin recompensas aún</Text>
          </View>
        ) : (
          <FlatList
            data={progress.inventory}
            keyExtractor={(item, index) => `${item.id}-${item.grantedAt}-${index}`}
            contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
            renderItem={({ item }) => {
              const n = giftNumberFromRewardId(item.id);
              const idx = Math.max(0, Math.min(7, n - 1));
              return (
                <PixelPanel>
                  <View style={styles.item}>
                    <SheetSprite
                      source={VisualAssets.gifts}
                      cols={4}
                      rows={2}
                      col={idx % 4}
                      row={Math.floor(idx / 4)}
                      size={48}
                    />
                    <Text style={styles.itemText}>{giftTitle(item.id)}</Text>
                  </View>
                </PixelPanel>
              );
            }}
          />
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
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: typography.title,
    color: colors.star,
  },
  meta: {
    fontFamily: fonts.pixel,
    fontSize: typography.sm,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.pixel,
    fontSize: typography.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemText: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontSize: typography.body,
    flex: 1,
  },
});
