import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { GIFT_STOCK_CAP, REWARD_POOL_SIZE, SHOP_PRICE } from '../src/constants/game';
import { colors, fonts, radius, spacing, typography } from '../src/constants/theme';
import { GIFT_TITLES, giftIndex, rewardIdFromGiftN } from '../src/data/gifts';
import { useProgress } from '../src/hooks/ProgressProvider';
import { VisualAssets } from '../src/modules/match3-visual/assets';
import { CoinMark } from '../src/modules/match3-visual/CoinMark';
import { formatCoins } from '../src/modules/match3-visual/formatCoins';
import { NightScreen } from '../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../src/modules/match3-visual/PixelPanel';
import { SheetSprite } from '../src/modules/match3-visual/SheetSprite';
import {
  canBuyGift,
  inventoryCount,
} from '../src/modules/progress/progressStore';

export default function ShopScreen() {
  const { progress, buyShopGift } = useProgress();
  const gifts = Array.from({ length: REWARD_POOL_SIZE }, (_, i) => i + 1);

  return (
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <PixelPanel>
          <View style={styles.top}>
            <Text style={styles.title}>TIENDA</Text>
            <View style={styles.coins}>
              <CoinMark size={20} />
              <Text style={styles.coinText}>{formatCoins(progress.coins)}</Text>
            </View>
          </View>
        </PixelPanel>

        <ScrollView contentContainerStyle={styles.grid}>
          {gifts.map((n) => {
            const rewardId = rewardIdFromGiftN(n);
            const idx = giftIndex(n);
            const qty = inventoryCount(progress, rewardId);
            const atCap = qty >= GIFT_STOCK_CAP;
            const canBuy = canBuyGift(progress, n);
            return (
              <View key={n} style={styles.slotWrap}>
                <PixelPanel
                  style={atCap ? styles.slotMax : undefined}
                >
                  <View style={styles.slot}>
                    <Text style={styles.qty}>x{qty}</Text>
                    <SheetSprite
                      source={VisualAssets.gifts}
                      cols={4}
                      rows={2}
                      col={idx % 4}
                      row={Math.floor(idx / 4)}
                      size={48}
                    />
                    <Text style={styles.name} numberOfLines={1}>
                      {GIFT_TITLES[n - 1]}
                    </Text>
                    {atCap ? (
                      <View style={styles.maxRibbon}>
                        <Text style={styles.maxLabel}>MAX</Text>
                      </View>
                    ) : null}
                    <View style={styles.priceRow}>
                      <CoinMark size={12} />
                      <Text style={styles.price}>{formatCoins(SHOP_PRICE)}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        atCap ? `${GIFT_TITLES[n - 1]} al máximo` : `Comprar ${GIFT_TITLES[n - 1]}`
                      }
                      disabled={!canBuy}
                      onPress={() => void buyShopGift(n)}
                      style={[
                        styles.buy,
                        !canBuy && styles.buyOff,
                      ]}
                    >
                      <Text style={styles.buyLabel}>
                        {atCap ? 'MAX' : 'COMPRAR'}
                      </Text>
                    </Pressable>
                  </View>
                </PixelPanel>
              </View>
            );
          })}
        </ScrollView>

        <Text style={styles.footer}>MÁXIMO {GIFT_STOCK_CAP} POR REGALO</Text>
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
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: typography.title,
    color: colors.star,
  },
  coins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinText: {
    fontFamily: fonts.pixel,
    fontSize: typography.body,
    color: colors.star,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  slotWrap: {
    width: '47%',
    flexGrow: 1,
  },
  slotMax: {
    borderColor: colors.panic,
  },
  slot: {
    alignItems: 'center',
    gap: 6,
    minHeight: 160,
  },
  qty: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.cyanHi,
    alignSelf: 'flex-start',
  },
  name: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.star,
  },
  maxRibbon: {
    backgroundColor: colors.panic,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  maxLabel: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.star,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.coin,
  },
  buy: {
    backgroundColor: colors.cyan,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: colors.outline,
    minWidth: 96,
    alignItems: 'center',
  },
  buyOff: {
    backgroundColor: colors.locked,
    opacity: 0.7,
  },
  buyLabel: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.star,
    fontWeight: '700',
  },
  footer: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.cyanHi,
    textAlign: 'center',
  },
});
