import '../src/modules/location-agent/task';

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AirplaneBlockOverlay } from '../src/components/AirplaneBlockOverlay';
import { colors } from '../src/constants/theme';
import { MonitoringProvider, useMonitoring } from '../src/hooks/MonitoringProvider';
import { openAirplaneSettings } from '../src/modules/device-admin/native';

function AirplaneGuard() {
  const { airplaneMode } = useMonitoring();
  return (
    <AirplaneBlockOverlay
      visible={airplaneMode}
      onOpenSettings={() => {
        void openAirplaneSettings();
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <MonitoringProvider>
      <StatusBar style="light" />
      <AirplaneGuard />
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
