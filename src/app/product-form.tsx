import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { ALL_SIZES, BRANDS, Colors, Font } from '../theme';
import { totalStock, useApp } from '../store/AppContext';
import type { Product, ProductColor } from '../types';
import { uid } from '../utils/format';
import { Field, TextField } from '../components/Fields';
import { ProductImage } from '../components/ProductImage';
import { Toast } from '../components/Toast';
import { useWebDesktop } from '../hooks/useWebDesktop';

const PALETTE: ProductColor[] = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Blush', hex: '#F3DDD3' },
  { name: 'Purple', hex: '#8E1EA2' },
  { name: 'Lavender', hex: '#C9A9D6' },
  { name: 'Navy', hex: '#2B3A67' },
  { name: 'Grey', hex: '#9AA0A6' },
  { name: 'Honey', hex: '#E8B84B' },
];

const BLANK_STOCK: Record<string, number> = {
  '38': 5,
  '39': 5,
  '40': 5,
  '41': 5,
  '42': 5,
  '43': 5,
};

export default function ProductForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { productById, addProduct, updateProduct } = useApp();
  const isDesktop = useWebDesktop();
  const editing = id ? productById(id) : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [brand, setBrand] = useState(editing?.brand ?? 'Nike');
  const [category, setCategory] = useState(editing?.category ?? editing?.brand ?? 'Nike');
  const [price, setPrice] = useState(editing ? String(editing.price) : '');
  const [image, setImage] = useState(editing?.image ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [rating, setRating] = useState(editing ? String(editing.rating) : '4.5');
  const [colors, setColors] = useState<ProductColor[]>(
    editing?.colors ?? [PALETTE[0], PALETTE[2]],
  );
  const [sizes, setSizes] = useState<string[]>(editing?.sizes ?? [...ALL_SIZES]);
  const [stockBySize, setStockBySize] = useState<Record<string, number>>(
    editing?.stockBySize ?? { ...BLANK_STOCK },
  );
  const [available, setAvailable] = useState(editing?.available ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const total = useMemo(
    () => sizes.reduce((s, z) => s + (stockBySize[z] ?? 0), 0),
    [sizes, stockBySize],
  );

  const toggleColor = (c: ProductColor) => {
    setColors((cur) =>
      cur.some((x) => x.name === c.name) ? cur.filter((x) => x.name !== c.name) : [...cur, c],
    );
  };

  const toggleSize = (s: string) => {
    setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setToast('Photo permission is required to pick an image.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) setImage(res.assets[0].uri);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Product name is required.';
    if (!brand.trim()) e.brand = 'Brand is required.';
    const p = Number(price);
    if (price.trim() === '' || !Number.isFinite(p)) e.price = 'Enter a valid price.';
    else if (p < 0) e.price = 'Price must be non-negative.';
    const r = Number(rating);
    if (rating.trim() !== '' && (!Number.isFinite(r) || r < 0 || r > 5))
      e.rating = 'Rating must be between 0 and 5.';
    for (const s of sizes) {
      const v = stockBySize[s] ?? 0;
      if (!Number.isInteger(v) || v < 0) e[`stock_${s}`] = 'Whole number ≥ 0';
    }
    if (sizes.length === 0) e.sizes = 'Select at least one size.';
    if (colors.length === 0) e.colors = 'Select at least one color.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) {
      setToast('Please fix the highlighted fields.');
      return;
    }
    const p = Number(price);
    const r = rating.trim() === '' ? 0 : Number(rating);
    const base: Product = {
      id: editing?.id ?? uid('p'),
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim() || brand.trim(),
      price: Math.round(p * 100) / 100,
      image: image.trim(),
      description: description.trim(),
      rating: r,
      colors,
      sizes: [...sizes].sort(),
      stockBySize: Object.fromEntries(sizes.map((s) => [s, stockBySize[s] ?? 0])),
      available: total > 0 ? available : false,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    if (editing) {
      updateProduct(base);
      setToast('Product updated.');
    } else {
      addProduct(base);
      setToast('Product added.');
    }
    setTimeout(() => router.back(), 600);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={[styles.content, isDesktop && web.content]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Product Name" error={errors.name}>
          <TextField value={name} onChangeText={setName} placeholder="e.g. Nike Air Max Pulse" />
        </Field>

        <Field label="Brand" error={errors.brand}>
          <View style={styles.chips}>
            {BRANDS.map((b) => (
              <Pressable
                key={b}
                onPress={() => {
                  setBrand(b);
                  if (!editing) setCategory(b);
                }}
                style={[styles.chip, brand === b && styles.chipActive]}
              >
                <Text style={[styles.chipText, brand === b && styles.chipTextActive]}>{b}</Text>
              </Pressable>
            ))}
          </View>
          <TextField
            value={brand}
            onChangeText={setBrand}
            placeholder="Brand"
            style={{ marginTop: 8 }}
          />
        </Field>

        <Field label="Category">
          <TextField value={category} onChangeText={setCategory} placeholder="Category" />
        </Field>

        <View style={styles.two}>
          <View style={{ flex: 1 }}>
            <Field label={`Price (${'\u20B1'})`} error={errors.price}>
              <TextField
                value={price}
                onChangeText={setPrice}
                placeholder="3500"
                keyboardType="numeric"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Rating (0–5)" error={errors.rating}>
              <TextField
                value={rating}
                onChangeText={setRating}
                placeholder="4.5"
                keyboardType="decimal-pad"
              />
            </Field>
          </View>
        </View>

        <Field label="Image">
          <ProductImage uri={image} style={styles.preview} iconSize={40} />
          <View style={styles.imgRow}>
            <Pressable onPress={pickImage} style={styles.imgBtn}>
              <Ionicons name="image-outline" size={18} color={Colors.primary} />
              <Text style={styles.imgBtnText}>Pick Photo</Text>
            </Pressable>
            {image ? (
              <Pressable onPress={() => setImage('')} style={styles.imgBtn}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                <Text style={[styles.imgBtnText, { color: Colors.danger }]}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
          <TextField
            value={image}
            onChangeText={setImage}
            placeholder="...or paste an image URL"
            autoCapitalize="none"
            style={{ marginTop: 8 }}
          />
        </Field>

        <Field label="Description">
          <TextField
            value={description}
            onChangeText={setDescription}
            placeholder="Tell shoppers about this shoe..."
            multiline
            numberOfLines={4}
            style={{ height: 96, textAlignVertical: 'top', paddingTop: 12 }}
          />
        </Field>

        <Field label={`Colors (${colors.length} selected)`} error={errors.colors}>
          <View style={styles.swatches}>
            {PALETTE.map((c) => {
              const on = colors.some((x) => x.name === c.name);
              return (
                <Pressable
                  key={c.name}
                  onPress={() => toggleColor(c)}
                  style={[styles.swatch, { backgroundColor: c.hex }, on && styles.swatchOn]}
                  accessibilityLabel={c.name}
                >
                  {on ? <Ionicons name="checkmark" size={16} color={c.hex === '#FFFFFF' || c.hex === '#F3DDD3' ? Colors.ink : '#fff'} /> : null}
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>{colors.map((c) => c.name).join(', ') || 'None'}</Text>
        </Field>

        <Field label="Sizes" error={errors.sizes}>
          <View style={styles.sizes}>
            {ALL_SIZES.map((s) => (
              <Pressable
                key={s}
                onPress={() => toggleSize(s)}
                style={[styles.size, sizes.includes(s) && styles.sizeOn]}
              >
                <Text style={[styles.sizeText, sizes.includes(s) && styles.sizeTextOn]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label={`Stock by Size (total ${totalStock({ sizes, stockBySize } as Product)})`}>
          {sizes.map((s) => (
            <View key={s} style={styles.stockRow}>
              <Text style={styles.stockLabel}>EU {s}</Text>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() =>
                    setStockBySize((cur) => ({ ...cur, [s]: Math.max(0, (cur[s] ?? 0) - 1) }))
                  }
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepText}>{'\u2212'}</Text>
                </Pressable>
                <TextField
                  value={String(stockBySize[s] ?? 0)}
                  onChangeText={(t) =>
                    setStockBySize((cur) => ({ ...cur, [s]: Math.max(0, Math.floor(Number(t) || 0)) }))
                  }
                  keyboardType="numeric"
                  style={styles.stockInput}
                />
                <Pressable
                  onPress={() =>
                    setStockBySize((cur) => ({ ...cur, [s]: (cur[s] ?? 0) + 1 }))
                  }
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepText}>+</Text>
                </Pressable>
              </View>
              {errors[`stock_${s}`] ? <Text style={styles.err}>{errors[`stock_${s}`]}</Text> : null}
            </View>
          ))}
        </Field>

        <View style={styles.availRow}>
          <Text style={styles.availLabel}>Available for sale</Text>
          <Switch
            value={total > 0 ? available : false}
            onValueChange={setAvailable}
            disabled={total <= 0}
            trackColor={{ true: Colors.primary, false: '#ddd' }}
          />
        </View>
        {total <= 0 ? (
          <Text style={styles.hint}>Zero stock forces Out of Stock automatically.</Text>
        ) : null}

        <Pressable onPress={save} style={[styles.save, isDesktop && web.save]}>
          <Text style={styles.saveText}>{editing ? 'Save Changes' : 'Add Product'}</Text>
        </Pressable>
      </ScrollView>
      <Toast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  two: { flexDirection: 'row', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  preview: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12 },
  imgRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  imgBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgBtnText: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.primary },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchOn: { borderWidth: 2, borderColor: Colors.primary },
  hint: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted },
  sizes: { flexDirection: 'row', gap: 8 },
  size: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.pinkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeOn: { backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.primary },
  sizeText: { fontFamily: Font.regular, fontSize: 14, color: Colors.ink },
  sizeTextOn: { fontFamily: Font.semiBold, color: Colors.primary },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  stockLabel: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.ink, width: 56 },
  stepper: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.pinkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 18, color: Colors.ink, fontFamily: Font.semiBold },
  stockInput: { flex: 1, textAlign: 'center' },
  err: { fontFamily: Font.regular, fontSize: 12, color: Colors.danger },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.pinkBg,
    borderRadius: 12,
    padding: 16,
  },
  availLabel: { fontFamily: Font.semiBold, fontSize: 15, color: Colors.ink },
  save: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveText: { fontFamily: Font.semiBold, fontSize: 16, color: '#fff' },
});

/** Web/laptop only — never applied on native, so the phone UI is unchanged. */
const web = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  save: { width: '100%', maxWidth: 480, alignSelf: 'center' },
});
