import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEVEL_COUNT } from '../src/constants/game';
import { colors } from '../src/constants/theme';
import { listMaps } from '../src/engine/mapCatalog';
import { useGame } from '../src/hooks/GameProvider';

export default function LevelsScreen() {
  const router = useRouter();
  const { campaign, refreshCampaign, startLevel } = useGame();
  const maps = listMaps();

  useEffect(() => {
    void refreshCampaign();
  }, [refreshCampaign]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>← Menú</Text>
          </Pressable>
          <Text style={styles.title}>Campañas</Text>
          <Text style={styles.sub}>25 frentes · desbloqueo secuencial</Text>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {Array.from({ length: LEVEL_COUNT }, (_, i) => {
            const level = i + 1;
            const unlocked = level <= campaign.maxUnlockedLevel;
            const map = maps[i]!;
            return (
              <Pressable
                key={map.id}
                disabled={!unlocked}
                onPress={() => {
                  startLevel(level);
                  router.push('/game');
                }}
                style={[
                  styles.card,
                  { borderLeftColor: map.palette.accent },
                  !unlocked && styles.locked,
                ]}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.level}>N{level}</Text>
                  <Text style={styles.mapName}>{map.name}</Text>
                </View>
                <Text style={styles.motif}>{map.motif}</Text>
                <Text style={styles.status}>
                  {unlocked ? 'Disponible' : 'Bloqueado'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 4 },
  back: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  title: { color: colors.mist, fontSize: 32, fontWeight: '900' },
  sub: { color: colors.muted, fontSize: 14 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    gap: 4,
  },
  locked: { opacity: 0.4 },
  cardTop: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  level: { color: colors.gold, fontWeight: '800', fontSize: 16 },
  mapName: { color: colors.mist, fontSize: 20, fontWeight: '800' },
  motif: { color: colors.muted, fontSize: 12, textTransform: 'uppercase' },
  status: { color: colors.mist, fontSize: 13, marginTop: 4 },
});
