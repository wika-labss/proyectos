import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormationPitch } from '../components/FormationPitch';
import { getApiClient } from '../api';
import type { FormationPreset, LineupRole, Match, Player } from '../api/types';
import { suggestLineupForPreset } from '../mock/suggest';
import { scheduleMatchReminder } from '../utils/notifications';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchDetail'>;

type TabKey = 'info' | 'nomina' | 'formacion' | 'resultado' | 'pagos';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Info' },
  { key: 'nomina', label: 'Nómina' },
  { key: 'formacion', label: 'Formación' },
  { key: 'resultado', label: 'Resultado' },
  { key: 'pagos', label: 'Pagos' },
];

export function MatchDetailScreen({ route }: Props) {
  const { matchId } = route.params;
  const [tab, setTab] = useState<TabKey>('info');
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [presets, setPresets] = useState<FormationPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const m = await api.getMatch(matchId);
      if (!m) {
        setMatch(null);
        return;
      }
      const [plist, plistPresets] = await Promise.all([
        api.listPlayers(m.categoryId),
        api.listFormationPresets(),
      ]);
      setMatch(m);
      setPlayers(plist);
      setPresets(plistPresets);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const playersById = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players],
  );

  const preset = useMemo(() => {
    const id = match?.formationPresetId ?? presets[0]?.id;
    return presets.find((p) => p.id === id) ?? presets[0] ?? null;
  }, [match?.formationPresetId, presets]);

  const persist = async (next: Match) => {
    setSaving(true);
    try {
      const saved = await getApiClient().updateMatch(next);
      setMatch(saved);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const setLineupRole = (playerId: string, role: LineupRole) => {
    if (!match) return;
    const existing = match.lineup.find((l) => l.playerId === playerId);
    const lineup = existing
      ? match.lineup.map((l) => (l.playerId === playerId ? { ...l, role } : l))
      : [...match.lineup, { playerId, role }];
    void persist({ ...match, lineup });
  };

  const applyPreset = (presetId: string) => {
    if (!match) return;
    const p = presets.find((x) => x.id === presetId);
    if (!p) return;
    const formation = suggestLineupForPreset(p, players);
    void persist({
      ...match,
      formationPresetId: presetId,
      formation,
      lineup: formation
        .filter((f) => f.playerId)
        .map((f) => ({ playerId: f.playerId!, role: 'starter' as const })),
    });
  };

  const togglePayment = (paymentId: string) => {
    if (!match) return;
    const payments = match.payments.map((pay) =>
      pay.id === paymentId
        ? {
            ...pay,
            paid: !pay.paid,
            paidAt: !pay.paid ? new Date().toISOString() : undefined,
          }
        : pay,
    );
    void persist({ ...match, payments });
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} color="#1B5E20" />;
  if (!match) return <Text style={styles.missing}>Partido no encontrado.</Text>;

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.panel}>
        {saving ? <Text style={styles.saving}>Guardando…</Text> : null}

        {tab === 'info' && (
          <>
            <Text style={styles.title}>vs {match.opponent}</Text>
            <Text style={styles.line}>{new Date(match.date).toLocaleString('es-AR')}</Text>
            <Text style={styles.line}>{match.venue}</Text>
            <Text style={styles.line}>{match.isHome ? 'Local' : 'Visitante'}</Text>
            {match.notes ? <Text style={styles.notes}>{match.notes}</Text> : null}
            <Pressable
              style={styles.btn}
              onPress={() => {
                void scheduleMatchReminder(match.id, match.opponent, new Date(match.date)).then(
                  (id) => {
                    if (id) Alert.alert('Recordatorio', 'Notificación programada 1 h antes.');
                    else Alert.alert('Recordatorio', 'No se pudo programar (permisos o fecha).');
                  },
                );
              }}
            >
              <Text style={styles.btnText}>Programar recordatorio</Text>
            </Pressable>
          </>
        )}

        {tab === 'nomina' && (
          <>
            <Text style={styles.section}>Plantel — rol en el partido</Text>
            {players.map((p) => {
              const entry = match.lineup.find((l) => l.playerId === p.id);
              const role = entry?.role ?? 'absent';
              return (
                <View key={p.id} style={styles.nominaRow}>
                  <Text style={styles.nominaName}>
                    #{p.jerseyNumber ?? '–'} {p.lastName}
                  </Text>
                  <View style={styles.roleRow}>
                    {(['starter', 'substitute', 'absent'] as LineupRole[]).map((r) => (
                      <Pressable
                        key={r}
                        style={[styles.roleChip, role === r && styles.roleChipActive]}
                        onPress={() => setLineupRole(p.id, r)}
                      >
                        <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                          {r === 'starter' ? 'Titular' : r === 'substitute' ? 'Suplente' : 'Ausente'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {tab === 'formacion' && preset && (
          <>
            <Text style={styles.section}>Esquema táctico</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
              {presets.map((p) => (
                <Pressable
                  key={p.id}
                  style={[
                    styles.presetChip,
                    match.formationPresetId === p.id && styles.presetChipActive,
                  ]}
                  onPress={() => applyPreset(p.id)}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      match.formationPresetId === p.id && styles.presetChipTextActive,
                    ]}
                  >
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <FormationPitch
              preset={preset}
              playersById={playersById}
              assignments={match.formation}
            />
          </>
        )}

        {tab === 'resultado' && (
          <>
            <Text style={styles.section}>Marcador</Text>
            <View style={styles.scoreRow}>
              <TextInput
                style={styles.scoreInput}
                keyboardType="number-pad"
                value={match.goalsFor != null ? String(match.goalsFor) : ''}
                onChangeText={(v) =>
                  setMatch({ ...match, goalsFor: v === '' ? undefined : Number(v) })
                }
              />
              <Text style={styles.scoreSep}>-</Text>
              <TextInput
                style={styles.scoreInput}
                keyboardType="number-pad"
                value={match.goalsAgainst != null ? String(match.goalsAgainst) : ''}
                onChangeText={(v) =>
                  setMatch({ ...match, goalsAgainst: v === '' ? undefined : Number(v) })
                }
              />
            </View>
            <Pressable
              style={styles.btn}
              onPress={() =>
                void persist({
                  ...match,
                  status: 'finished',
                })
              }
            >
              <Text style={styles.btnText}>Guardar resultado</Text>
            </Pressable>
          </>
        )}

        {tab === 'pagos' && (
          <>
            <Text style={styles.section}>Pagos del partido</Text>
            {match.payments.length === 0 ? (
              <Text style={styles.empty}>Sin pagos cargados.</Text>
            ) : (
              match.payments.map((pay) => (
                <Pressable key={pay.id} style={styles.payRow} onPress={() => togglePayment(pay.id)}>
                  <View>
                    <Text style={styles.payName}>
                      {playersById[pay.playerId]?.lastName ?? pay.playerId}
                    </Text>
                    <Text style={styles.payMeta}>
                      ${pay.amount} · {pay.concept}
                    </Text>
                  </View>
                  <Text style={[styles.payStatus, pay.paid && styles.payStatusOk]}>
                    {pay.paid ? 'Pagado' : 'Pendiente'}
                  </Text>
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#E8F5E9' },
  tabBar: { maxHeight: 48, backgroundColor: '#1B5E20' },
  tab: { paddingHorizontal: 14, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#FFD54F' },
  tabText: { color: '#A5D6A7', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#FFD54F' },
  panel: { padding: 16, paddingBottom: 32 },
  missing: { padding: 16 },
  saving: { color: '#558B2F', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#1B5E20' },
  line: { color: '#424242', marginTop: 6, fontSize: 15 },
  notes: { marginTop: 12, color: '#33691E', fontStyle: 'italic' },
  section: { fontSize: 17, fontWeight: '800', color: '#1B5E20', marginBottom: 10 },
  btn: {
    marginTop: 16,
    backgroundColor: '#1B5E20',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#FFD54F', fontWeight: '700' },
  nominaRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  nominaName: { fontWeight: '700', marginBottom: 8 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F8E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  roleChipActive: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  roleChipText: { fontSize: 11, fontWeight: '700', color: '#33691E' },
  roleChipTextActive: { color: '#FFD54F' },
  presetRow: { marginBottom: 8 },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  presetChipActive: { backgroundColor: '#FFD54F', borderColor: '#FFC107' },
  presetChipText: { fontWeight: '700', color: '#33691E' },
  presetChipTextActive: { color: '#1B5E20' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  scoreSep: { fontSize: 24, fontWeight: '800' },
  empty: { color: '#558B2F' },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  payName: { fontWeight: '700', color: '#212121' },
  payMeta: { color: '#616161', fontSize: 13, marginTop: 2 },
  payStatus: { fontWeight: '800', color: '#C62828' },
  payStatusOk: { color: '#2E7D32' },
});
