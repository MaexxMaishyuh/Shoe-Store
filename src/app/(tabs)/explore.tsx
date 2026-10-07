import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRANDS, Colors, Font } from '../../theme';
import { useApp } from '../../store/AppContext';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import { useProductSearch } from '../../services/useProductSearch';

function columnsFor(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 700) return 3;
  return 2;
}

export default function Explore() {
  const { products } = useApp();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('');
  const cols = columnsFor(width);

  const sqlProducts = useProductSearch(query, products);
  const filtered = useMemo(() => sqlProducts.filter((p) => !brand || p.brand === brand), [sqlProducts, brand]);

  return (
    <View style={[styles.content, { flex: 1 }]}>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={Colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search shoes, brands..."
          placeholderTextColor={Colors.faint}
          style={styles.input}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={Colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal style={{ flexGrow: 0, maxHeight: 52 }} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Pressable
          onPress={() => setBrand('')}
          style={[styles.chip, brand === '' && styles.chipActive]}
        >
          <Text style={[styles.chipText, brand === '' && styles.chipTextActive]}>All</Text>
        </Pressable>
        {BRANDS.map((b) => (
          <Pressable
            key={b}
            onPress={() => setBrand((cur) => (cur === b ? '' : b))}
            style={[styles.chip, brand === b && styles.chipActive]}
          >
            <Text style={[styles.chipText, brand === b && styles.chipTextActive]}>{b}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No results found"
          subtitle="Try a different search or brand filter."
        />
      ) : (
        <FlatList data={filtered} keyExtractor={(p) => p.id} numColumns={cols} key={cols}
          style={{ flex: 1 }} keyboardShouldPersistTaps="handled"
          renderItem={({ item: p }) => (
            <View key={p.id} style={{ flex: 1, maxWidth: `${100 / cols}%`, padding: 8 }}>
              <ProductCard product={p} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 32, flexGrow: 1 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  input: { flex: 1, fontFamily: Font.regular, fontSize: 15, color: Colors.ink },
  chips: { gap: 8, paddingVertical: 4 },
  chip: {
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontFamily: Font.regular, fontSize: 14, color: Colors.ink },
  chipTextActive: { fontFamily: Font.semiBold, color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -8 },
});
