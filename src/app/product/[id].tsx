import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Font } from '../../theme';
import { isPurchasable, sizeAvailable, totalStock, useApp } from '../../store/AppContext';
import { peso } from '../../utils/format';
import { ProductImage } from '../../components/ProductImage';
import { EmptyState } from '../../components/EmptyState';
import { Toast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useWebDesktop } from '../../hooks/useWebDesktop';

const SIZE_CHART = [
  { eu: '38', us: '6', cm: '24.0' },
  { eu: '39', us: '6.5', cm: '24.5' },
  { eu: '40', us: '7', cm: '25.0' },
  { eu: '41', us: '8', cm: '26.0' },
  { eu: '42', us: '8.5', cm: '26.5' },
  { eu: '43', us: '9.5', cm: '27.5' },
];

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productById, addToCart, isFavorite, toggleFavorite } = useApp();
  const product = productById(id ?? '');
  const isDesktop = useWebDesktop();

  const [size, setSize] = useState<string | null>(null);
  const [colorIdx, setColorIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [chartOpen, setChartOpen] = useState(false);

  const color = useMemo(
    () => product?.colors[Math.min(colorIdx, (product?.colors.length ?? 1) - 1)],
    [product, colorIdx],
  );

  if (!product) {
    return (
      <View style={styles.missing}>
        <EmptyState
          icon="alert-circle-outline"
          title="Product not found"
          subtitle="It may have been deleted. Your past orders are unaffected."
        />
      </View>
    );
  }

  const purchasable = isPurchasable(product);

  const validate = (): string | null => {
    if (!purchasable) return 'This product is out of stock.';
    if (product.colors.length > 0 && !color) return 'Please select a color.';
    if (!size) return 'Please select a size.';
    if (!sizeAvailable(product, size)) return `Size ${size} is out of stock.`;
    return null;
  };

  const handleAdd = () => {
    const err = validate();
    if (err) {
      setToast(err);
      return;
    }
    const res = addToCart({
      productId: product.id,
      size: size!,
      colorName: color?.name ?? 'Default',
      qty: 1,
    });
    setToast(res.ok ? `${product.name} added to your bag.` : res.message);
  };

  const handleBuy = () => {
    const err = validate();
    if (err) {
      setToast(err);
      return;
    }
    const res = addToCart({
      productId: product.id,
      size: size!,
      colorName: color?.name ?? 'Default',
      qty: 1,
    });
    if (!res.ok) {
      setToast(res.message);
      return;
    }
    router.push('/checkout');
  };

  const fav = isFavorite(product.id);

  const galleryEl = (
    <View style={[styles.gallery, isDesktop && web.gallery]}>
      <ProductImage
        uri={product.image}
        style={[styles.hero, isDesktop && web.hero]}
        resizeMode={isDesktop ? 'contain' : 'cover'}
        iconSize={64}
      />
      <Pressable
        onPress={() => toggleFavorite(product.id)}
        style={styles.heart}
        accessibilityLabel="Toggle favorite"
      >
        <Ionicons
          name={fav ? 'heart' : 'heart-outline'}
          size={20}
          color={fav ? Colors.primary : Colors.ink}
        />
      </Pressable>
    </View>
  );

  const identityEl = (
    <View style={styles.identity}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.rating}>
          <Ionicons name="star-outline" size={16} color={Colors.star} />
          <Text style={styles.score}>{product.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.price}>{peso(product.price)}</Text>
      {!purchasable ? (
        <Text style={styles.oos}>Out of stock — {totalStock(product)} left</Text>
      ) : null}
    </View>
  );

  const colorEl =
    product.colors.length > 0 ? (
      <View style={styles.block}>
        <View style={styles.labelRow}>
          <Text style={styles.blockTitle}>Color</Text>
          <Text style={styles.colorName}>· {color?.name}</Text>
        </View>
        <View style={styles.swatches}>
          {product.colors.map((c, i) => (
            <Pressable
              key={`${c.name}-${i}`}
              onPress={() => setColorIdx(i)}
              style={[
                styles.swatch,
                { backgroundColor: c.hex },
                i === colorIdx && styles.swatchActive,
              ]}
              accessibilityLabel={c.name}
            />
          ))}
        </View>
      </View>
    ) : null;

  const sizeEl = (
    <View style={styles.block}>
      <View style={styles.sizeHead}>
        <Text style={styles.sectionTitle}>Select Size</Text>
        <Pressable onPress={() => setChartOpen(true)} hitSlop={8}>
          <Text style={styles.chartLink}>Size Chart</Text>
        </Pressable>
      </View>
      <View style={styles.sizes}>
        {product.sizes.map((s) => {
          const avail = sizeAvailable(product, s);
          const active = size === s;
          return (
            <Pressable
              key={s}
              disabled={!avail}
              onPress={() => setSize(s)}
              style={[
                styles.size,
                active && styles.sizeActive,
                !avail && styles.sizeDisabled,
              ]}
            >
              <Text
                style={[
                  styles.sizeText,
                  active && styles.sizeTextActive,
                  !avail && styles.sizeTextDisabled,
                ]}
              >
                {s}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const descEl = (
    <View style={styles.block}>
      <Text style={styles.descTitle}>Product Description</Text>
      <Text style={styles.desc}>{product.description || 'No description available.'}</Text>
      <Text style={styles.meta}>
        {product.brand} · {product.category}
      </Text>
    </View>
  );

  const actionsEl = (
    <View style={[styles.actions, isDesktop && web.actions]}>
      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [styles.cartBtn, pressed && { opacity: 0.8 }]}
        accessibilityLabel="Add to cart"
      >
        <Ionicons name="cart-outline" size={24} color={Colors.primary} />
      </Pressable>
      <Pressable
        onPress={handleBuy}
        style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.buyText}>Buy Now</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {isDesktop ? (
        <ScrollView
          contentContainerStyle={[styles.content, web.content]}
          showsVerticalScrollIndicator={false}
        >
          <View style={web.topRow}>
            <View style={web.left}>{galleryEl}</View>
            <View style={web.right}>
              {identityEl}
              {colorEl}
              {sizeEl}
            </View>
          </View>
          {descEl}
          {actionsEl}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {galleryEl}
          {identityEl}
          {colorEl}
          {sizeEl}
          {descEl}
          {actionsEl}
        </ScrollView>
      )}

      <ConfirmModal
        visible={chartOpen}
        title="Size Chart (EU / US / CM)"
        message={SIZE_CHART.map((r) => `EU ${r.eu}  ·  US ${r.us}  ·  ${r.cm} cm`).join('\n')}
        confirmLabel="Got it"
        onConfirm={() => setChartOpen(false)}
        onCancel={() => setChartOpen(false)}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  gallery: {
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  hero: { width: '100%', aspectRatio: 16 / 9 },
  heart: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  name: { fontFamily: Font.bold, fontSize: 20, color: Colors.ink, flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  score: { fontFamily: Font.regular, fontSize: 14, color: Colors.muted },
  price: { fontFamily: Font.bold, fontSize: 24, color: Colors.primary },
  oos: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.danger },
  block: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blockTitle: { fontFamily: Font.semiBold, fontSize: 16, color: Colors.ink },
  colorName: { fontFamily: Font.regular, fontSize: 14, color: Colors.muted },
  swatches: { flexDirection: 'row', gap: 16 },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  swatchActive: { borderWidth: 2, borderColor: Colors.primary },
  sizeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: Font.bold, fontSize: 18, color: Colors.ink },
  chartLink: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.primary },
  sizes: { flexDirection: 'row', gap: 8 },
  size: {
    flex: 1,
    minWidth: 0,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.pinkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeActive: { backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.primary },
  sizeDisabled: { opacity: 0.4 },
  sizeText: { fontFamily: Font.regular, fontSize: 14, color: Colors.ink },
  sizeTextActive: { fontFamily: Font.semiBold, color: Colors.primary },
  sizeTextDisabled: { textDecorationLine: 'line-through' },
  descTitle: { fontFamily: Font.bold, fontSize: 16, color: Colors.ink },
  desc: { fontFamily: Font.regular, fontSize: 14, lineHeight: 20, color: Colors.muted },
  meta: { fontFamily: Font.regular, fontSize: 13, color: Colors.faint },
  actions: { flexDirection: 'row', gap: 16, height: 48 },
  cartBtn: {
    width: 56,
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: { fontFamily: Font.semiBold, fontSize: 16, color: '#fff' },
});

/** Web/laptop only — never applied on native, so the phone UI is unchanged. */
const web = StyleSheet.create({
  content: { width: '100%', maxWidth: 1000, alignSelf: 'center' },
  topRow: { flexDirection: 'row', gap: 24, alignItems: 'flex-start' },
  left: { flex: 1, minWidth: 280, maxWidth: 520 },
  right: { flex: 1, minWidth: 280, gap: 16 },
  gallery: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  hero: { width: '100%', maxWidth: 500, maxHeight: 400, aspectRatio: 4 / 3 },
  actions: { maxWidth: 480 },
});
