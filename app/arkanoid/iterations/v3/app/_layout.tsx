import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PIXEL_FONT, PixelFontReadyContext } from '../src/constants/fonts';
import { bit } from '../src/constants/theme';
import { AmbientAudioProvider } from '../src/hooks/AmbientAudioProvider';
import { GameProvider } from '../src/hooks/GameProvider';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PressStart2P: PIXEL_FONT,
  });
  const fontReady = loaded && !error;

  return (
    <SafeAreaProvider>
      <PixelFontReadyContext.Provider value={fontReady}>
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
      </PixelFontReadyContext.Provider>
    </SafeAreaProvider>
  );
}
