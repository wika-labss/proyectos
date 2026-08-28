import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../src/constants/theme';
import { useMonitoring } from '../src/hooks/MonitoringProvider';

export default function IndexScreen() {
  const { registration, loading } = useMonitoring();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (registration) {
    return <Redirect href="/splash" />;
  }

  return <Redirect href="/register" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
