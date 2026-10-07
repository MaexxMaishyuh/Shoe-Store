import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BRANDS, Colors, Font } from '../../theme';
import { useApp } from '../../store/AppContext';
import { ProductCard } from '../../components/ProductCard';
import { SectionHeader } from '../../components/SectionHeader';
import { ProductImage } from '../../components/ProductImage';
import { Toast } from '../../components/Toast';
import { CartButton } from '../../components/CartButton';

function columnsFor(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 700) return 3;
  return 2;
}

export default function Home() {
  const { products, settings } = useApp();
  const { width } = useWindowDimensions();
  const [brand, setBrand] = useState<string>('Nike');
  const [toast, setToast] = useState<string | null>(null);

  const cols = columnsFor(width);
  const filtered = useMemo(
    () => products.filter((p) => (brand ? p.brand === brand : true)),
    [products, brand],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.welcome}>
          <View>
            <Text style={styles.hello}>Welcome back,</Text>
            <Text style={styles.name}>{settings.userName || 'Alex'}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push('/explore')}
              style={styles.iconBtn}
              accessibilityLabel="Search"
            >
              <Ionicons name="search-outline" size={22} color={Colors.ink} />
            </Pressable>
            <Pressable
              onPress={() => setToast('You have no new notifications.')}
              style={styles.iconBtn}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.ink} />
            </Pressable>
            <CartButton />
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>New Collection</Text>
            <Text style={styles.bannerSub}>Get up to 50% off</Text>
            <Pressable onPress={() => router.push('/explore')} style={styles.shopNow}>
              <Text style={styles.shopNowText}>Shop Now</Text>
            </Pressable>
          </View>
          <View style={styles.bannerImgWrap}>
            <ProductImage
              uri={products[0]?.image}
              style={styles.bannerImg}
              iconSize={48}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader title="Categories" link="See all" onLink={() => router.push('/explore')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
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
        </View>

        {/* Recommendation */}
        <View style={styles.section}>
          <SectionHeader
            title="Recommendation"
            link="See all"
            onLink={() => router.push('/explore')}
          />
          {filtered.length === 0 ? (
            <Text style={styles.empty}>No products in this category yet.</Text>
          ) : (
            <View style={styles.grid}>
              {filtered.map((p) => (
                <View key={p.id} style={{ width: `${100 / cols}%`, padding: 8 }}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <Toast message={toast} onHide={() => setToast(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  welcome: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hello: { fontFamily: Font.regular, fontSize: 14, color: Colors.muted },
  name: { fontFamily: Font.bold, fontSize: 20, color: Colors.ink, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.pinkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    backgroundColor: Colors.pinkBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerText: { flex: 1, gap: 8 },
  bannerTitle: { fontFamily: Font.bold, fontSize: 20, color: Colors.ink },
  bannerSub: { fontFamily: Font.regular, fontSize: 14, color: Colors.ink },
  shopNow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  shopNowText: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.primary },
  bannerImgWrap: { width: 150, maxWidth: '45%' },
  bannerImg: { width: '100%', aspectRatio: 16 / 10, borderRadius: 12 },
  section: { gap: 8 },
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
  empty: { fontFamily: Font.regular, fontSize: 14, color: Colors.muted, paddingVertical: 12 },
});
