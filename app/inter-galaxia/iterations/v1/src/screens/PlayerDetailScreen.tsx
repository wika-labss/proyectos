import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getApiClient } from '../api';
import type { Player } from '../api/types';
import { positionLabel } from '../constants/positions';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlayerDetail'>;

export function PlayerDetailScreen({ route, navigation }: Props) {
  const { playerId } = route.params;
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPlayer(await getApiClient().getPlayer(playerId));
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = () => {
    Alert.alert('Eliminar jugador', '¿Confirmás la baja del jugador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void getApiClient()
            .deletePlayer(playerId)
            .then(() => navigation.goBack());
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} color="#1B5E20" />;
  if (!player) return <Text style={styles.missing}>Jugador no encontrado.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.name}>
        {player.firstName} {player.lastName}
      </Text>
      {player.nickname ? <Text style={styles.nick}>"{player.nickname}"</Text> : null}
      <Text style={styles.line}>Posición: {positionLabel(player.positionCode)}</Text>
      <Text style={styles.line}>Número: {player.jerseyNumber ?? '–'}</Text>
      {player.phone ? <Text style={styles.line}>Tel: {player.phone}</Text> : null}
      {player.monthlyFee != null ? (
        <Text style={styles.line}>Cuota mensual: ${player.monthlyFee}</Text>
      ) : null}
      <Text style={styles.line}>Estado: {player.active ? 'Activo' : 'Inactivo'}</Text>

      <Pressable
        style={styles.btn}
        onPress={() => navigation.navigate('PlayerForm', { playerId: player.id })}
      >
        <Text style={styles.btnText}>Editar</Text>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnDanger]} onPress={remove}>
        <Text style={styles.btnText}>Eliminar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  missing: { padding: 16, color: '#616161' },
  name: { fontSize: 24, fontWeight: '800', color: '#1B5E20' },
  nick: { color: '#558B2F', fontStyle: 'italic', marginBottom: 12 },
  line: { color: '#424242', marginTop: 8, fontSize: 16 },
  btn: {
    marginTop: 20,
    backgroundColor: '#1B5E20',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDanger: { backgroundColor: '#C62828' },
  btnText: { color: '#fff', fontWeight: '700' },
});
