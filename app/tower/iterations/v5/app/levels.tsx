import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEVEL_COUNT } from '../src/constants/game';
import { colors, spacing, typography } from '../src/design-system/tokens';
import { listMaps } from '../src/engine/mapCatalog';
import { useGame } from '../src/hooks/GameProvider';
import { KeepBackdrop, MapCard, StoneButton } from '../src/modules/tower-ui-kit';

export default function LevelsScreen() {
  const router = useRouter();
  const { campaign, refreshCampaign, startLevel } = useGame();
  const maps = listMaps();

  useEffect(() => {
    void refreshCampaign();
  }, [refreshCampaign]);

  return (
    <KeepBackdrop variant="menu">
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <StoneButton label="← Menú" variant="ghost" onPress={() => router.back()} />
          <Text style={styles.title}>Campañas</Text>
          <Text style={styles.sub}>25 frentes · desbloqueo secuencial</Text>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {Array.from({ length: LEVEL_COUNT }, (_, i) => {
            const level = i + 1;
            const unlocked = level <= campaign.maxUnlockedLevel;
            const map = maps[i]!;
            return (
              <MapCard
                key={map.id}
                level={level}
                name={map.name}
                motif={map.motif}
                unlocked={unlocked}
                accent={map.palette.accent}
                onPress={() => {
                  startLevel(level);
                  router.push('/game');
                }}
              />
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </KeepBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    color: colors.mist,
    fontSize: typography.title,
    fontWeight: '900',
  },
  sub: { color: colors.muted, fontSize: typography.sm },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40 },
});
