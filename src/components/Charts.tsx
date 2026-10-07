import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Font } from '../theme';

/** Horizontal bars: label, bar, value. Pure Views — Expo Go + Web safe. */
export function HBarChart({
  data,
  formatValue,
  barColor = Colors.primary,
}: {
  data: { label: string; value: number }[];
  formatValue?: (v: number) => string;
  barColor?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.col}>
      {data.map((d) => (
        <View key={d.label} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>
            {d.label}
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${Math.max(4, (d.value / max) * 100)}%`, backgroundColor: barColor },
              ]}
            />
          </View>
          <Text style={styles.value}>{formatValue ? formatValue(d.value) : d.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Vertical bars for time series. Scrolls horizontally when many points. */
export function VBarChart({
  data,
  formatValue,
  height = 150,
}: {
  data: { label: string; value: number }[];
  formatValue?: (v: number) => string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vrow}>
      {data.map((d) => (
        <View key={d.label} style={styles.vcol}>
          <Text style={styles.vvalue} numberOfLines={1}>
            {formatValue ? formatValue(d.value) : d.value}
          </Text>
          <View style={[styles.vtrack, { height }]}>
            <View
              style={[
                styles.vfill,
                { height: `${Math.max(3, (d.value / max) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.vlabel} numberOfLines={1}>
            {d.label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  col: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 110, fontFamily: Font.semiBold, fontSize: 12, color: Colors.ink },
  track: { flex: 1, height: 12, borderRadius: 6, backgroundColor: Colors.pinkBg, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  value: { width: 64, textAlign: 'right', fontFamily: Font.bold, fontSize: 12, color: Colors.ink },
  vrow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, paddingVertical: 4 },
  vcol: { width: 52, alignItems: 'center', gap: 6 },
  vvalue: { fontFamily: Font.bold, fontSize: 11, color: Colors.ink },
  vtrack: {
    width: 28,
    borderRadius: 8,
    backgroundColor: Colors.pinkBg,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  vfill: { width: '100%', backgroundColor: Colors.primary, borderRadius: 8 },
  vlabel: { fontFamily: Font.regular, fontSize: 11, color: Colors.muted },
});
