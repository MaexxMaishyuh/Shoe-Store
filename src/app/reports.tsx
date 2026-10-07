import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors, Font, LOW_STOCK_THRESHOLD } from '../theme';
import { totalStock, useApp } from '../store/AppContext';
import { monthKey, monthLabel, peso, shortDayLabel, weekKey } from '../utils/format';
import { HBarChart, VBarChart } from '../components/Charts';
import { EmptyState } from '../components/EmptyState';

type Range = 'daily' | 'weekly' | 'monthly';

export default function Reports() {
  const { orders, products } = useApp();
  const [range, setRange] = useState<Range>('daily');

  const totalSales = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const totalOrders = orders.length;
  const aov = totalOrders === 0 ? 0 : Math.round(totalSales / totalOrders);

  const bestSellers = useMemo(() => {
    const map = new Map<string, { name: string; qty: number }>();
    for (const o of orders) {
      if (o.status === 'Cancelled') continue;
      for (const i of o.items) {
        const cur = map.get(i.productId) ?? { name: i.name, qty: 0 };
        cur.qty += i.qty;
        map.set(i.productId, cur);
      }
    }
    return [...map.values()]
      .map((v) => ({ label: v.name, value: v.qty }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [orders]);

  const byBrand = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      if (o.status === 'Cancelled') continue;
      for (const i of o.items) {
        map.set(i.brand, (map.get(i.brand) ?? 0) + i.price * i.qty);
      }
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const overTime = useMemo(() => {
    const map = new Map<string, { key: string; label: string; value: number }>();
    const sorted = [...orders]
      .filter((o) => o.status !== 'Cancelled')
      .sort((a, b) => a.date.localeCompare(b.date));
    for (const o of sorted) {
      const key = range === 'daily' ? o.date.slice(0, 10) : range === 'weekly' ? weekKey(o.date) : monthKey(o.date);
      const label =
        range === 'daily'
          ? shortDayLabel(o.date)
          : range === 'weekly'
            ? shortDayLabel(`${key}T00:00:00.000Z`)
            : monthLabel(key);
      const cur = map.get(key) ?? { key, label, value: 0 };
      cur.value += o.total;
      map.set(key, cur);
    }
    return [...map.values()].slice(-14);
  }, [orders, range]);

  const lowStock = useMemo(
    () =>
      products
        .map((p) => ({ p, total: totalStock(p) }))
        .filter(({ total }) => total <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.total - b.total),
    [products],
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.stats}>
        <Stat label="Total Sales" value={peso(totalSales)} />
        <Stat label="Total Orders" value={String(totalOrders)} />
        <Stat label="Avg Order Value" value={peso(aov)} />
        <Stat label="Total Products" value={String(products.length)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Best-Selling Shoes</Text>
        <Text style={styles.cardSub}>Units sold, highest to lowest</Text>
        {bestSellers.length === 0 ? (
          <Text style={styles.none}>No sales yet — complete a checkout to see data.</Text>
        ) : (
          <HBarChart data={bestSellers} formatValue={(v) => `${v} sold`} />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sales by Brand</Text>
        <Text style={styles.cardSub}>Revenue per brand</Text>
        {byBrand.length === 0 ? (
          <Text style={styles.none}>No sales yet.</Text>
        ) : (
          <HBarChart data={byBrand} formatValue={(v) => peso(v)} />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sales Over Time</Text>
        <View style={styles.rangeRow}>
          {(['daily', 'weekly', 'monthly'] as Range[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRange(r)}
              style={[styles.range, range === r && styles.rangeOn]}
            >
              <Text style={[styles.rangeText, range === r && styles.rangeTextOn]}>
                {r[0].toUpperCase() + r.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        {overTime.length === 0 ? (
          <Text style={styles.none}>No sales yet.</Text>
        ) : (
          <VBarChart
            data={overTime.map((d) => ({ label: d.label, value: d.value }))}
            formatValue={(v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v))}
          />
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.lowHead}>
          <View>
            <Text style={styles.cardTitle}>Low Stock Report</Text>
            <Text style={styles.cardSub}>Stock ≤ {LOW_STOCK_THRESHOLD} (tap to manage)</Text>
          </View>
          <Pressable onPress={() => router.push('/inventory')} hitSlop={8}>
            <Text style={styles.link}>Inventory</Text>
          </Pressable>
        </View>
        {lowStock.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="Stock levels healthy"
            subtitle="No products at or below the low-stock threshold."
          />
        ) : (
          lowStock.map(({ p, total }) => (
            <Pressable
              key={p.id}
              onPress={() => router.push('/product-manage')}
              style={styles.lowRow}
            >
              <View style={styles.lowInfo}>
                <Text style={styles.lowName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.lowBrand}>{p.brand}</Text>
              </View>
              <View
                style={[styles.lowPill, { backgroundColor: total === 0 ? '#FDECEC' : '#FFF4E0' }]}
              >
                <Text style={[styles.lowPillText, { color: total === 0 ? Colors.danger : Colors.warning }]}>
                  {total === 0 ? 'Out of Stock' : `Low: ${total}`}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    minWidth: 140,
  },
  statValue: { fontFamily: Font.bold, fontSize: 20, color: Colors.primary },
  statLabel: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  card: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, padding: 16, gap: 8 },
  cardTitle: { fontFamily: Font.bold, fontSize: 17, color: Colors.ink },
  cardSub: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  none: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted, paddingVertical: 8 },
  rangeRow: { flexDirection: 'row', gap: 8 },
  range: { backgroundColor: Colors.pinkBg, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8 },
  rangeOn: { backgroundColor: Colors.primary },
  rangeText: { fontFamily: Font.semiBold, fontSize: 13, color: Colors.ink },
  rangeTextOn: { color: '#fff' },
  lowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  link: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.primary },
  lowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    gap: 8,
  },
  lowInfo: { flex: 1, minWidth: 0 },
  lowName: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.ink },
  lowBrand: { fontFamily: Font.regular, fontSize: 12, color: Colors.muted },
  lowPill: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  lowPillText: { fontFamily: Font.semiBold, fontSize: 12 },
});
