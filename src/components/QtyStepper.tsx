import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Font } from '../theme';

export function QtyStepper({
  qty,
  onInc,
  onDec,
}: {
  qty: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onDec} style={styles.btn} accessibilityLabel="Decrease quantity">
        <Text style={styles.btnText}>{'\u2212'}</Text>
      </Pressable>
      <Text style={styles.qty}>{qty}</Text>
      <Pressable onPress={onInc} style={styles.btn} accessibilityLabel="Increase quantity">
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 100,
    height: 32,
    paddingHorizontal: 4,
  },
  btn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, color: Colors.ink, fontFamily: Font.semiBold },
  qty: {
    minWidth: 20,
    textAlign: 'center',
    fontFamily: Font.bold,
    fontSize: 14,
    color: Colors.ink,
  },
});
