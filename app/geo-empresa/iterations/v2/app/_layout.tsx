import '../src/modules/location-agent/task';

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SecurityLockOverlay } from '../src/components/SecurityLockOverlay';
import { appConfig } from '../src/constants/config';
import { colors } from '../src/constants/theme';
import { MonitoringProvider, useMonitoring } from '../src/hooks/MonitoringProvider';

function SecurityLockGuard() {
  const {
    lockActive,
    lockReason,
    distanciaBaseM,
    registration,
    lockError,
    unlockWithPin,
  } = useMonitoring();

  return (
    <SecurityLockOverlay
      visible={lockActive}
      reason={lockReason}
      distanciaBaseM={distanciaBaseM}
      radioMetros={registration?.radioMetros ?? appConfig.fenceRadiusM}
      error={lockError}
      onUnlock={(pin) => {
        void unlockWithPin(pin);
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <MonitoringProvider>
      <StatusBar style="light" />
      <SecurityLockGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      />
    </MonitoringProvider>
  );
}
