import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, spacing, typography } from '../src/constants/theme';
import { COUNTRIES, type CountryId } from '../src/data/countries';
import { useProgress } from '../src/hooks/ProgressProvider';
import { VisualAssets } from '../src/modules/match3-visual/assets';
import { CoinMark } from '../src/modules/match3-visual/CoinMark';
import { formatCoins } from '../src/modules/match3-visual/formatCoins';
import { NightScreen } from '../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../src/modules/match3-visual/PixelPanel';
import {
  canTravelToNext,
  currentTravelCost,
  isCountryUnlocked,
} from '../src/modules/progress/progressStore';

/** Labels RN sobre pines ya dibujados en map-americas.png (sin diamante extra). */
const PIN: Record<CountryId, { top: DimensionValue; left: DimensionValue }> = {
  mx: { top: '32%', left: '22%' },
  co: { top: '48%', left: '34%' },
  pe: { top: '58%', left: '32%' },
  br: { top: '56%', left: '48%' },
  ar: { top: '74%', left: '40%' },
};

export default function MapScreen() {
  const { progress, travel } = useProgress();
  const cost = currentTravelCost(progress);
  const canGo = canTravelToNext(progress);
  const current = COUNTRIES[progress.unlockedCountryIndex];

  return (
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <View style={styles.mapWrap}>
          <PixelPanel padded={false} fill>
            <ImageBackground
              source={VisualAssets.mapAmericas}
              style={styles.map}
              resizeMode="contain"
            >
              {COUNTRIES.map((c) => {
                const unlocked = isCountryUnlocked(progress, c.order);
                const pos = PIN[c.id];
                const active = current?.id === c.id;
                return (
                  <Pressable
                    key={c.id}
                    disabled={!unlocked}
                    onPress={() => router.push(`/country/${c.id}`)}
                    hitSlop={12}
                    style={[
                      styles.pin,
                      { top: pos.top, left: pos.left },
                      !unlocked && styles.pinLocked,
                      active && styles.pinActive,
                    ]}
                  >
                    <Text style={styles.pinLabel}>{c.id.toUpperCase()}</Text>
                  </Pressable>
                );
              })}
            </ImageBackground>
          </PixelPanel>
        </View>

        <View style={styles.bar}>
          <PixelPanel style={styles.stat} padded={false}>
            <View style={styles.statInner}>
              <CoinMark size={18} />
              <Text style={styles.statVal}>{formatCoins(progress.coins)}</Text>
            </View>
          </PixelPanel>
          <PrimaryButton
            inline
            label={canGo ? 'VIAJAR' : 'BLOQUEO'}
            disabled={!canGo}
            onPress={() => void travel()}
          />
          <PixelPanel style={styles.stat} padded={false}>
            <View style={styles.statInner}>
              <CoinMark size={18} />
              <Text style={styles.statVal}>{formatCoins(cost)}</Text>
            </View>
          </PixelPanel>
        </View>
        <PrimaryButton
          label="Volver"
          variant="ghost"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  mapWrap: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    minHeight: 280,
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -16 }],
    backgroundColor: colors.night,
    borderWidth: 2,
    borderColor: colors.cyan,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 14,
  },
  pinActive: {
    borderColor: colors.cyanHi,
  },
  pinLocked: { opacity: 0.35 },
  pinLabel: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontSize: 8,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stat: {
    minWidth: 88,
  },
  statInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  statVal: {
    color: colors.coin,
    fontFamily: fonts.pixel,
    fontSize: typography.sm,
  },
});
