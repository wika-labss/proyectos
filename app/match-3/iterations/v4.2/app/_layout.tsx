import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { colors } from '../src/constants/theme';
import { ProgressProvider } from '../src/hooks/ProgressProvider';
import { BgmController } from '../src/modules/match3-audio/BgmController';
import { PhoneShell } from '../src/modules/match3-visual/PhoneShell';

export default function RootLayout() {
  // Cargar en paralelo: no bloquear el arranque si la TTF falla en Release.
  useFonts({
    PressStart2P: require('../assets/fonts/PressStart2P-Regular.ttf'),
  });

  return (
    <PhoneShell>
      <ProgressProvider>
        <BgmController />
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
          <Stack.Screen name="shop" />
          <Stack.Screen name="suitors" />
          <Stack.Screen name="country/[id]" />
          <Stack.Screen name="play/[countryId]/[level]" />
        </Stack>
      </ProgressProvider>
    </PhoneShell>
  );
}
