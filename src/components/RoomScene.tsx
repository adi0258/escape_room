import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { RoomConfig, RoomHotspot } from '../data/rooms';
import { IMG, coverPoint } from '../data/images';
import { useGameStore } from '../store/useGameStore';
import DustOverlay from './DustOverlay';
import { sound } from '../fx/sound';

interface Props {
  room: RoomConfig;
  onAction: (actionId: string) => void;
}

/**
 * First-person room over a real photographic background, with a flickering
 * light overlay, vignette, and data-driven tappable hotspots rendered as
 * soft glowing rings (no emojis). Wrong-object taps go to the Narrator.
 */
export default function RoomScene({ room, onAction }: Props) {
  const narrate = useGameStore(s => s.narrate);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const flicker = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const kenBurns = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // slow push-in / pull-back "camera drift" so the still photo feels alive
    Animated.loop(
      Animated.sequence([
        Animated.timing(kenBurns, { toValue: 1, duration: 16000, useNativeDriver: true }),
        Animated.timing(kenBurns, { toValue: 0, duration: 16000, useNativeDriver: true }),
      ]),
    ).start();
    const loop = () => {
      Animated.sequence([
        Animated.timing(flicker, { toValue: 0.35, duration: 60, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0, duration: 80, useNativeDriver: true }),
        Animated.delay(1200 + Math.random() * 2600),
      ]).start(loop);
    };
    loop();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [flicker, pulse, kenBurns]);

  const onTap = (h: RoomHotspot) => {
    sound.click();
    if (h.action) {
      onAction(h.action);
    } else if (h.joke) {
      sound.whisper();
      narrate(h.joke);
    }
  };

  return (
    <View
      style={styles.scene}
      onLayout={e =>
        setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }>
      {/* decorative layers isolated in a clipped, non-interactive layer so their
          overflow can never make the browser auto-scroll the hotspot container */}
      <View pointerEvents="none" style={styles.decor}>
        <Animated.Image
          source={IMG[room.bg]}
          resizeMode="cover"
          style={[
            styles.bg,
            {
              transform: [
                {
                  scale: kenBurns.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.09],
                  }),
                },
                {
                  translateX: kenBurns.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -14],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={styles.nightTint} />
        <DustOverlay />
        <View style={styles.signPlate}>
          <Text style={styles.signText}>{room.sign}</Text>
        </View>
        <Animated.View style={[styles.flicker, { opacity: flicker }]} />
        <View style={styles.vignette} />
      </View>

      {room.hotspots.map(h => {
        const p = coverPoint(room.bg, h.x, h.y, box.w, box.h);
        return (
        <Pressable
          key={h.id}
          onPress={() => onTap(h)}
          style={[styles.hotspot, { left: p.x - 32, top: p.y - 38 }]}>
          <Animated.View
            style={[
              styles.ring,
              !!h.action && styles.ringTarget,
              !!h.action && { transform: [{ scale: pulse }] },
            ]}>
            <View style={[styles.dot, !!h.action && styles.dotTarget]} />
          </Animated.View>
          {!!h.action && h.label && (
            <Text style={styles.targetLabel}>{h.label}</Text>
          )}
        </Pressable>
        );
      })}

      <Text style={styles.tapHint}>לחצו על הנקודות הזוהרות כדי לבדוק מקרוב</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1, backgroundColor: '#0b0b09', overflow: 'hidden' },
  decor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  bg: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%' },
  // midnight feel over the warm daylight photos
  nightTint: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,10,30,0.45)',
  },
  signPlate: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(24,28,22,0.9)',
    borderWidth: 2,
    borderColor: '#8b8a70',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  signText: {
    color: '#e9e4c6',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    writingDirection: 'rtl',
  },
  hotspot: {
    position: 'absolute',
    width: 64,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(245,239,210,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,239,210,0.12)',
    shadowColor: '#f5efd2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  ringTarget: {
    borderColor: '#f2c14e',
    backgroundColor: 'rgba(242,193,78,0.18)',
    shadowColor: '#f2c14e',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(245,239,210,0.9)',
  },
  dotTarget: { backgroundColor: '#f2c14e' },
  targetLabel: {
    color: '#f2c14e',
    fontSize: 11,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 1 },
  },
  flicker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
  },
  vignette: {
    position: 'absolute',
    top: -60,
    bottom: -60,
    left: -60,
    right: -60,
    borderWidth: 70,
    borderColor: 'rgba(0,0,0,0.55)',
    borderRadius: 160,
  },
  tapHint: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    color: 'rgba(233,228,198,0.55)',
    fontSize: 12,
    textAlign: 'center',
    writingDirection: 'rtl',
    textShadowColor: '#000',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
});
