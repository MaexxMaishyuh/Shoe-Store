import { Platform, useWindowDimensions } from 'react-native';

/**
 * True only on web with a desktop-class viewport.
 * Mobile (Expo Go, native) always returns false so phone UI is untouched.
 */
export function useWebDesktop(breakpoint = 768): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= breakpoint;
}
