import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors, Font, LOW_STOCK_THRESHOLD } from '../theme';
import { totalStock, useApp } from '../store/AppContext';
import { ProductImage } from '../components/ProductImage';
import { EmptyState } from '../components/EmptyState';
import { useWebDesktop } from '../hooks/useWebDesktop';

export default function Inventory() {
  const { products, adjustSizeStock, setAvailable } = useApp();
  const isDesktop = useWebDesktop();

  if (products.length === 0) {
    return (
      <View style={styles.empty}>
        <EmptyState
          icon="layers-outline"
          title="No products"
          subtitle="Add products to manage inventory."
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, isDesktop && web.content]}
      showsVerticalScrollIndicator={false}
    >
      {products.map((p) => {
        const total = totalStock(p);
        const low = total <= LOW_STOCK_THRESHOLD;
        return (
          <View key={p.id} style={styles.card}>
            <View style={styles.head}>
              <ProductImage uri={p.image} style={styles.thumb} iconSize={20} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.brand}>{p.brand}</Text>
                <Text style={[styles.stock, low && styles.low]}>
                  Stock: {total} · {p.available ? 'Available' : 'Out of Stock'}
                  {low ? (total === 0 ? ' (Out of Stock)' : ' (Low Stock)') : ''}
                </Text>
              </View>
            </View>

            <View style={styles.sizes}>
              {p.sizes.map((s) => {
                const v = p.stockBySize[s] ?? 0;
                return (
                  <View key={s} style={styles.sizeRow}>
                    <Text style={styles.sizeLabel}>{s}</Text>
                    <View style={styles.stepper}>
                      <Pressable
                        onPress={() => adjustSizeStock(p.id, s, -1)}
                        style={styles.stepBtn}
                        accessibilityLabel={`Decrease stock size ${s}`}
                      >
                        <Text style={styles.stepText}>{'\u2212'}</Text>
                      </Pressable>
                      <Text style={styles.qty}>{v}</Text>
                      <Pressable
                        onPress={() => adjustSizeStock(p.id, s, 1)}
                        style={styles.stepBtn}
                        accessibilityLabel={`Increase stock size ${s}`}
                      >
                        <Text style={styles.stepText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={[styles.row, isDesktop && web.row]}>
              <Pressable
                onPress={() => setAvailable(p.id, true)}
                disabled={total <= 0}
                style={[
                  styles.mini,
                  p.available && styles.on,
                  total <= 0 && styles.disabled,
                  isDesktop && web.mini,
                ]}
              >
                <Text style={[styles.miniText, p.available && styles.onText]}>
                  Mark Available
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setAvailable(p.id, false)}
                style={[styles.mini, !p.available && styles.off, isDesktop && web.mini]}
              >
                <Text style={[styles.miniText, !p.available && styles.offText]}>
                  Out of Stock
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push(`/product-form?id=${p.id}`)}
                style={[styles.mini, isDesktop && web.mini]}
              >
                <Text style={styles.miniText}>Edit</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, padding: 12, gap: 12 },
  head: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  info: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: Font.semiBold, fontSize: 15, color: Colors.ink },
  brand: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  stock: { fontFamily: Font.regular, fontSize: 12, color: Colors.muted },
  low: { color: Colors.danger, fontFamily: Font.semiBold },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.pinkBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sizeLabel: { fontFamily: Font.bold, fontSize: 13, color: Colors.ink, minWidth: 22 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 16, color: Colors.ink, fontFamily: Font.semiBold },
  qty: { minWidth: 24, textAlign: 'center', fontFamily: Font.bold, fontSize: 14, color: Colors.ink },
  row: { flexDirection: 'row', gap: 8 },
  mini: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.pinkBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  miniText: { fontFamily: Font.semiBold, fontSize: 12, color: Colors.primary },
  on: { backgroundColor: Colors.primary },
  onText: { color: '#fff' },
  off: { backgroundColor: '#FDECEC' },
  offText: { color: Colors.danger },
  disabled: { opacity: 0.4 },
});

/** Web/laptop only — never applied on native, so the phone UI is unchanged. */
const web = StyleSheet.create({
  content: { width: '100%', maxWidth: 960, alignSelf: 'center' },
  row: { flexWrap: 'wrap' },
  mini: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: 'auto',
    minWidth: 140,
    maxWidth: 220,
    paddingHorizontal: 16,
  },
});
