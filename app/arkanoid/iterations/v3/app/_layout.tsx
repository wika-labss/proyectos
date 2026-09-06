import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { PixelFontReadyContext } from '../src/constants/fonts';
import { bit } from '../src/constants/theme';
import { AmbientAudioProvider } from '../src/hooks/AmbientAudioProvider';
import { GameProvider } from '../src/hooks/GameProvider';

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <PixelFontReadyContext.Provider value={false}>
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
    </AppErrorBoundary>
  );
}
