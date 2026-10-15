import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import {
  AgentStatus,
  configureBroker,
  getAgentStatus,
  getDeviceId,
  moveAppToBackground,
  startWatchdog,
} from '../src/native';

const BROKER_WS =
  process.env.EXPO_PUBLIC_BROKER_WS_URL || 'ws://192.168.1.100:8787/ws/device';

type CheckState = 'pending' | 'running' | 'ok' | 'warn' | 'fail';
type CheckId = 'native' | 'owner' | 'location' | 'service' | 'broker' | 'ws';

type CheckItem = {
  id: CheckId;
  label: string;
  critical: boolean;
  state: CheckState;
  detail?: string;
};

const INITIAL_CHECKS: CheckItem[] = [
  { id: 'native', label: 'Módulo nativo', critical: true, state: 'pending' },
  { id: 'owner', label: 'Propietario del dispositivo', critical: false, state: 'pending' },
  { id: 'location', label: 'Permiso de ubicación', critical: false, state: 'pending' },
  { id: 'service', label: 'Servicio en segundo plano', critical: true, state: 'pending' },
  { id: 'broker', label: 'Broker configurado', critical: true, state: 'pending' },
  { id: 'ws', label: 'Conexión con el broker', critical: true, state: 'pending' },
];

const ICON: Record<CheckState, string> = {
  pending: '○',
  running: '…',
  ok: '✓',
  warn: '!',
  fail: '×',
};

const COLOR: Record<CheckState, string> = {
  pending: '#475569',
  running: '#38bdf8',
  ok: '#22c55e',
  warn: '#f59e0b',
  fail: '#ef4444',
};

export default function SilentAgentScreen() {
  const [checks, setChecks] = useState<CheckItem[]>(INITIAL_CHECKS);
  const [deviceId, setDeviceId] = useState<string>('…');
  const [status, setStatus] = useState<AgentStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    const patch = (id: CheckId, next: Partial<CheckItem>) =>
      setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...next } : c)));

    (async () => {
      if (Platform.OS !== 'android') {
        patch('native', { state: 'fail', detail: 'Solo Android' });
        return;
      }

      patch('native', { state: 'running' });
      const probe = await getAgentStatus();
      if (!probe) {
        patch('native', { state: 'fail', detail: 'Módulo nativo no enlazado' });
        return;
      }
      patch('native', { state: 'ok' });

      patch('location', { state: 'running' });
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        patch('location', perm === 'granted' ? { state: 'ok' } : { state: 'warn', detail: 'Sin permiso (LOCATE limitado)' });
      } catch {
        patch('location', { state: 'warn', detail: 'No disponible' });
      }

      patch('service', { state: 'running' });
      try {
        await startWatchdog();
        patch('service', { state: 'ok' });
      } catch (error) {
        patch('service', { state: 'fail', detail: String(error) });
      }

      patch('broker', { state: 'running' });
      try {
        await configureBroker(BROKER_WS);
        patch('broker', { state: 'ok', detail: BROKER_WS });
      } catch (error) {
        patch('broker', { state: 'fail', detail: String(error) });
      }

      try {
        const id = await getDeviceId();
        if (!cancelled) setDeviceId(id);
      } catch {
        /* id se mostrará cuando el nativo responda */
      }
    })().catch(() => {});

    const timer = setInterval(async () => {
      const snapshot = await getAgentStatus();
      if (!snapshot || cancelled) return;
      setStatus(snapshot);
      patch('owner', snapshot.isDeviceOwner ? { state: 'ok' } : { state: 'warn', detail: 'No es Device Owner (LOCK/REBOOT limitados)' });
      patch(
        'broker',
        snapshot.brokerConfigured
          ? { state: 'ok', detail: snapshot.brokerUrl ?? BROKER_WS }
          : { state: 'running', detail: 'Configurando…' },
      );
      patch(
        'ws',
        snapshot.wsConnected
          ? { state: 'ok', detail: 'Online' }
          : { state: 'running', detail: snapshot.networkOk ? 'Conectando…' : 'Sin internet' },
      );
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const criticalOk = useMemo(
    () => checks.filter((c) => c.critical).every((c) => c.state === 'ok'),
    [checks],
  );

  const resolved = useMemo(
    () => checks.filter((c) => c.state === 'ok' || c.state === 'warn' || c.state === 'fail').length,
    [checks],
  );
  const progress = Math.round((resolved / checks.length) * 100);

  useEffect(() => {
    if (!criticalOk) return;
    // Agente silencioso: una vez todo lo crítico está OK, pasar a segundo plano.
    const t = setTimeout(() => {
      void moveAppToBackground();
    }, 4000);
    return () => clearTimeout(t);
  }, [criticalOk]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Geo Empresa</Text>
      <Text style={styles.sub}>Experimento 0 · verificación de arranque</Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: criticalOk ? '#22c55e' : '#38bdf8' },
          ]}
        />
      </View>
      <Text style={styles.progressLabel}>
        {progress}% · {criticalOk ? 'Agente activo' : 'Iniciando procesos…'}
      </Text>

      <View style={styles.list}>
        {checks.map((c) => (
          <View key={c.id} style={styles.item}>
            <Text style={[styles.itemIcon, { color: COLOR[c.state] }]}>{ICON[c.state]}</Text>
            <View style={styles.itemBody}>
              <Text style={styles.itemLabel}>{c.label}</Text>
              {c.detail ? <Text style={styles.itemDetail}>{c.detail}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.mono}>{deviceId}</Text>
      <Text style={styles.hint}>
        {status?.wsConnected
          ? 'Conectado. Puedes minimizar; el servicio sigue en segundo plano.'
          : `Broker: ${BROKER_WS}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 24,
  },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  sub: { color: '#94A3B8', marginTop: 6, marginBottom: 22, textAlign: 'center' },
  progressTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 6 },
  progressLabel: { color: '#cbd5e1', marginTop: 8, marginBottom: 18, textAlign: 'center', fontSize: 13 },
  list: { gap: 10 },
  item: { flexDirection: 'row', alignItems: 'flex-start' },
  itemIcon: { width: 24, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  itemBody: { flex: 1, marginLeft: 8 },
  itemLabel: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  itemDetail: { color: '#64748b', fontSize: 11, marginTop: 2 },
  mono: { color: '#93C5FD', marginTop: 24, fontSize: 12, textAlign: 'center' },
  hint: { color: '#64748B', marginTop: 10, fontSize: 11, textAlign: 'center' },
});
