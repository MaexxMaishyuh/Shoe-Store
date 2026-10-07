import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Font } from '../theme';
import { useApp } from '../store/AppContext';

export function CartButton() {
  const { cartCount } = useApp();
  return (
    <Pressable
      onPress={() => router.push('/checkout')}
      style={styles.btn}
      accessibilityLabel="Open bag"
    >
      <Ionicons name="bag-outline" size={22} color={Colors.ink} />
      {cartCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.pinkBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontFamily: Font.bold, fontSize: 11 },
});
