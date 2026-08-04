import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { colors, layout } from '../../src/constants/theme';
import { getStreamingAppLabel } from '../../src/constants/streamingApps';
import { ConnectionStatus } from '../../src/components/ConnectionStatus';
import { FeedbackBanner } from '../../src/components/FeedbackBanner';
import { NavigationPad } from '../../src/components/NavigationPad';
import { RemoteButton } from '../../src/components/RemoteButton';
import { VolumeControls } from '../../src/components/VolumeControls';
import { useRemoteCommand } from '../../src/hooks/useRemoteCommand';
import { useTvConnection } from '../../src/hooks/useTvConnection';
import type { NavigationCommand, VolumeCommand } from '../../src/types';

export default function RemoteScreen() {
  const {
    connectionState,
    pairedDevice,
    reconnect,
    isConnected,
    feedback,
    leaveForPairing,
    clearFeedback,
  } = useTvConnection();
  const { send, status, error, sendingCommand } = useRemoteCommand();

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = setTimeout(() => clearFeedback(), 4000);
    return () => clearTimeout(timer);
  }, [feedback, clearFeedback]);

  if (!pairedDevice) {
    return <Redirect href="/pairing" />;
  }

  const handleNav = (command: NavigationCommand) => {
    void send(command);
  };

  const handleVolume = (command: VolumeCommand) => {
    void send(command);
  };

  const handleChangeTv = () => {
    void (async () => {
      await leaveForPairing();
      router.replace('/pairing');
    })();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <RemoteButton compact label="← Cambiar TV" onPress={handleChangeTv} style={styles.backButton} />
      </View>

      <ConnectionStatus
        state={connectionState}
        deviceName={pairedDevice.name}
        error={error}
      />

      <View style={styles.body}>
        {feedback ? <FeedbackBanner message={feedback.text} tone={feedback.tone} /> : null}

        <View style={styles.statusCard}>
          {status.activeApp ? (
            <>
              <Text style={styles.statusLabel}>App activa</Text>
              <Text style={styles.statusValue}>{getStreamingAppLabel(status.activeApp)}</Text>
            </>
          ) : null}
        </View>

        <NavigationPad onCommand={handleNav} disabled={!isConnected || sendingCommand} />
        <VolumeControls
          volume={status.volume}
          muted={status.muted}
          onCommand={handleVolume}
          disabled={!isConnected || sendingCommand}
        />

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
  topBar: {
    backgroundColor: colors.backgroundStrong,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 48,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
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
    fontSize: 22,
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
