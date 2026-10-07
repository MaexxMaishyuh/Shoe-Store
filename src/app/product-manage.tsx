import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Font } from '../theme';
import { totalStock, useApp } from '../store/AppContext';
import { peso } from '../utils/format';
import { ProductImage } from '../components/ProductImage';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';
import { Toast } from '../components/Toast';
import { useWebDesktop } from '../hooks/useWebDesktop';
import { useProductSearch } from '../services/useProductSearch';

function columnsFor(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 700) return 3;
  if (width >= 500) return 2;
  return 1;
}

export default function ProductManage() {
  const { products, deleteProduct } = useApp();
  const isDesktop = useWebDesktop();
  const { width } = useWindowDimensions();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const cols = columnsFor(width);
  const [query, setQuery] = useState('');
  const results = useProductSearch(query, products);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[styles.content, { flex: 1 }, isDesktop && web.content]}>
        <Pressable onPress={() => router.push('/product-form')} style={[styles.addBtn, isDesktop && web.addBtn]}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add Product</Text>
        </Pressable>

        <TextInput value={query} onChangeText={setQuery} placeholder="Search products by name..." accessibilityLabel="Search products" style={{ padding: 12, borderWidth: 1, borderColor: Colors.line, borderRadius: 12 }} />
        {results.length === 0 ? (
          <EmptyState
            icon="cube-outline"
            title={query ? "No matching products" : "No products"}
            subtitle={query ? "Try another keyword." : "Add your first product to start selling."}
          />
        ) : (
          <FlatList data={results} keyExtractor={(p) => p.id} numColumns={cols} key={cols}
            style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled"
            renderItem={({ item: p }) => {
              const stock = totalStock(p);
              return (
                <View key={p.id} style={[{ flex: 1, maxWidth: `${100 / cols}%`, padding: 6 }, styles.cell]}>
                  <View style={styles.card}>
                    <ProductImage uri={p.image} style={styles.img} iconSize={28} />
                    <Text style={styles.name} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.brand}>
                      {p.brand} · {peso(p.price)}
                    </Text>
                    <Text style={[styles.stock, stock <= 5 && styles.low]}>
                      Stock: {stock} · {p.available ? 'Available' : 'Out of Stock'}
                    </Text>
                    <View style={styles.row}>
                      <Pressable
                        onPress={() => router.push(`/product-form?id=${p.id}`)}
                        style={[styles.mini, styles.edit]}
                      >
                        <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
                        <Text style={styles.editText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setPendingDelete(p.id)}
                        style={[styles.mini, styles.del]}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                        <Text style={styles.delText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      <ConfirmModal
        visible={pendingDelete !== null}
        title="Delete product?"
        message="Are you sure you want to delete this product? Past orders will keep their records."
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDelete) deleteProduct(pendingDelete);
          setPendingDelete(null);
          setToast('Product deleted.');
        }}
        onCancel={() => setPendingDelete(null)}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addText: { fontFamily: Font.semiBold, fontSize: 16, color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -6 },
  cell: { minWidth: 0 },
  card: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, padding: 10, gap: 6 },
  img: { width: '100%', aspectRatio: 16 / 10, borderRadius: 8 },
  name: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.ink },
  brand: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  stock: { fontFamily: Font.regular, fontSize: 12, color: Colors.muted },
  low: { color: Colors.danger, fontFamily: Font.semiBold },
  row: { flexDirection: 'row', gap: 8, marginTop: 2 },
  mini: {
    flex: 1,
    flexDirection: 'row',
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  edit: { backgroundColor: Colors.pinkBg },
  editText: { fontFamily: Font.semiBold, fontSize: 13, color: Colors.primary },
  del: { backgroundColor: '#FDECEC' },
  delText: { fontFamily: Font.semiBold, fontSize: 13, color: Colors.danger },
});

/** Web/laptop only — never applied on native, so the phone UI is unchanged. */
const web = StyleSheet.create({
  content: { width: '100%', maxWidth: 1100, alignSelf: 'center' },
  addBtn: { width: '100%', maxWidth: 480, alignSelf: 'center' },
});
