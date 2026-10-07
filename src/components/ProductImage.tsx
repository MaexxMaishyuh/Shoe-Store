import React, { useState } from 'react';
import { Image, StyleProp, StyleSheet, View, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

export function ProductImage({
  uri,
  style,
  iconSize = 40,
  resizeMode = 'cover',
}: {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  iconSize?: number;
  resizeMode?: 'cover' | 'contain';
}) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.placeholder, style]}>
        <Ionicons name="footsteps" size={iconSize} color={Colors.primary} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.pinkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
