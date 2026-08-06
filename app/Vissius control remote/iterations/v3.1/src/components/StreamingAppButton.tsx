import React from 'react';
import { StyleSheet } from 'react-native';
import type { LaunchCommand } from '../types';
import { RemoteButton } from './RemoteButton';

interface StreamingAppButtonProps {
  label: string;
  command: LaunchCommand;
  onPress: (command: LaunchCommand) => void;
  disabled?: boolean;
}

export function StreamingAppButton({
  label,
  command,
  onPress,
  disabled = false,
}: StreamingAppButtonProps) {
  return (
    <RemoteButton
      label={label}
      style={styles.button}
      disabled={disabled}
      onPress={() => onPress(command)}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 64,
    width: '100%',
  },
});
