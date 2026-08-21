import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '../src/components/Screen';
import { HoroscopeCard } from '../src/components/HoroscopeCard';
import { MoodIndicator } from '../src/components/MoodIndicator';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { appTitle, colors, fonts, radius, spacing } from '../src/constants/theme';
import { useHoroscope, useProfile } from '../src/hooks/ProfileProvider';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';

export default function HomeScreen() {
  const { profile } = useProfile();
  const { online, refresh: refreshNetwork } = useNetworkStatus();
  const { data, loading, error, refresh } = useHoroscope(profile, online);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const hasNetwork = await refreshNetwork();
    if (hasNetwork) {
      await refresh();
    }
    setRefreshing(false);
  }, [refresh, refreshNetwork]);

  if (!profile) {
    return null;
  }

  const sign = data?.signo;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void handleRefresh();
            }}
            tintColor={colors.accent}
          />
        }
      >
        <Text style={styles.appTitle}>{appTitle}</Text>
        <Text style={styles.greeting}>Hola, {profile.name}</Text>
        <Text style={styles.signMeta}>
          {profile.signName} · {profile.birthDate}
        </Text>

        <Image
          source={require('../assets/images/alan-home.jpg')}
          style={styles.hero}
          accessibilityLabel="Alan el Farmeador de aura"
        />

        {!online ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Sin conexión a internet. Conéctate para ver el horóscopo de hoy.
            </Text>
          </View>
        ) : null}

        {loading && !data ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Consultando las estrellas...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{error}</Text>
            <PrimaryButton
              label="Reintentar"
              onPress={() => {
                void handleRefresh();
              }}
            />
          </View>
        ) : null}

        {data && sign ? (
          <View style={styles.section}>
            <Text style={styles.dayTitle}>{data.titulo}</Text>
            <Text style={styles.dayMeta}>{data.fecha} · {data.zona_horaria}</Text>

            <HoroscopeCard title="Amor" value={sign.amor} />
            <HoroscopeCard title="Salud" value={sign.salud} />
            <HoroscopeCard title="Dinero" value={sign.dinero} />
            <HoroscopeCard title="Color" value={sign.color} accent />
            <HoroscopeCard title="Número" value={sign.numero} />
            <HoroscopeCard title="Elemento" value={sign.elemento} />
            <HoroscopeCard title="Rango" value={sign.rango} />
            <MoodIndicator animo={sign.animo} />
          </View>
        ) : null}

        <PrimaryButton
          label={loading ? 'Actualizando...' : 'Actualizar horóscopo'}
          onPress={() => {
            void handleRefresh();
          }}
          disabled={loading || !online}
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  appTitle: {
    color: colors.accent,
    fontSize: fonts.heading,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  greeting: {
    color: colors.text,
    fontSize: fonts.title,
    fontWeight: '700',
  },
  signMeta: {
    color: colors.textMuted,
    fontSize: fonts.body,
    marginBottom: spacing.md,
  },
  hero: {
    width: '100%',
    height: 220,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  banner: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  bannerText: {
    color: colors.text,
    fontSize: fonts.body,
    lineHeight: 22,
  },
  loadingBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: fonts.body,
  },
  section: {
    marginBottom: spacing.md,
  },
  dayTitle: {
    color: colors.text,
    fontSize: fonts.heading,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  dayMeta: {
    color: colors.textMuted,
    fontSize: fonts.caption,
    marginBottom: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
