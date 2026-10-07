import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Font } from '../theme';

export function SectionHeader({
  title,
  link,
  onLink,
}: {
  title: string;
  link?: string;
  onLink?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {link ? (
        <Pressable onPress={onLink} hitSlop={8}>
          <Text style={styles.link}>{link}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: Font.bold, fontSize: 18, color: Colors.ink },
  link: { fontFamily: Font.semiBold, fontSize: 14, color: Colors.primary },
});
