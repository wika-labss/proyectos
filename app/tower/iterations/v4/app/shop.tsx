import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import {
  CONTENT_PACK_PREVIEW,
  SHOP_PRODUCTS,
  type ShopProductId,
} from '../src/engine/shopCatalog';
import { useGame } from '../src/hooks/GameProvider';

export default function ShopScreen() {
  const router = useRouter();
  const { startInfinite } = useGame();
  const [toast, setToast] = useState<string | null>(null);

  const onBuy = (id: ShopProductId) => {
    Alert.alert(
      'Compras próximamente',
      'La compra es solo visual en V4. No se cobrará nada todavía.',
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
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Menú</Text>
        </Pressable>
        <Text style={styles.title}>Tienda</Text>
        <Text style={styles.sub}>
          Precios visuales · sin cobros reales en V4
        </Text>

        <ScrollView contentContainerStyle={styles.list}>
          {SHOP_PRODUCTS.map((p) => (
            <View key={p.id} style={styles.card}>
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
              <Pressable style={styles.buy} onPress={() => onBuy(p.id)}>
                <Text style={styles.buyText}>Comprar (visual)</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
        {toast && <Text style={styles.toast}>{toast}</Text>}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safe: { flex: 1, paddingHorizontal: 16 },
  back: { color: colors.muted, fontWeight: '600', marginTop: 8 },
  title: {
    color: colors.mist,
    fontSize: 36,
    fontWeight: '900',
    marginTop: 8,
  },
  sub: { color: colors.muted, marginBottom: 12 },
  list: { gap: 14, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.steel,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardTitle: { color: colors.mist, fontSize: 20, fontWeight: '800' },
  price: { color: colors.gold, fontWeight: '900', fontSize: 18 },
  blurb: { color: colors.muted, marginBottom: 4 },
  bullet: { color: colors.mist, fontSize: 13 },
  preview: {
    marginTop: 8,
    padding: 10,
    backgroundColor: colors.steel,
    borderRadius: 10,
    gap: 4,
  },
  previewTitle: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  previewBody: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  buy: {
    marginTop: 12,
    backgroundColor: colors.ember,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyText: { color: colors.mist, fontWeight: '800' },
  toast: {
    textAlign: 'center',
    color: colors.gold,
    paddingVertical: 8,
  },
});
