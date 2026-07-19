import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { colors, fonts, shadow } from '../theme/theme';
import { useGameStore } from '../store/useGameStore';

interface Props {
  hints: string[];
  /** seconds before the hint becomes available */
  delaySeconds?: number;
}

/** Floating hint button that "wakes up" after the player is stuck for a while, with a joke-y ghost narrator. */
export default function HintButton({ hints, delaySeconds = 20 }: Props) {
  const registerHintUse = useGameStore(s => s.useHint);
  const [available, setAvailable] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    setAvailable(false);
    setHintIndex(0);
    const t = setTimeout(() => setAvailable(true), delaySeconds * 1000);
    return () => clearTimeout(t);
  }, [delaySeconds, hints]);

  const handleOpen = () => {
    registerHintUse();
    setVisible(true);
  };

  const nextHint = () => setHintIndex(i => Math.min(i + 1, hints.length - 1));

  if (!available) return null;

  return (
    <>
      <Pressable style={styles.fab} onPress={handleOpen}>
        <Text style={styles.fabText}>רמז?</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBg}>
          <View style={styles.card}>
            <Text style={fonts.heading}>הרוח של בית הספר לוחשת</Text>
            <Text style={fonts.body}>{hints[hintIndex]}</Text>
            <View style={styles.row}>
              {hintIndex < hints.length - 1 && (
                <Pressable style={styles.smallBtn} onPress={nextHint}>
                  <Text style={styles.smallBtnText}>עוד רמז בבקשה</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.smallBtn, styles.closeBtn]}
                onPress={() => setVisible(false)}>
                <Text style={styles.smallBtnText}>תודה, רוח!</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: 18,
    bottom: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(24,28,22,0.92)',
    borderWidth: 2,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    ...shadow.glowGold,
  },
  fabText: { color: colors.accentGold, fontWeight: '800', fontSize: 15, writingDirection: 'rtl' },
  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlayDark,
  },
  card: {
    backgroundColor: colors.bgPanel,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 26,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: colors.accentGold,
  },
  row: { flexDirection: 'row-reverse', gap: 10, marginTop: 8 },
  smallBtn: {
    backgroundColor: colors.accentPurple,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  closeBtn: { backgroundColor: colors.accentGold },
  smallBtnText: {
    color: colors.bgDarkest,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
});
