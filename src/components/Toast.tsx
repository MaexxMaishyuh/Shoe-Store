import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Font } from '../theme';

export function Toast({ message, onHide }: { message: string | null; onHide: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onHide, 2500);
    return () => clearTimeout(t);
  }, [message, onHide]);

  if (!message) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.bubble}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    zIndex: 50,
  },
  bubble: {
    backgroundColor: Colors.ink,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: '90%',
  },
  text: { color: '#fff', fontFamily: Font.semiBold, fontSize: 14, textAlign: 'center' },
});
