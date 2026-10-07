import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Font } from '../../theme';
import { useApp } from '../../store/AppContext';

function MenuItem({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.itemText}>
        <Text style={styles.itemLabel}>{label}</Text>
        {sub ? <Text style={styles.itemSub}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
    </Pressable>
  );
}

export default function Profile() {
  const { settings, orders, favorites } = useApp();
  const initial = (settings.userName || 'A').charAt(0).toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{settings.userName || 'Alex'}</Text>
        <Text style={styles.sub}>
          {orders.length} order{orders.length === 1 ? '' : 's'} · {favorites.length} favorite
          {favorites.length === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.menu}>
        <MenuItem
          icon="receipt-outline"
          label="My Orders"
          sub="Track Pending, Shipped, Delivered"
          onPress={() => router.push('/orders')}
        />
        <MenuItem
          icon="heart-outline"
          label="Favorites"
          sub="Your saved shoes"
          onPress={() => router.push('/favorites')}
        />
        <MenuItem
          icon="cube-outline"
          label="Product Management"
          sub="Add, edit and delete products"
          onPress={() => router.push('/product-manage')}
        />
        <MenuItem
          icon="layers-outline"
          label="Inventory"
          sub="Stock by size and availability"
          onPress={() => router.push('/inventory')}
        />
        <MenuItem
          icon="bar-chart-outline"
          label="Reports"
          sub="Sales, best sellers, low stock"
          onPress={() => router.push('/reports')}
        />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          sub="Fees, currency, preferences"
          onPress={() => router.push('/settings')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  card: {
    backgroundColor: Colors.pinkBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { fontFamily: Font.bold, fontSize: 28, color: '#fff' },
  name: { fontFamily: Font.bold, fontSize: 20, color: Colors.ink },
  sub: { fontFamily: Font.regular, fontSize: 14, color: Colors.muted },
  menu: { gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.pinkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1 },
  itemLabel: { fontFamily: Font.semiBold, fontSize: 15, color: Colors.ink },
  itemSub: { fontFamily: Font.regular, fontSize: 13, color: Colors.muted, marginTop: 2 },
});
