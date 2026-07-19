import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable, Modal } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { colors, fonts, shadow } from '../theme/theme';
import { SKINS } from '../data/skins';
import { IMG, ImgKey } from '../data/images';

/** items that have a real photo — shown large in the item detail modal */
const ITEM_IMG: Record<string, ImgKey> = {
  gear: 'itemGear',
  candle: 'itemCandle',
  cipher_note: 'itemNote',
  flashlight: 'itemFlashlight',
  diary1: 'itemDiary',
  diary2: 'itemDiary',
};

// the clock creeps toward midnight as stages are completed — tension, not a real timer
const CLOCK_BY_PROGRESS = ['22:40', '23:05', '23:25', '23:45', '23:58'];

/** Persistent top bar: avatar + name, ticking midnight clock, and the inventory. */
const PROGRESS_FLAGS = ['diary1', 'lockerOpen', 'cellarSearchDone', 'clockFixed'];

export default function InventoryBar() {
  const { playerName, skinId, inventory, flags } = useGameStore();
  const [selected, setSelected] = useState<string | null>(null);
  const skin = SKINS.find(s => s.id === skinId);
  const activeItem = inventory.find(i => i.id === selected);
  const stagesDone = PROGRESS_FLAGS.filter(f => flags[f]).length;
  const clock = CLOCK_BY_PROGRESS[Math.min(stagesDone, CLOCK_BY_PROGRESS.length - 1)];

  return (
    <View style={styles.wrap}>
      <View style={styles.avatarBox}>
        <View style={styles.monogram}>
          <Text style={styles.monogramText}>{skin?.initial ?? '?'}</Text>
        </View>
        <Text numberOfLines={1} style={styles.avatarName}>
          {playerName || 'שחקן'}
        </Text>
      </View>

      <View style={styles.clockBox}>
        <Text style={styles.clockText}>{clock}</Text>
        <Text style={styles.clockLabel}>עד חצות...</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsRow}>
        {inventory.length === 0 ? (
          <Text style={styles.emptyText}>התיק שלך ריק... בינתיים</Text>
        ) : (
          inventory.map(item => (
            <Pressable
              key={item.id}
              onPress={() => setSelected(item.id)}
              style={styles.itemSlot}>
              {ITEM_IMG[item.id] ? (
                <Image
                  source={IMG[ITEM_IMG[item.id]]}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.itemLetter}>{item.name.slice(0, 1)}</Text>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal
        visible={!!activeItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.modalBg} onPress={() => setSelected(null)}>
          <View style={styles.modalCard}>
            {activeItem && ITEM_IMG[activeItem.id] ? (
              <Image
                source={IMG[ITEM_IMG[activeItem.id]]}
                style={styles.modalImg}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.itemLetter}>{activeItem?.name.slice(0, 1)}</Text>
            )}
            <Text style={fonts.heading}>{activeItem?.name}</Text>
            <Text style={fonts.body}>{activeItem?.description}</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.bgPanel,
    borderBottomWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    ...shadow.panel,
  },
  avatarBox: {
    alignItems: 'center',
    width: 64,
  },
  monogram: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.accentGold,
    backgroundColor: 'rgba(242,193,78,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: { color: colors.accentGold, fontWeight: '800', fontSize: 17 },
  clockBox: { alignItems: 'center', paddingHorizontal: 8 },
  clockText: { color: colors.accentRed, fontSize: 14, fontWeight: '800' },
  clockLabel: { color: colors.textMuted, fontSize: 9, writingDirection: 'rtl' },
  avatarName: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 64,
  },
  itemsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    flexGrow: 1,
  },
  itemSlot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.bgPanelLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemThumb: { width: '100%', height: '100%', borderRadius: 11 },
  itemLetter: { color: colors.textPrimary, fontWeight: '800', fontSize: 18 },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    writingDirection: 'rtl',
  },
  modalBg: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: colors.bgPanel,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    width: '80%',
    borderWidth: 2,
    borderColor: colors.accentGold,
    ...shadow.panel,
  },
  modalImg: {
    width: '100%',
    height: 170,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
