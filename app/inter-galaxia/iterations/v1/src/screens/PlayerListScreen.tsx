import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoryHeader } from '../components/CategoryHeader';
import { useCategory } from '../context/CategoryContext';
import { getApiClient } from '../api';
import type { Player } from '../api/types';
import { positionLabel } from '../constants/positions';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Players'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function PlayerListScreen({ navigation }: Props) {
  const { categoryId } = useCategory();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      setPlayers(await getApiClient().listPlayers(categoryId));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      void load();
    });
    return unsub;
  }, [navigation, load]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <CategoryHeader />
      <View style={styles.toolbar}>
        <Text style={styles.title}>Plantel</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate('PlayerForm', {})}
        >
          <Text style={styles.addBtnText}>+ Nuevo</Text>
        </Pressable>
      </View>
      {loading && players.length === 0 ? (
        <ActivityIndicator color="#1B5E20" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No hay jugadores en esta categoría.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate('PlayerDetail', { playerId: item.id })}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.jerseyNumber ?? '–'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.meta}>
                  {positionLabel(item.positionCode)}
                  {item.nickname ? ` · "${item.nickname}"` : ''}
                </Text>
              </View>
              {!item.active && <Text style={styles.inactive}>Baja</Text>}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D3B1E' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E8F5E9',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1B5E20' },
  addBtn: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFD54F', fontWeight: '700' },
  list: { padding: 16, backgroundColor: '#E8F5E9', flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontWeight: '800', color: '#1B5E20' },
  name: { fontWeight: '700', color: '#212121' },
  meta: { color: '#616161', fontSize: 13, marginTop: 2 },
  inactive: { color: '#C62828', fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', color: '#558B2F', marginTop: 24 },
});
