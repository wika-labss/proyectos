import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { getApiClient } from '../api';
import type { PaymentRecord, Player } from '../api/types';
import { useCategory } from '../context/CategoryContext';

export function PaymentHistoryScreen() {
  const { categoryId } = useCategory();
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const api = getApiClient();
      const [r, p] = await Promise.all([
        api.listPaymentHistory(categoryId),
        api.listPlayers(categoryId),
      ]);
      setRecords(r);
      setPlayers(p);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const nameById = Object.fromEntries(
    players.map((p) => [p.id, `${p.firstName} ${p.lastName}`]),
  );

  return (
    <View style={styles.wrap}>
      {loading && records.length === 0 ? (
        <ActivityIndicator color="#1B5E20" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Sin pagos registrados.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{nameById[item.playerId] ?? item.playerId}</Text>
              <Text style={styles.concept}>{item.concept}</Text>
              <Text style={styles.meta}>
                ${item.amount} · {new Date(item.paidAt).toLocaleDateString('es-AR')}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#E8F5E9' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#558B2F', marginTop: 24 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  name: { fontWeight: '800', color: '#1B5E20' },
  concept: { color: '#424242', marginTop: 4 },
  meta: { color: '#616161', marginTop: 4, fontSize: 13 },
});
