import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Font } from '../theme';
import { useApp } from '../store/AppContext';
import { formatDate, peso } from '../utils/format';
import { ProductImage } from '../components/ProductImage';
import { EmptyState } from '../components/EmptyState';
import { useWebDesktop } from '../hooks/useWebDesktop';

export default function OrderSuccess() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useApp();
  const isDesktop = useWebDesktop();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <View style={styles.missing}>
        <EmptyState
          icon="receipt-outline"
          title="Order not found"
          subtitle="It may have been cleared with demo data."
        />
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.btn}>
          <Text style={styles.btnText}>Continue Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, isDesktop && web.content]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.check}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>Order Successful</Text>
        <Text style={styles.orderNo}>Order {order.id}</Text>
        <Text style={styles.date}>{formatDate(order.date)}</Text>
      </View>

      <View style={styles.items}>
        {order.items.map((i, idx) => (
          <View key={`${i.productId}-${i.size}-${idx}`} style={styles.row}>
            <ProductImage uri={i.image} style={styles.thumb} iconSize={20} />
            <View style={styles.info}>
              <Text style={styles.pname} numberOfLines={1}>
                {i.name}
              </Text>
              <Text style={styles.psub}>
                Size {i.size} · {i.colorName} · x{i.qty}
              </Text>
            </View>
            <Text style={styles.pprice}>{peso(i.price * i.qty)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Subtotal</Text>
          <Text style={styles.sumValue}>{peso(order.subtotal)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Delivery Fee</Text>
          <Text style={styles.sumValue}>{peso(order.deliveryFee)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Discount</Text>
          <Text style={styles.sumValue}>
            {order.discount > 0 ? `-${peso(order.discount)}` : peso(0)}
          </Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{peso(order.total)}</Text>
        </View>
      </View>

      <Pressable onPress={() => router.replace('/(tabs)')} style={styles.btn}>
        <Text style={styles.btnText}>Continue Shopping</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/orders')} style={styles.ghost}>
        <Text style={styles.ghostText}>View My Orders</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 16 },
  content: { padding: 24, gap: 20, paddingBottom: 40, backgroundColor: '#fff', flexGrow: 1 },
  hero: { alignItems: 'center', gap: 6, marginTop: 24 },
  check: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontFamily: Font.bold, fontSize: 24, color: Colors.ink },
  orderNo: { fontFamily: Font.semiBold, fontSize: 15, color: Colors.primary },
  date: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  items: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    padding: 12,
  },
  thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#fff' },
  info: { flex: 1, minWidth: 0 },
  pname: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.ink },
  psub: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted, marginTop: 2 },
  pprice: { fontFamily: Font.bold, fontSize: 14, color: Colors.primary },
  summary: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, padding: 16, gap: 8 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sumLabel: { fontFamily: Font.regular, fontSize: 14, color: Colors.muted },
  sumValue: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.ink },
  totalLabel: { fontFamily: Font.bold, fontSize: 16, color: Colors.primary },
  totalValue: { fontFamily: Font.bold, fontSize: 18, color: Colors.primary },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontFamily: Font.semiBold, fontSize: 16, color: '#fff' },
  ghost: { alignItems: 'center', paddingVertical: 8 },
  ghostText: { fontFamily: Font.semiBold, fontSize: 15, color: Colors.primary },
});

/** Web/laptop only — never applied on native, so the phone UI is unchanged. */
const web = StyleSheet.create({
  content: { width: '100%', maxWidth: 640, alignSelf: 'center' },
});
