import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useApp } from '../../store/AppContext';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';

function columnsFor(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 700) return 3;
  return 2;
}

export default function Favorites() {
  const { products, favorites } = useApp();
  const { width } = useWindowDimensions();
  const cols = columnsFor(width);
  const items = products.filter((p) => favorites.includes(p.id));

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {items.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No favorites yet"
          subtitle="Tap the heart on any shoe to save it here."
        />
      ) : (
        <View style={styles.grid}>
          {items.map((p) => (
            <View key={p.id} style={{ width: `${100 / cols}%`, padding: 8 }}>
              <ProductCard product={p} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -8 },
});
