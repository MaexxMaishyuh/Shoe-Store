import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ORDER_STATUSES, Colors, Font, type OrderStatus } from '../theme';
import { useApp } from '../store/AppContext';
import { formatDate, peso } from '../utils/format';
import { ProductImage } from '../components/ProductImage';
import { EmptyState } from '../components/EmptyState';
import { useWebDesktop } from '../hooks/useWebDesktop';

function statusColor(s: OrderStatus): string {
  switch (s) {
    case 'Pending':
      return Colors.warning;
    case 'Processing':
      return Colors.primary;
    case 'Shipped':
      return '#2B6CB0';
    case 'Delivered':
      return Colors.success;
    case 'Cancelled':
      return Colors.danger;
  }
}

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending: 'Processing',
  Processing: 'Shipped',
  Shipped: 'Delivered',
};

export default function Orders() {
  const { orders, updateOrderStatus } = useApp();
  const isDesktop = useWebDesktop();
  const [expanded, setExpanded] = useState<string | null>(orders[0]?.id ?? null);

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <EmptyState
          icon="receipt-outline"
          title="No orders yet"
          subtitle="Completed checkouts will appear here."
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, isDesktop && web.content]}
      showsVerticalScrollIndicator={false}
    >
      {orders.map((o) => {
        const open = expanded === o.id;
        const count = o.items.reduce((s, i) => s + i.qty, 0);
        return (
          <View key={o.id} style={styles.card}>
            <Pressable onPress={() => setExpanded(open ? null : o.id)}>
              <View style={styles.head}>
                <View style={styles.headText}>
                  <Text style={styles.oid}>{o.id}</Text>
                  <Text style={styles.date}>{formatDate(o.date)}</Text>
                </View>
                <View style={[styles.pill, { backgroundColor: `${statusColor(o.status)}1A` }]}>
                  <Text style={[styles.pillText, { color: statusColor(o.status) }]}>{o.status}</Text>
                </View>
              </View>
              <View style={styles.head2}>
                <Text style={styles.items}>
                  {count} item{count === 1 ? '' : 's'}
                </Text>
                <Text style={styles.total}>{peso(o.total)}</Text>
              </View>
            </Pressable>

            {open ? (
              <View style={styles.detail}>
                {o.items.map((i, idx) => (
                  <View key={`${i.productId}-${i.size}-${idx}`} style={styles.row}>
                    <ProductImage uri={i.image} style={styles.thumb} iconSize={18} />
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
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusChips}>
                    {ORDER_STATUSES.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => updateOrderStatus(o.id, s)}
                        style={[styles.chip, o.status === s && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, o.status === s && styles.chipTextActive]}>
                          {s}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
                {NEXT[o.status] ? (
                  <Pressable
                    onPress={() => updateOrderStatus(o.id, NEXT[o.status]!)}
                    style={[styles.advance, isDesktop && web.advance]}
                  >
                    <Text style={styles.advanceText}>Mark as {NEXT[o.status]}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, padding: 14, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headText: { gap: 2 },
  oid: { fontFamily: Font.bold, fontSize: 15, color: Colors.ink },
  date: { fontFamily: Font.regular, fontSize: 12, color: Colors.muted },
  pill: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontFamily: Font.semiBold, fontSize: 12 },
  head2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  items: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  total: { fontFamily: Font.bold, fontSize: 16, color: Colors.primary },
  detail: { gap: 8, marginTop: 8, borderTopWidth: 1, borderTopColor: Colors.line, paddingTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: Colors.pinkBg },
  info: { flex: 1, minWidth: 0 },
  pname: { fontFamily: Font.semiBold, fontSize: 13, color: Colors.ink },
  psub: { fontFamily: Font.regular, fontSize: 12, color: Colors.muted },
  pprice: { fontFamily: Font.bold, fontSize: 13, color: Colors.primary },
  statusRow: { gap: 8, marginTop: 4 },
  statusLabel: { fontFamily: Font.semiBold, fontSize: 13, color: Colors.ink },
  statusChips: { gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontFamily: Font.semiBold, fontSize: 12, color: Colors.muted },
  chipTextActive: { color: '#fff' },
  advance: {
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  advanceText: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.primary },
});

/** Web/laptop only — never applied on native, so the phone UI is unchanged. */
const web = StyleSheet.create({
  content: { width: '100%', maxWidth: 860, alignSelf: 'center' },
  advance: { alignSelf: 'flex-start', width: '100%', minWidth: 180, maxWidth: 280 },
});
