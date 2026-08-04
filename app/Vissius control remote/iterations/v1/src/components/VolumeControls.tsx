import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { VolumeCommand } from '../types';
import { RemoteButton } from './RemoteButton';

interface VolumeControlsProps {
  onCommand: (command: VolumeCommand) => void;
  disabled?: boolean;
}

export function VolumeControls({ onCommand, disabled = false }: VolumeControlsProps) {
  return (
    <View style={styles.container}>
      <RemoteButton
        label="Vol +"
        style={styles.button}
        disabled={disabled}
        onPress={() => onCommand('vol_up')}
      />
      <RemoteButton
        label="Vol −"
        style={styles.button}
        disabled={disabled}
        onPress={() => onCommand('vol_down')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    maxWidth: 160,
  },
});
