import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { PIXEL_FONT } from '../src/constants/fonts';
import { bit } from '../src/constants/theme';
import { AmbientAudioProvider } from '../src/hooks/AmbientAudioProvider';
import { GameProvider } from '../src/hooks/GameProvider';

export default function RootLayout() {
  const [loaded] = useFonts({
    PressStart2P: PIXEL_FONT,
  });

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: bit.night }} />;
  }

  return (
    <AmbientAudioProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: bit.night },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="how-to" />
          <Stack.Screen name="game" />
        </Stack>
      </GameProvider>
    </AmbientAudioProvider>
  );
}
