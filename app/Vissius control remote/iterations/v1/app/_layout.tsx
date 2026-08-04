import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/constants/theme';
import { useTvStore } from '../src/stores/tvStore';

export default function RootLayout() {
  const loaded = useTvStore((state) => state.loaded);
  const load = useTvStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.backgroundStrong} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.backgroundSoft } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSoft,
    flex: 1,
    justifyContent: 'center',
  },
});
