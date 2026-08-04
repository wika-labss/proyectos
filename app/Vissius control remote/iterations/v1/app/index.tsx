import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { colors, layout } from '../src/constants/theme';
import { ConnectionStatus } from '../src/components/ConnectionStatus';
import { RemoteButton } from '../src/components/RemoteButton';
import { TvDeviceCard } from '../src/components/TvDeviceCard';
import { usePairing } from '../src/hooks/usePairing';
import { useTvConnection } from '../src/hooks/useTvConnection';
import type { TvDevice } from '../src/types';

export default function PairingScreen() {
  const { connectionState, pairedDevice, error, connect, checkWifi, forgetDevice } =
    useTvConnection();
  const { devices, scanning, scanError, scan } = usePairing();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [wifiWarning, setWifiWarning] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const onWifi = await checkWifi();
        if (!onWifi) {
          setWifiWarning(
            'No se detectó WiFi. Puedes buscar TVs igualmente (v1 simula dispositivos).',
          );
        }
      } catch {
        // expo-network puede fallar en algunos APK; la búsqueda mock sigue disponible.
      }
    })();
  }, [checkWifi]);

  const handleScan = useCallback(async () => {
    try {
      const onWifi = await checkWifi();
      setWifiWarning(
        onWifi
          ? null
          : 'No se detectó WiFi. La búsqueda continúa (v1 simula TVs; v2 requerirá la misma red).',
      );
    } catch {
      setWifiWarning(null);
    }
    await scan();
  }, [checkWifi, scan]);

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
        <Text style={styles.title}>Vissius Control Remote</Text>
        <Text style={styles.subtitle}>Empareja tu televisor por WiFi</Text>
      </View>

      <ConnectionStatus state={scanning ? 'scanning' : connectionState} error={error ?? scanError} />

      <ScrollView contentContainerStyle={styles.content}>
        {wifiWarning ? <Text style={styles.warning}>{wifiWarning}</Text> : null}

        <RemoteButton
          disabled={scanning}
          label={scanning ? 'Buscando…' : 'Buscar TV'}
          onPress={() => void handleScan()}
        />

        {scanning ? (
          <ActivityIndicator color={colors.backgroundStrong} style={styles.loader} />
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
