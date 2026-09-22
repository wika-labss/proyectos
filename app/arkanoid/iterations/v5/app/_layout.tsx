import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { PIXEL_FONT, PixelFontReadyContext } from '../src/constants/fonts';
import { bit, fontPixel } from '../src/design-system/tokens';
import { AvatarProvider } from '../src/hooks/AvatarProvider';
import { GameProvider } from '../src/hooks/GameProvider';

export default function RootLayout() {
  const [fontReady] = useFonts({ [fontPixel]: PIXEL_FONT });

  return (
    <AppErrorBoundary>
      <PixelFontReadyContext.Provider value={fontReady}>
        <AvatarProvider>
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
        </AvatarProvider>
      </PixelFontReadyContext.Provider>
    </AppErrorBoundary>
  );
}
