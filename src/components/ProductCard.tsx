import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Font } from '../theme';
import type { Product } from '../types';
import { peso } from '../utils/format';
import { useApp } from '../store/AppContext';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(product.id);

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.tile}>
        <ProductImage uri={product.image} style={styles.img} iconSize={32} />
        <Pressable
          onPress={() => toggleFavorite(product.id)}
          hitSlop={8}
          style={styles.heart}
          accessibilityLabel={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={16}
            color={fav ? Colors.primary : Colors.ink}
          />
        </Pressable>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <View style={styles.row}>
        <Text style={styles.price}>{peso(product.price)}</Text>
        <View style={styles.rating}>
          <Ionicons name="star-outline" size={14} color={Colors.star} />
          <Text style={styles.score}>{product.rating.toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0, gap: 8 },
  tile: {
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  img: { width: '100%', aspectRatio: 16 / 9 },
  heart: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontFamily: Font.bold, fontSize: 16, color: Colors.primary },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  score: { fontFamily: Font.regular, fontSize: 14, color: Colors.muted },
});
