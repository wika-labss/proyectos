import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/constants/theme';
import { FiltersProvider } from '../src/hooks/FiltersProvider';

export default function RootLayout() {
  return (
    <FiltersProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 64,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontWeight: '700', fontSize: 12 },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Tablero' }} />
        <Tabs.Screen name="licitaciones" options={{ title: 'Listado' }} />
      </Tabs>
    </FiltersProvider>
  );
}
