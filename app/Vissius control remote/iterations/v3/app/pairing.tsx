import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { colors, layout } from '../src/constants/theme';
import { ConnectionStatus } from '../src/components/ConnectionStatus';
import { FeedbackBanner } from '../src/components/FeedbackBanner';
import { RemoteButton } from '../src/components/RemoteButton';
import { TvDeviceCard } from '../src/components/TvDeviceCard';
import { usePairing } from '../src/hooks/usePairing';
import { useTvConnection } from '../src/hooks/useTvConnection';
import type { TvDevice, TvProtocol } from '../src/types';

export default function PairingScreen() {
  const {
    connectionState,
    pairedDevice,
    error,
    feedback,
    connect,
    checkWifi,
    forgetDevice,
    clearFeedback,
  } = useTvConnection();
  const { devices, scanning, scanError, scanEmpty, progress, scan, connectByIp } = usePairing();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [wifiWarning, setWifiWarning] = useState<string | null>(null);
  const [manualIp, setManualIp] = useState('');
  const [manualProtocol, setManualProtocol] = useState<TvProtocol | 'auto'>('auto');

  useEffect(() => {
    void (async () => {
      try {
        const onWifi = await checkWifi();
        if (!onWifi) {
          setWifiWarning('No se detectó WiFi. Comprueba la red antes de buscar TVs.');
        }
      } catch {
        // discovery sigue disponible
      }
    })();
  }, [checkWifi]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = setTimeout(() => clearFeedback(), 4000);
    return () => clearTimeout(timer);
  }, [feedback, clearFeedback]);

  const handleScan = useCallback(async () => {
    try {
      const onWifi = await checkWifi();
      setWifiWarning(
        onWifi ? null : 'No se detectó WiFi. La búsqueda continuará (~10 s mínimo).',
      );
    } catch {
      setWifiWarning(null);
    }
    clearFeedback();
    await scan();
  }, [checkWifi, scan, clearFeedback]);

  const handleConnect = useCallback(
    async (device: TvDevice) => {
      if (connectingId || connectionState === 'connecting') {
        return;
      }
      setConnectingId(device.id);
      const ok = await connect(device);
      setConnectingId(null);
      if (ok) {
        router.replace('/(tabs)/remote');
      }
    },
    [connect, connectingId, connectionState],
  );

  const handleManualIp = useCallback(async () => {
    if (!manualIp.trim() || scanning) {
      return;
    }
    clearFeedback();
    const protocol = manualProtocol === 'auto' ? undefined : manualProtocol;
    const device = await connectByIp(manualIp.trim(), protocol);
    if (device) {
      await handleConnect(device);
    }
  }, [manualIp, manualProtocol, scanning, connectByIp, clearFeedback, handleConnect]);

  if (connectionState === 'connected' && pairedDevice) {
    return <Redirect href="/(tabs)/remote" />;
  }

  const percent =
    progress && progress.total > 0
      ? Math.round((progress.scanned / progress.total) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emparejar TV</Text>
        <Text style={styles.subtitle}>Busca televisores en tu red WiFi (v3)</Text>
      </View>

      <ConnectionStatus state={scanning ? 'scanning' : connectionState} error={error ?? scanError} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {feedback ? <FeedbackBanner message={feedback.text} tone={feedback.tone} /> : null}
        {wifiWarning ? <Text style={styles.warning}>{wifiWarning}</Text> : null}

        <RemoteButton
          disabled={scanning}
          label={scanning ? 'Buscando…' : 'Buscar TV'}
          onPress={() => void handleScan()}
        />

        {scanning || progress ? (
          <View style={styles.progressBox}>
            {scanning ? (
              <ActivityIndicator color={colors.backgroundStrong} style={styles.loader} />
            ) : null}
            <Text style={styles.progressText}>
              {progress?.phase ?? 'Escaneando…'}
            </Text>
            {progress && progress.total > 0 ? (
              <Text style={styles.progressDetail}>
                {percent}% · {progress.found} encontrada(s) · espera ~10 s mínimo
              </Text>
            ) : null}
          </View>
        ) : null}

        {scanEmpty && !scanning ? (
          <FeedbackBanner
            tone="warning"
            message="No se encontró ninguna TV. Comprueba WiFi, que la TV esté encendida (Roku o Vissius :8080), o introduce la IP manualmente abajo."
          />
        ) : null}

        {devices.map((device) => (
          <TvDeviceCard
            key={device.id}
            device={device}
            connecting={connectingId === device.id}
            onConnect={(selected) => void handleConnect(selected)}
          />
        ))}

        <View style={styles.manualBox}>
          <Text style={styles.manualTitle}>Conectar por IP (manual)</Text>
          <TextInput
            accessibilityLabel="IP de la TV"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numeric"
            placeholder="192.168.1.50"
            placeholderTextColor="#666"
            style={styles.input}
            value={manualIp}
            onChangeText={setManualIp}
          />
          <View style={styles.protocolRow}>
            {(['auto', 'roku', 'vissius'] as const).map((option) => (
              <RemoteButton
                key={option}
                compact
                label={option === 'auto' ? 'Auto' : option === 'roku' ? 'Roku' : 'Vissius'}
                style={[
                  styles.protocolButton,
                  manualProtocol === option ? styles.protocolActive : null,
                ]}
                onPress={() => setManualProtocol(option)}
              />
            ))}
          </View>
          <RemoteButton
            disabled={scanning || !manualIp.trim()}
            label="Probar IP y conectar"
            onPress={() => void handleManualIp()}
          />
        </View>

        {pairedDevice && connectionState !== 'connected' ? (
          <RemoteButton
            label="Reintentar conexión"
            onPress={() => void handleConnect(pairedDevice)}
          />
        ) : null}

        {pairedDevice ? (
          <RemoteButton label="Olvidar TV" onPress={() => void forgetDevice()} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSoft,
    flex: 1,
  },
  header: {
    backgroundColor: colors.backgroundStrong,
    paddingBottom: 20,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 56,
  },
  title: {
    color: colors.textOnStrong,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textOnStrong,
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  content: {
    gap: 16,
    padding: layout.screenPadding,
    paddingBottom: 40,
  },
  warning: {
    color: colors.textOnSoft,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    marginBottom: 8,
  },
  progressBox: {
    alignItems: 'center',
    borderColor: colors.backgroundStrong,
    borderRadius: layout.buttonRadius,
    borderWidth: 2,
    padding: 16,
  },
  progressText: {
    color: colors.textOnSoft,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressDetail: {
    color: colors.textOnSoft,
    fontSize: 13,
    marginTop: 6,
    opacity: 0.85,
    textAlign: 'center',
  },
  manualBox: {
    borderColor: colors.backgroundStrong,
    borderRadius: layout.buttonRadius,
    borderWidth: 2,
    gap: 12,
    padding: 16,
  },
  manualTitle: {
    color: colors.textOnSoft,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.buttonBackground,
    borderRadius: layout.buttonRadius,
    borderWidth: 1,
    color: colors.textOnSoft,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  protocolRow: {
    flexDirection: 'row',
    gap: 8,
  },
  protocolButton: {
    flex: 1,
  },
  protocolActive: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: colors.backgroundStrong,
  },
});
