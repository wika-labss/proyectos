import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { colors } from '../src/constants/theme';
import { useClockStore } from '../src/stores/clockStore';

export default function RootLayout() {
  const hydrate = useClockStore((state) => state.hydrate);
  const flushPreferences = useClockStore((state) => state.flushPreferences);
  const loadedPrefs = useClockStore((state) => state.loaded);

  const [fontsLoaded] = useFonts({
    'DSEG7Classic-Bold': require('../assets/fonts/DSEG7Classic-Bold.ttf'),
  });

  useEffect(() => {
    void hydrate();
    return () => {
      void flushPreferences();
    };
  }, [flushPreferences, hydrate]);

  if (!fontsLoaded || !loadedPrefs) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
