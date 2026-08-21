import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { VissiussSplash } from '../src/components/VissiussSplash';
import { colors, splashDurationMs } from '../src/constants/theme';
import { useProfile } from '../src/hooks/ProfileProvider';

export default function SplashScreen() {
  const router = useRouter();
  const { ready, profile } = useProfile();

  useEffect(() => {
    if (!ready) {
      return;
    }

    const timer = setTimeout(() => {
      if (profile) {
        router.replace('/home');
      } else {
        router.replace('/register');
      }
    }, splashDurationMs);

    return () => {
      clearTimeout(timer);
    };
  }, [ready, profile, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <VissiussSplash />;
}
