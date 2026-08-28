import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { VissiussSplash } from '../src/components/VissiussSplash';
import { appConfig } from '../src/constants/config';
import { colors } from '../src/constants/theme';
import { useMonitoring } from '../src/hooks/MonitoringProvider';
import { moveAppToBackground } from '../src/modules/device-admin/native';

export default function SplashScreen() {
  const router = useRouter();
  const { registration, loading } = useMonitoring();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!registration) {
      router.replace('/register');
      return;
    }

    const timer = setTimeout(() => {
      void moveAppToBackground();
    }, appConfig.splashDurationMs);

    return () => {
      clearTimeout(timer);
    };
  }, [loading, registration, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <VissiussSplash />;
}
