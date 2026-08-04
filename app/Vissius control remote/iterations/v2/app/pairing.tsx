import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { colors, layout } from '../src/constants/theme';
import { ConnectionStatus } from '../src/components/ConnectionStatus';
import { FeedbackBanner } from '../src/components/FeedbackBanner';
import { RemoteButton } from '../src/components/RemoteButton';
import { TvDeviceCard } from '../src/components/TvDeviceCard';
import { usePairing } from '../src/hooks/usePairing';
import { useTvConnection } from '../src/hooks/useTvConnection';
import type { TvDevice } from '../src/types';

export default function PairingScreen() {
  const { connectionState, pairedDevice, error, feedback, connect, checkWifi, forgetDevice, clearFeedback } =
    useTvConnection();
  const { devices, scanning, scanError, scanEmpty, scan } = usePairing();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [wifiWarning, setWifiWarning] = useState<string | null>(null);

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
        onWifi ? null : 'No se detectó WiFi. La búsqueda continuará en la red local.',
      );
    } catch {
      setWifiWarning(null);
    }
    clearFeedback();
    await scan();
  }, [checkWifi, scan, clearFeedback]);

  const handleConnect = useCallback(
    async (device: TvDevice) => {
      setConnectingId(device.id);
      const ok = await connect(device);
      setConnectingId(null);
      if (ok) {
        router.replace('/(tabs)/remote');
      }
    },
    [connect],
  );

  if (connectionState === 'connected' && pairedDevice) {
    return <Redirect href="/(tabs)/remote" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emparejar TV</Text>
        <Text style={styles.subtitle}>Busca televisores en tu red WiFi</Text>
      </View>

      <ConnectionStatus state={scanning ? 'scanning' : connectionState} error={error ?? scanError} />

      <ScrollView contentContainerStyle={styles.content}>
        {feedback ? <FeedbackBanner message={feedback.text} tone={feedback.tone} /> : null}
        {wifiWarning ? <Text style={styles.warning}>{wifiWarning}</Text> : null}

        <RemoteButton
          disabled={scanning}
          label={scanning ? 'Buscando…' : 'Buscar TV'}
          onPress={() => void handleScan()}
        />

        {scanning ? <ActivityIndicator color={colors.backgroundStrong} style={styles.loader} /> : null}

        {scanEmpty && !scanning ? (
          <FeedbackBanner
            tone="warning"
            message="No se encontró ninguna TV en la red. Comprueba que el móvil y la TV están en la misma WiFi y que la TV está encendida."
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
  },
  warning: {
    color: colors.textOnSoft,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    marginTop: 8,
  },
});
