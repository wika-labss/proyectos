import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { TV_INPUTS } from '../../src/constants/inputs';
import { colors, layout } from '../../src/constants/theme';
import { ConnectionStatus } from '../../src/components/ConnectionStatus';
import { RemoteButton } from '../../src/components/RemoteButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useChangeTv } from '../../src/hooks/useChangeTv';
import { useRemoteCommand } from '../../src/hooks/useRemoteCommand';
import { useTvConnection } from '../../src/hooks/useTvConnection';
import type { InputCommand } from '../../src/types';

export default function InputsScreen() {
  const { connectionState, pairedDevice, isConnected } = useTvConnection();
  const { send, status, error, sendingCommand } = useRemoteCommand();
  const changeTv = useChangeTv();

  if (!pairedDevice) {
    return <Redirect href="/pairing" />;
  }

  const handleInput = (command: InputCommand) => {
    void send(command);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader showChangeTv title="Entradas" onChangeTv={changeTv} />

      <ConnectionStatus
        state={connectionState}
        deviceName={pairedDevice.name}
        error={error}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Cambia la entrada de video de la TV</Text>
        {status.activeInput ? (
          <Text style={styles.active}>
            Activa: {TV_INPUTS.find((i) => i.id === status.activeInput)?.label ?? status.activeInput}
          </Text>
        ) : null}

        <View style={styles.grid}>
          {TV_INPUTS.map((input) => (
            <View key={input.id} style={styles.gridItem}>
              <RemoteButton
                label={input.label}
                style={styles.button}
                disabled={!isConnected || sendingCommand}
                onPress={() => handleInput(input.command)}
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
  active: {
    color: colors.textOnSoft,
    fontSize: 14,
    fontWeight: '700',
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
  button: {
    minHeight: 64,
    width: '100%',
  },
});
