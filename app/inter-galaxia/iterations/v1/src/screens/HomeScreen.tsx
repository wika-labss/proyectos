import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoryHeader } from '../components/CategoryHeader';
import { useCategory } from '../context/CategoryContext';
import { getApiClient } from '../api';
import type { Match, Player } from '../api/types';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { categoryId } = useCategory();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const api = getApiClient();
      const [p, m] = await Promise.all([
        api.listPlayers(categoryId),
        api.listMatches(categoryId),
      ]);
      setPlayers(p);
      setMatches(m);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const upcoming = matches.filter((m) => m.status === 'scheduled').slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <CategoryHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Inter Galaxia DT</Text>
        <Text style={styles.sub}>Gestión de plantel, partidos y pagos</Text>

        {loading ? (
          <ActivityIndicator color="#1B5E20" style={{ marginTop: 24 }} />
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{players.length}</Text>
                <Text style={styles.statLabel}>Jugadores</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{matches.length}</Text>
                <Text style={styles.statLabel}>Partidos</Text>
              </View>
            </View>

            <Text style={styles.section}>Próximos partidos</Text>
            {upcoming.length === 0 ? (
              <Text style={styles.empty}>Sin partidos programados.</Text>
            ) : (
              upcoming.map((m) => (
                <Pressable
                  key={m.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('MatchDetail', { matchId: m.id })}
                >
                  <Text style={styles.cardTitle}>vs {m.opponent}</Text>
                  <Text style={styles.cardMeta}>
                    {new Date(m.date).toLocaleString('es-AR')} · {m.venue}
                  </Text>
                </Pressable>
              ))
            )}

            <Pressable
              style={styles.linkBtn}
              onPress={() => navigation.navigate('PaymentHistory')}
            >
              <Text style={styles.linkBtnText}>Ver historial de pagos</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D3B1E' },
  content: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: '800', color: '#1B5E20' },
  sub: { color: '#33691E', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  statNum: { fontSize: 28, fontWeight: '800', color: '#1B5E20' },
  statLabel: { color: '#558B2F', marginTop: 4 },
  section: { fontSize: 18, fontWeight: '700', color: '#1B5E20', marginBottom: 8 },
  empty: { color: '#558B2F', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD54F',
  },
  cardTitle: { fontWeight: '700', color: '#1B1B1B', fontSize: 16 },
  cardMeta: { color: '#616161', marginTop: 4, fontSize: 13 },
  linkBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  linkBtnText: { color: '#FFD54F', fontWeight: '700' },
});
