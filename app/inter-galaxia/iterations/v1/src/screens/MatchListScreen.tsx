import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoryHeader } from '../components/CategoryHeader';
import { useCategory } from '../context/CategoryContext';
import { getApiClient } from '../api';
import type { Match } from '../api/types';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Matches'>,
  NativeStackScreenProps<RootStackParamList>
>;

function statusLabel(status: Match['status']) {
  switch (status) {
    case 'scheduled':
      return 'Programado';
    case 'in_progress':
      return 'En juego';
    case 'finished':
      return 'Finalizado';
    case 'cancelled':
      return 'Suspendido';
    default:
      return status;
  }
}

export function MatchListScreen({ navigation }: Props) {
  const { categoryId } = useCategory();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      setMatches(await getApiClient().listMatches(categoryId));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <CategoryHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Partidos</Text>
      </View>
      {loading && matches.length === 0 ? (
        <ActivityIndicator color="#1B5E20" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No hay partidos cargados.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.opponent}>vs {item.opponent}</Text>
                <Text style={styles.status}>{statusLabel(item.status)}</Text>
              </View>
              <Text style={styles.meta}>
                {new Date(item.date).toLocaleString('es-AR')} · {item.isHome ? 'Local' : 'Visitante'}
              </Text>
              {item.status === 'finished' && item.goalsFor != null && item.goalsAgainst != null ? (
                <Text style={styles.score}>
                  Resultado: {item.goalsFor} - {item.goalsAgainst}
                </Text>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D3B1E' },
  header: { padding: 16, backgroundColor: '#E8F5E9' },
  title: { fontSize: 20, fontWeight: '800', color: '#1B5E20' },
  list: { padding: 16, backgroundColor: '#E8F5E9', flexGrow: 1 },
  empty: { textAlign: 'center', color: '#558B2F', marginTop: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  opponent: { fontWeight: '800', fontSize: 16, color: '#212121' },
  status: { color: '#1B5E20', fontWeight: '700', fontSize: 12 },
  meta: { color: '#616161', marginTop: 6, fontSize: 13 },
  score: { marginTop: 6, fontWeight: '700', color: '#33691E' },
});
