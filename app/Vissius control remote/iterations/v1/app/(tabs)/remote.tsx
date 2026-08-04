import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors, layout } from '../../src/constants/theme';
import { ConnectionStatus } from '../../src/components/ConnectionStatus';
import { NavigationPad } from '../../src/components/NavigationPad';
import { VolumeControls } from '../../src/components/VolumeControls';
import { useRemoteCommand } from '../../src/hooks/useRemoteCommand';
import { useTvConnection } from '../../src/hooks/useTvConnection';
import type { NavigationCommand, VolumeCommand } from '../../src/types';

export default function RemoteScreen() {
  const { connectionState, pairedDevice, reconnect, isConnected } = useTvConnection();
  const { send, status, error, sendingCommand } = useRemoteCommand();

  if (!pairedDevice) {
    return <Redirect href="/" />;
  }

  const handleNav = (command: NavigationCommand) => {
    void send(command);
  };

  const handleVolume = (command: VolumeCommand) => {
    void send(command);
  };

  return (
    <View style={styles.container}>
      <ConnectionStatus
        state={connectionState}
        deviceName={pairedDevice.name}
        error={error}
      />

      <View style={styles.body}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Volumen</Text>
          <Text style={styles.statusValue}>{status.volume}</Text>
          {status.activeApp ? (
            <>
              <Text style={styles.statusLabel}>App activa</Text>
              <Text style={styles.statusValue}>{status.activeApp}</Text>
            </>
          ) : null}
        </View>

        <NavigationPad onCommand={handleNav} disabled={!isConnected || sendingCommand} />
        <VolumeControls onCommand={handleVolume} disabled={!isConnected || sendingCommand} />

        {!isConnected ? (
          <Pressable accessibilityRole="button" onPress={() => void reconnect()}>
            <Text style={styles.hint}>Toca aquí para reintentar conexión</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSoft,
    flex: 1,
  },
  body: {
    flex: 1,
    gap: 24,
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.backgroundStrong,
    borderRadius: layout.buttonRadius,
    borderWidth: 2,
    padding: 16,
  },
  statusLabel: {
    color: colors.textOnSoft,
    fontSize: 14,
    marginTop: 4,
  },
  statusValue: {
    color: colors.textOnSoft,
    fontSize: 28,
    fontWeight: '700',
  },
  hint: {
    color: colors.textOnSoft,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
