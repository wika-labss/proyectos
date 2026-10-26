import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getApiClient } from '../api';
import type { Player } from '../api/types';
import { POSITION_CATALOG } from '../constants/positions';
import { useCategory } from '../context/CategoryContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlayerForm'>;

const emptyForm = (categoryId: string): Omit<Player, 'id'> => ({
  categoryId,
  firstName: '',
  lastName: '',
  positionCode: 'MC',
  active: true,
});

export function PlayerFormScreen({ route, navigation }: Props) {
  const { categoryId } = useCategory();
  const playerId = route.params?.playerId;
  const [form, setForm] = useState<Omit<Player, 'id'> | Player>(
    emptyForm(categoryId ?? 'cat-primera'),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: playerId ? 'Editar jugador' : 'Nuevo jugador' });
  }, [navigation, playerId]);

  useEffect(() => {
    if (!playerId) {
      if (categoryId) setForm(emptyForm(categoryId));
      return;
    }
    void getApiClient()
      .getPlayer(playerId)
      .then((p) => {
        if (p) setForm(p);
      });
  }, [playerId, categoryId]);

  const update = <K extends keyof Omit<Player, 'id'>>(key: K, value: Omit<Player, 'id'>[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('Datos incompletos', 'Nombre y apellido son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const api = getApiClient();
      if ('id' in form) {
        await api.updatePlayer(form);
      } else {
        await api.createPlayer(form);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={form.firstName} onChangeText={(v) => update('firstName', v)} />
      <Text style={styles.label}>Apellido</Text>
      <TextInput style={styles.input} value={form.lastName} onChangeText={(v) => update('lastName', v)} />
      <Text style={styles.label}>Apodo</Text>
      <TextInput style={styles.input} value={form.nickname ?? ''} onChangeText={(v) => update('nickname', v)} />
      <Text style={styles.label}>Posición</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.posRow}>
        {POSITION_CATALOG.map((p) => {
          const active = form.positionCode === p.code;
          return (
            <Pressable
              key={p.code}
              style={[styles.posChip, active && styles.posChipActive]}
              onPress={() => update('positionCode', p.code)}
            >
              <Text style={[styles.posChipText, active && styles.posChipTextActive]}>{p.code}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={styles.label}>Número</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={form.jerseyNumber != null ? String(form.jerseyNumber) : ''}
        onChangeText={(v) => update('jerseyNumber', v ? Number(v) : undefined)}
      />
      <Text style={styles.label}>Teléfono</Text>
      <TextInput style={styles.input} value={form.phone ?? ''} onChangeText={(v) => update('phone', v)} />
      <Text style={styles.label}>Cuota mensual</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={form.monthlyFee != null ? String(form.monthlyFee) : ''}
        onChangeText={(v) => update('monthlyFee', v ? Number(v) : undefined)}
      />
      <View style={styles.switchRow}>
        <Text style={styles.label}>Activo</Text>
        <Switch value={form.active} onValueChange={(v) => update('active', v)} />
      </View>
      <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={() => void save()}>
        <Text style={styles.saveBtnText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  label: { fontWeight: '700', color: '#1B5E20', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  posRow: { marginBottom: 4 },
  posChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginRight: 8,
  },
  posChipActive: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  posChipText: { fontWeight: '700', color: '#33691E' },
  posChipTextActive: { color: '#FFD54F' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  saveBtn: {
    marginTop: 24,
    backgroundColor: '#1B5E20',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFD54F', fontWeight: '800', fontSize: 16 },
});
