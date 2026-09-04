import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, spacing, typography } from '../src/constants/theme';
import { COUNTRIES, type CountryId } from '../src/data/countries';
import { useProgress } from '../src/hooks/ProgressProvider';
import { VisualAssets } from '../src/modules/match3-visual/assets';
import { CoinMark } from '../src/modules/match3-visual/CoinMark';
import { formatCoins } from '../src/modules/match3-visual/formatCoins';
import { nativeDriver } from '../src/modules/match3-visual/nativeDriver';
import { NightScreen } from '../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../src/modules/match3-visual/PixelPanel';
import {
  canTravelToNext,
  currentTravelCost,
  isCountryUnlocked,
} from '../src/modules/progress/progressStore';

/** Labels RN sobre pines ya dibujados en map-americas.png (sin diamante extra). */
const PIN: Record<CountryId, { top: number; left: number }> = {
  mx: { top: 0.32, left: 0.22 },
  co: { top: 0.48, left: 0.34 },
  pe: { top: 0.58, left: 0.32 },
  br: { top: 0.56, left: 0.48 },
  ar: { top: 0.74, left: 0.40 },
};

const PLANE = 48;

function pct(v: number, span: number): number {
  return Math.round(v * span);
}

export default function MapScreen() {
  const { progress, travel } = useProgress();
  const cost = currentTravelCost(progress);
  const canGo = canTravelToNext(progress);
  const current = COUNTRIES[progress.unlockedCountryIndex];
  const next = COUNTRIES[progress.unlockedCountryIndex + 1];
  const [mapBox, setMapBox] = useState({ w: 0, h: 0 });
  const [flying, setFlying] = useState(false);
  const planeX = useRef(new Animated.Value(0)).current;
  const planeY = useRef(new Animated.Value(0)).current;

  const onMapLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setMapBox({ w: width, h: height });
  };

  const pinPos = (id: CountryId) => ({
    x: pct(PIN[id].left, mapBox.w) - PLANE / 2,
    y: pct(PIN[id].top, mapBox.h) - PLANE / 2,
  });

  const onTravel = () => {
    if (!canGo || !current || !next || flying || !mapBox.w) return;
    const from = pinPos(current.id);
    const to = pinPos(next.id);
    planeX.setValue(from.x);
    planeY.setValue(from.y);
    setFlying(true);
    Animated.parallel([
      Animated.timing(planeX, {
        toValue: to.x,
        duration: 2000,
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(planeY, {
        toValue: to.y,
        duration: 2000,
        useNativeDriver: nativeDriver,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        setFlying(false);
        return;
      }
      void travel().finally(() => setFlying(false));
    });
  };

  return (
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <View style={styles.mapWrap}>
          <PixelPanel padded={false} fill>
            <ImageBackground
              source={VisualAssets.mapAmericas}
              style={styles.map}
              resizeMode="contain"
              onLayout={onMapLayout}
            >
              {COUNTRIES.map((c) => {
                const unlocked = isCountryUnlocked(progress, c.order);
                const pos = PIN[c.id];
                const active = current?.id === c.id;
                return (
                  <Pressable
                    key={c.id}
                    disabled={!unlocked || flying}
                    onPress={() => router.push(`/country/${c.id}`)}
                    hitSlop={12}
                    style={[
                      styles.pin,
                      {
                        top: `${pos.top * 100}%` as DimensionValue,
                        left: `${pos.left * 100}%` as DimensionValue,
                      },
                      !unlocked && styles.pinLocked,
                      active && styles.pinActive,
                    ]}
                  >
                    <Text style={styles.pinLabel}>{c.id.toUpperCase()}</Text>
                  </Pressable>
                );
              })}
              {flying ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.plane,
                    { transform: [{ translateX: planeX }, { translateY: planeY }] },
                  ]}
                >
                  <Image
                    source={VisualAssets.plane}
                    style={styles.planeImg}
                    contentFit="contain"
                  />
                </Animated.View>
              ) : null}
              {flying ? <View style={styles.block} /> : null}
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
            disabled={!canGo || flying}
            onPress={onTravel}
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
          disabled={flying}
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
  plane: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: PLANE,
    height: PLANE,
  },
  planeImg: {
    width: PLANE,
    height: PLANE,
  },
  block: {
    ...StyleSheet.absoluteFillObject,
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
