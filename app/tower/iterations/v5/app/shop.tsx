import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fontWeight,
  spacing,
  typography,
} from '../src/design-system/tokens';
import {
  CONTENT_PACK_PREVIEW,
  SHOP_PRODUCTS,
  type ShopProductId,
} from '../src/engine/shopCatalog';
import { useGame } from '../src/hooks/GameProvider';
import {
  chromeMedallion,
  KeepBackdrop,
  StoneButton,
  StonePlate,
} from '../src/modules/tower-ui-kit';

export default function ShopScreen() {
  const router = useRouter();
  const { startInfinite } = useGame();
  const [toast, setToast] = useState<string | null>(null);

  const onBuy = (id: ShopProductId) => {
    Alert.alert(
      'Compras próximamente',
      'La compra es solo visual en V5. No se cobrará nada todavía.',
      [
        { text: 'Entendido', style: 'cancel' },
        id === 'infinite'
          ? {
              text: 'Probar Infinito',
              onPress: () => {
                startInfinite();
                router.push('/game');
              },
            }
          : {
              text: 'Ver pack',
              onPress: () =>
                setToast('Pack bloqueado hasta IAP — solo preview'),
            },
      ],
    );
  };

  return (
    <KeepBackdrop variant="menu">
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.back}>
            <StoneButton
              label="Menú"
              variant="ghost"
              compact
              onPress={() => router.back()}
            />
          </View>
          <Text style={styles.title}>Tienda</Text>
          <Text style={styles.sub}>Precios visuales</Text>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.armory}>
            {SHOP_PRODUCTS.map((p) => (
              <StonePlate key={p.id} style={styles.panel}>
                <Image source={chromeMedallion} style={styles.medal} />
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.price}>{p.priceLabel}</Text>
                <Text style={styles.blurb}>{p.blurb}</Text>
                {p.id === 'infinite' ? (
                  <Text style={styles.bullet}>Oleadas sin fin.</Text>
                ) : (
                  <View style={styles.chips}>
                    {CONTENT_PACK_PREVIEW.towers.map((t) => (
                      <View key={t} style={styles.chip}>
                        <Text style={styles.chipText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <StoneButton
                  label="Comprar"
                  compact
                  onPress={() => onBuy(p.id)}
                />
              </StonePlate>
            ))}
          </View>
        </ScrollView>
        {toast && <Text style={styles.toast}>{toast}</Text>}
      </SafeAreaView>
    </KeepBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.md },
  header: { alignItems: 'center', paddingTop: spacing.sm, gap: 2 },
  back: { alignSelf: 'stretch' },
  title: {
    color: colors.torchGold,
    fontSize: typography.title,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sub: {
    color: colors.muted,
    marginBottom: spacing.md,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontSize: typography.sm,
  },
  list: { paddingBottom: 40 },
  armory: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  panel: { flex: 1, alignItems: 'center' },
  medal: { width: 64, height: 64, marginBottom: spacing.sm },
  cardTitle: {
    color: colors.torchGold,
    fontSize: typography.sm,
    fontWeight: fontWeight.extrabold,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  price: {
    color: colors.torchGold,
    fontWeight: fontWeight.black,
    fontSize: typography.title,
  },
  blurb: {
    color: colors.muted,
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontSize: typography.sm,
  },
  bullet: {
    color: colors.mist,
    fontSize: typography.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  chip: {
    backgroundColor: colors.keepVoid,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.torchGold,
  },
  chipText: {
    color: colors.mist,
    fontSize: typography.xs,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
  },
  toast: {
    textAlign: 'center',
    color: colors.torchGold,
    paddingVertical: spacing.sm,
  },
});
