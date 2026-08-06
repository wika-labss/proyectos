import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { STREAMING_APPS } from '../../src/constants/streamingApps';
import { colors, layout } from '../../src/constants/theme';
import { ConnectionStatus } from '../../src/components/ConnectionStatus';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StreamingAppButton } from '../../src/components/StreamingAppButton';
import { useChangeTv } from '../../src/hooks/useChangeTv';
import { useRemoteCommand } from '../../src/hooks/useRemoteCommand';
import { useTvConnection } from '../../src/hooks/useTvConnection';
import type { LaunchCommand } from '../../src/types';

export default function AppsScreen() {
  const { connectionState, pairedDevice, isConnected } = useTvConnection();
  const { send, error, sendingCommand } = useRemoteCommand();
  const changeTv = useChangeTv();

  if (!pairedDevice) {
    return <Redirect href="/pairing" />;
  }

  const handleLaunch = (command: LaunchCommand) => {
    void send(command);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader showChangeTv title="Apps" onChangeTv={changeTv} />

      <ConnectionStatus
        state={connectionState}
        deviceName={pairedDevice.name}
        error={error}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Abre una app en tu televisor</Text>

        <View style={styles.grid}>
          {STREAMING_APPS.map((app) => (
            <View key={app.id} style={styles.gridItem}>
              <StreamingAppButton
                label={app.label}
                command={app.command}
                disabled={!isConnected || sendingCommand}
                onPress={handleLaunch}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSoft,
    flex: 1,
  },
  content: {
    gap: 16,
    padding: layout.screenPadding,
    paddingBottom: 32,
  },
  intro: {
    color: colors.textOnSoft,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
  },
});
