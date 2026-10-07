import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Font } from '../theme';

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function TextField(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={Colors.faint}
      style={styles.input}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.ink },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontFamily: Font.regular,
    fontSize: 15,
    color: Colors.ink,
  },
  error: { fontFamily: Font.regular, fontSize: 12, color: Colors.danger },
});
