import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../src/design-system/tokens';
import {
  CONTENT_PACK_PREVIEW,
  SHOP_PRODUCTS,
  type ShopProductId,
} from '../src/engine/shopCatalog';
import { useGame } from '../src/hooks/GameProvider';
import {
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
        <StoneButton label="← Menú" variant="ghost" onPress={() => router.back()} />
        <Text style={styles.title}>Tienda</Text>
        <Text style={styles.sub}>Armería · precios visuales · sin cobros</Text>

        <ScrollView contentContainerStyle={styles.list}>
          {SHOP_PRODUCTS.map((p) => (
            <StonePlate key={p.id}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.price}>{p.priceLabel}</Text>
              </View>
              <Text style={styles.blurb}>{p.blurb}</Text>
              {p.bullets.map((b) => (
                <Text key={b} style={styles.bullet}>
                  · {b}
                </Text>
              ))}
              {p.id === 'content_pack' && (
                <View style={styles.preview}>
                  <Text style={styles.previewTitle}>Mapas (preview)</Text>
                  <Text style={styles.previewBody}>
                    {CONTENT_PACK_PREVIEW.maps.join(' · ')}
                  </Text>
                  <Text style={styles.previewTitle}>Torres nuevas</Text>
                  <Text style={styles.previewBody}>
                    {CONTENT_PACK_PREVIEW.towers.join(' · ')}
                  </Text>
                  <Text style={styles.previewTitle}>Hardcore</Text>
                  <Text style={styles.previewBody}>
                    {CONTENT_PACK_PREVIEW.hardcore}
                  </Text>
                </View>
              )}
              <StoneButton
                label="Comprar"
                onPress={() => onBuy(p.id)}
              />
            </StonePlate>
          ))}
        </ScrollView>
        {toast && <Text style={styles.toast}>{toast}</Text>}
      </SafeAreaView>
    </KeepBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.md },
  title: {
    color: colors.mist,
    fontSize: typography.title,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  sub: { color: colors.muted, marginBottom: spacing.md },
  list: { gap: spacing.md, paddingBottom: 40 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardTitle: {
    color: colors.mist,
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  price: {
    color: colors.torchGold,
    fontWeight: '900',
    fontSize: typography.subtitle,
  },
  blurb: { color: colors.muted, marginBottom: spacing.xs },
  bullet: { color: colors.mist, fontSize: typography.sm },
  preview: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.keepVoid,
    borderRadius: 10,
    gap: spacing.xs,
  },
  previewTitle: {
    color: colors.torchGold,
    fontSize: typography.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  previewBody: {
    color: colors.muted,
    fontSize: typography.sm,
    lineHeight: 18,
  },
  toast: {
    textAlign: 'center',
    color: colors.torchGold,
    paddingVertical: spacing.sm,
  },
});
