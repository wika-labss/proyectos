import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvatarGrid } from '../src/components/AvatarGrid';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import type { AvatarId } from '../src/data/avatarIds';
import { getAvatar } from '../src/data/avatars';
import { COUNTRIES } from '../src/data/countries';
import type { Preference } from '../src/data/suitors';
import { useProgress } from '../src/hooks/ProgressProvider';

const PREFS: { id: Preference; label: string }[] = [
  { id: 'hombre', label: 'Hombre' },
  { id: 'mujer', label: 'Mujer' },
  { id: 'ambos', label: 'Ambos' },
];

function useSlide(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);
  return { opacity, transform: [{ translateY }] };
}

export default function HomeScreen() {
  const { progress, ready, completeProfile, changeAvatar } = useProgress();
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const block1 = useSlide(0);
  const block2 = useSlide(120);
  const block3 = useSlide(240);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!progress.profile) {
    return (
      <Onboarding
        onSubmit={(name, pref, avatar) => {
          void completeProfile(name, pref, avatar);
        }}
      />
    );
  }

  const avatar = getAvatar(progress.profile.avatarId);
  const country = COUNTRIES[progress.unlockedCountryIndex];

  return (
    <SafeAreaView style={styles.root}>
      <Animated.View style={[styles.block, block1]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cambiar avatar"
          onPress={() => setPickingAvatar(true)}
        >
          <Image source={avatar.source} style={styles.heroAvatar} />
        </Pressable>
        <Text style={styles.hello}>{progress.profile.username}</Text>
        <Text style={styles.country}>País: {country?.name ?? '—'}</Text>
      </Animated.View>

      {pickingAvatar ? (
        <View style={styles.picker}>
          <Text style={styles.pickerTitle}>Cambiar retrato</Text>
          <AvatarGrid
            selected={progress.profile.avatarId}
            onSelect={(id) => {
              void changeAvatar(id);
              setPickingAvatar(false);
            }}
          />
          <PrimaryButton
            label="Cerrar"
            variant="ghost"
            onPress={() => setPickingAvatar(false)}
          />
        </View>
      ) : (
        <Animated.View style={[styles.block, styles.actions, block2]}>
          <PrimaryButton label="Jugar" onPress={() => router.push('/map')} />
          <PrimaryButton
            label="Pretendientes"
            variant="secondary"
            onPress={() => router.push('/suitors')}
          />
          <PrimaryButton
            label="Inventario"
            variant="ghost"
            onPress={() => router.push('/inventory')}
          />
        </Animated.View>
      )}

      <Animated.View style={[styles.block, styles.economy, block3]}>
        <Text style={styles.coinLabel}>Monedas</Text>
        <Text style={styles.coinValue}>
          {progress.coins.toLocaleString('es')}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

function Onboarding({
  onSubmit,
}: {
  onSubmit: (name: string, preference: Preference, avatarId: AvatarId) => void;
}) {
  const [name, setName] = useState('');
  const [preference, setPreference] = useState<Preference | null>(null);
  const [avatarId, setAvatarId] = useState<AvatarId | null>(null);

  const canContinue =
    name.trim().length > 0 && preference != null && avatarId != null;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.onboard}>
        <Text style={styles.brand}>VISSIUSS</Text>
        <Text style={styles.subtitle}>Match-3 América</Text>
        <Text style={styles.fieldLabel}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCapitalize="words"
        />
        <Text style={styles.fieldLabel}>Preferencia</Text>
        <View style={styles.prefRow}>
          {PREFS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setPreference(p.id)}
              style={[
                styles.prefChip,
                preference === p.id && styles.prefChipOn,
              ]}
            >
              <Text
                style={[
                  styles.prefText,
                  preference === p.id && styles.prefTextOn,
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.fieldLabel}>Imagen de perfil</Text>
        <AvatarGrid selected={avatarId} onSelect={setAvatarId} />
        <PrimaryButton
          label="Continuar"
          disabled={!canContinue}
          onPress={() => {
            if (preference && avatarId) onSubmit(name, preference, avatarId);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  block: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  heroAvatar: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  hello: {
    fontFamily: fonts.brand,
    fontSize: 28,
    color: colors.textOnDark,
  },
  country: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    marginTop: 4,
  },
  brand: {
    fontFamily: fonts.brand,
    fontSize: 48,
    color: colors.textOnDark,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.muted,
    marginTop: 8,
  },
  actions: {
    gap: spacing.md,
  },
  picker: {
    gap: spacing.md,
    alignItems: 'center',
  },
  pickerTitle: {
    fontFamily: fonts.body,
    color: colors.textOnDark,
    fontSize: 16,
  },
  economy: {
    marginBottom: spacing.lg,
  },
  coinLabel: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.body,
  },
  coinValue: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fonts.body,
    marginTop: 4,
  },
  onboard: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: fonts.body,
    color: colors.textOnDark,
    fontSize: 14,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  prefRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefChip: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.muted,
    paddingVertical: 12,
    alignItems: 'center',
  },
  prefChipOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  prefText: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
  prefTextOn: {
    color: colors.textOnDark,
  },
});
