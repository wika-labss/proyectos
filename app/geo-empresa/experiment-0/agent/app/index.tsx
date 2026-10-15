import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import {
  configureBroker,
  getDeviceId,
  moveAppToBackground,
  startWatchdog,
} from '../src/native';

const BROKER_WS =
  process.env.EXPO_PUBLIC_BROKER_WS_URL || 'ws://192.168.1.100:8787/ws/device';

export default function SilentAgentScreen() {
  const [deviceId, setDeviceId] = useState<string>('…');
  const [status, setStatus] = useState('Iniciando…');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (Platform.OS !== 'android') {
        setStatus('Solo Android');
        return;
      }

      try {
        await Location.requestForegroundPermissionsAsync();
      } catch {
        /* LOCATE puede fallar sin permiso; el servicio sigue */
      }

      await startWatchdog();
      await configureBroker(BROKER_WS);
      const id = await getDeviceId();
      if (!cancelled) {
        setDeviceId(id);
        setStatus('Agente activo · segundo plano');
      }

      setTimeout(() => {
        void moveAppToBackground();
      }, 2500);
    })().catch((error) => {
      if (!cancelled) setStatus(String(error));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Geo Empresa</Text>
      <Text style={styles.sub}>Experimento 0 · admin directo</Text>
      <Text style={styles.mono}>{deviceId}</Text>
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.hint}>Broker: {BROKER_WS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { color: '#F8FAFC', fontSize: 22, fontWeight: '700' },
  sub: { color: '#94A3B8', marginTop: 8 },
  mono: { color: '#93C5FD', marginTop: 16, fontSize: 12 },
  status: { color: '#22C55E', marginTop: 12 },
  hint: { color: '#64748B', marginTop: 24, fontSize: 11, textAlign: 'center' },
});
