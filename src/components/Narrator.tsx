import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { sound } from '../fx/sound';

/**
 * Stanley-Parable-style subtitle band: cream serif-ish text on a dark
 * letterbox strip, revealed with a typewriter effect. Tap to dismiss.
 * Render once per screen (StageLayout includes it).
 */
export default function Narrator() {
  const narration = useGameStore(s => s.narration);
  const clearNarration = useGameStore(s => s.clearNarration);
  const [shown, setShown] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!narration) {
      setShown('');
      return;
    }
    sound.whisper();
    // typewriter: reveal ~2 chars per tick, then linger before auto-hide
    for (let i = 1; i <= narration.length; i += 2) {
      timers.current.push(
        setTimeout(() => setShown(narration.slice(0, i + 1)), i * 18),
      );
    }
    // linger scales with text length so long lines get enough reading time
    const lingerMs = Math.max(8000, narration.length * 90);
    timers.current.push(
      setTimeout(clearNarration, narration.length * 18 + lingerMs),
    );
    return () => timers.current.forEach(clearTimeout);
  }, [narration, clearNarration]);

  if (!narration) return null;

  return (
    <Pressable style={styles.band} onPress={clearNarration}>
      <Text style={styles.text}>{shown}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(8,8,6,0.92)',
    borderTopWidth: 1,
    borderColor: 'rgba(230,220,190,0.25)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    minHeight: 64,
    justifyContent: 'center',
    zIndex: 50,
  },
  text: {
    color: '#efe6cd',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
