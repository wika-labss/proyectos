import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { PIXEL_FONT, PixelFontReadyContext } from '../src/constants/fonts';
import { bit } from '../src/constants/theme';
import { AmbientAudioProvider } from '../src/hooks/AmbientAudioProvider';
import { GameProvider } from '../src/hooks/GameProvider';

export default function RootLayout() {
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      void import('expo-font')
        .then((Font) => Font.loadAsync({ PressStart2P: PIXEL_FONT }))
        .then(() => {
          if (alive) setFontReady(true);
        })
        .catch(() => {
          // Sistema de fuentes si Press Start 2P falla.
        });
    }, 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  );
}
