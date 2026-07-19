import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../theme/theme';

interface Props {
  children: string;
  size?: number;
  style?: TextStyle;
}

/** Flickering "haunted light" title text — loops a subtle random-ish opacity flicker. */
export default function FlickerTitle({ children, size = 32, style }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const flicker = () => {
      const sequence = Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 80 + Math.random() * 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 60 + Math.random() * 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1200 + Math.random() * 1800,
          useNativeDriver: true,
        }),
      ]);
      sequence.start(() => flicker());
    };
    flicker();
  }, [opacity]);

  return (
    <Animated.Text
      style={[
        styles.title,
        { fontSize: size, opacity, textShadowRadius: size / 2 },
        style,
      ]}>
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '800',
    color: colors.accentGold,
    textAlign: 'center',
    writingDirection: 'rtl',
    textShadowColor: colors.glowGold,
    textShadowOffset: { width: 0, height: 0 },
  },
});
