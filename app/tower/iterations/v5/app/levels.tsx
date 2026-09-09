import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEVEL_COUNT } from '../src/constants/game';
import {
  colors,
  fontWeight,
  spacing,
  typography,
} from '../src/design-system/tokens';
import { listMaps } from '../src/engine/mapCatalog';
import { useGame } from '../src/hooks/GameProvider';
import {
  KeepBackdrop,
  MapCard,
  OrnamentSub,
  StoneButton,
} from '../src/modules/tower-ui-kit';

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
          <View style={styles.back}>
            <StoneButton
              label="Menú"
              variant="ghost"
              compact
              onPress={() => router.back()}
            />
          </View>
          <Text style={styles.title}>Campañas</Text>
          <OrnamentSub label="25 frentes" tone="gold" />
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
    alignItems: 'center',
  },
  back: {
    alignSelf: 'stretch',
  },
  title: {
    color: colors.torchGold,
    fontSize: typography.title,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40 },
});
