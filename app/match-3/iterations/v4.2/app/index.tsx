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
import { colors, fonts, radius, spacing, typography } from '../src/constants/theme';
import type { AvatarId } from '../src/data/avatarIds';
import { getAvatar } from '../src/data/avatars';
import { COUNTRIES } from '../src/data/countries';
import type { Preference } from '../src/data/suitors';
import { useProgress } from '../src/hooks/ProgressProvider';
import { CoinMark } from '../src/modules/match3-visual/CoinMark';
import { DiamondRule } from '../src/modules/match3-visual/DiamondRule';
import { formatCoins } from '../src/modules/match3-visual/formatCoins';
import { nativeDriver } from '../src/modules/match3-visual/nativeDriver';
import { NightScreen } from '../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../src/modules/match3-visual/PixelPanel';

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
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay,
        useNativeDriver: nativeDriver,
      }),
    ]).start();
  }, [delay, opacity, translateY]);
  return { opacity, transform: [{ translateY }] };
}

export default function HomeScreen() {
  const { progress, ready, completeProfile, changeAvatar, redeemCode, setMuted } =
    useProgress();
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [enteringCode, setEnteringCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeMsg, setCodeMsg] = useState('');
  const block1 = useSlide(0);
  const block2 = useSlide(120);
  const block3 = useSlide(240);

  if (!ready) {
    return (
      <NightScreen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.cyan} />
        </View>
      </NightScreen>
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
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <Animated.View style={[block1]}>
          <PixelPanel>
            <View style={styles.profile}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cambiar avatar"
                onPress={() => setPickingAvatar(true)}
              >
                <Image
              source={avatar.source}
              style={styles.heroAvatar}
              resizeMode="contain"
            />
              </Pressable>
              <View style={styles.profileText}>
                <Text style={styles.hello} numberOfLines={1}>
                  {progress.profile.username.toUpperCase()}
                </Text>
                <DiamondRule />
                <Text style={styles.country}>
                  <Text style={styles.countryKey}>PAÍS: </Text>
                  <Text style={styles.countryVal}>
                    {(country?.name ?? '—').toUpperCase()}
                  </Text>
                </Text>
              </View>
            </View>
          </PixelPanel>
        </Animated.View>

        {pickingAvatar ? (
          <PixelPanel>
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
          </PixelPanel>
        ) : enteringCode ? (
          <PixelPanel>
            <View style={styles.picker}>
              <Text style={styles.pickerTitle}>Código de creador</Text>
              <TextInput
                value={codeInput}
                onChangeText={setCodeInput}
                placeholder="Código"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
              {codeMsg ? <Text style={styles.codeMsg}>{codeMsg}</Text> : null}
              <PrimaryButton
                label="Aplicar"
                onPress={() => {
                  void redeemCode(codeInput).then((r) => {
                    setCodeMsg(r.message);
                    if (r.ok) setCodeInput('');
                  });
                }}
              />
              <PrimaryButton
                label="Cerrar"
                variant="ghost"
                onPress={() => setEnteringCode(false)}
              />
            </View>
          </PixelPanel>
        ) : (
          <Animated.View style={[styles.actions, block2]}>
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
            <PrimaryButton
              label="Tienda"
              variant="secondary"
              onPress={() => router.push('/shop')}
            />
            <PrimaryButton
              label="Código"
              variant="ghost"
              onPress={() => {
                setCodeMsg('');
                setCodeInput('');
                setEnteringCode(true);
              }}
            />
            <PrimaryButton
              label={progress.bgmMuted ? 'Música off' : 'Música on'}
              variant="ghost"
              onPress={() => void setMuted(!progress.bgmMuted)}
            />
          </Animated.View>
        )}

        <Animated.View style={[block3]}>
          <PixelPanel>
            <View style={styles.economy}>
              <CoinMark size={28} />
              <Text style={styles.coinValue}>{formatCoins(progress.coins)}</Text>
            </View>
          </PixelPanel>
        </Animated.View>
      </SafeAreaView>
    </NightScreen>
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
    <NightScreen>
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
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileText: {
    flex: 1,
  },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.cyan,
  },
  hello: {
    fontFamily: fonts.pixel,
    fontSize: typography.brand,
    color: colors.star,
  },
  country: {
    fontFamily: fonts.pixel,
    fontSize: typography.sm,
  },
  countryKey: {
    color: colors.cyan,
    fontFamily: fonts.pixel,
  },
  countryVal: {
    color: colors.star,
    fontFamily: fonts.pixel,
  },
  brand: {
    fontFamily: fonts.pixel,
    fontSize: typography.brand,
    color: colors.star,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: fonts.pixel,
    fontSize: typography.body,
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
    fontFamily: fonts.pixel,
    color: colors.star,
    fontSize: typography.body,
  },
  codeMsg: {
    fontFamily: fonts.pixel,
    color: colors.cyanHi,
    fontSize: typography.sm,
    textAlign: 'center',
  },
  economy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  coinValue: {
    color: colors.star,
    fontSize: typography.brand,
    fontFamily: fonts.pixel,
  },
  onboard: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: fonts.pixel,
    color: colors.star,
    fontSize: typography.sm,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.night,
    color: colors.star,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.cyan,
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
    borderWidth: 2,
    borderColor: colors.muted,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.night,
  },
  prefChipOn: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  prefText: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontSize: 8,
    fontWeight: '700',
  },
  prefTextOn: {
    color: colors.nightDeep,
  },
});
