import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const SPECKS = 14;

/** Slow-drifting dust motes — makes static photo scenes feel alive. */
export default function DustOverlay() {
  const specks = useRef(
    Array.from({ length: SPECKS }, () => ({
      x: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 9000 + Math.random() * 14000,
      delay: Math.random() * 8000,
      drift: (Math.random() - 0.5) * 60,
      anim: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    specks.forEach(s => {
      const loop = () => {
        s.anim.setValue(0);
        Animated.timing(s.anim, {
          toValue: 1,
          duration: s.duration,
          delay: s.delay,
          useNativeDriver: true,
        }).start(loop);
      };
      loop();
    });
  }, [specks]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill as any}>
      {specks.map((s, i) => (
        <Animated.View
          key={i}
          style={[
            styles.speck,
            {
              left: `${s.x}%`,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              opacity: s.anim.interpolate({
                inputRange: [0, 0.15, 0.85, 1],
                outputRange: [0, 0.55, 0.4, 0],
              }),
              transform: [
                {
                  translateY: s.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [520, -40],
                  }),
                },
                {
                  translateX: s.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, s.drift],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  speck: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(235,228,200,0.8)',
  },
});
