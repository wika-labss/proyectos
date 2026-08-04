import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { RemoteCommand } from '../types';
import { useTvStore } from '../stores/tvStore';

export function useRemoteCommand() {
  const sendCommand = useTvStore((state) => state.sendCommand);
  const status = useTvStore((state) => state.status);
  const connectionState = useTvStore((state) => state.connectionState);
  const error = useTvStore((state) => state.error);

  const send = useCallback(
    async (command: RemoteCommand) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await sendCommand(command);
    },
    [sendCommand],
  );

  return {
    send,
    status,
    connectionState,
    error,
    isConnected: connectionState === 'connected',
  };
}
