import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/constants/theme';
import { ProgressProvider } from '../src/hooks/ProgressProvider';

export default function RootLayout() {
  return (
    <ProgressProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="map" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="country/[id]" />
        <Stack.Screen name="play/[countryId]/[level]" />
      </Stack>
    </ProgressProvider>
  );
}
