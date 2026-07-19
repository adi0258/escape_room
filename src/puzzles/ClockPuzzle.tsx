import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Vibration } from 'react-native';
import { IMG } from '../data/images';
import GameButton from '../components/GameButton';
import HintButton from '../components/HintButton';
import { colors, fonts, shadow } from '../theme/theme';
import { useGameStore } from '../store/useGameStore';
import { CLOCK_SYMBOLS, CLOCK_TARGET, narrator2Line } from '../data/story';
import { sound } from '../fx/sound';

interface Props {
  onBack: () => void;
}

/**
 * The clock room finale: place the gear, light the candle, then decode the
 * cellar note's symbol-time (☾☾:Δ✶ → 11:47) and set the giant clock's
 * hands. The legend is only on the note item — the inventory matters.
 */
export default function ClockPuzzle({ onBack }: Props) {
  const { playerName, narrate, hasItem, hasFlag, setFlag } = useGameStore();
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const hasAll = hasItem('gear') && hasItem('candle') && hasItem('cipher_note');
  const gearPlaced = hasFlag('gearPlaced');
  const candleLit = hasFlag('candleLit');
  const fixed = hasFlag('clockFixed');

  useEffect(() => {
    narrate(
      narrator2Line(hasAll || fixed ? 'clockRoomEnter' : 'clockNeedItems', playerName),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryStart = () => {
    if (hour === CLOCK_TARGET.hour && minute === CLOCK_TARGET.minute) {
      setFlag('clockFixed');
      sound.unlock();
      sound.success();
      [0, 1, 2, 3, 4].forEach(i => setTimeout(() => sound.tick(), 500 + i * 400));
      Vibration.vibrate([0, 60, 60, 60, 60, 120]);
      narrate(narrator2Line('clockFixedLine', playerName));
    } else {
      sound.error();
      Vibration.vibrate(180);
      narrate(narrator2Line('clockWrongTime', playerName));
    }
  };

  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <View style={styles.wrap}>
      <Text style={fonts.heading}>חדר השעון</Text>
      <Image source={IMG.clockRoom} style={styles.closeup} resizeMode="cover" />

      {!hasAll && !fixed ? (
        <>
          <Text style={fonts.body}>
            שעון ענק ודומם ממלא את הקיר. המנגנון פעור — חסרים בו חלקים, וחשוך
            מכדי לעבוד.
          </Text>
          <View style={styles.checklist}>
            <Text style={styles.checkItem}>
              {hasItem('gear') ? '■' : '□'} גלגל שיניים
            </Text>
            <Text style={styles.checkItem}>
              {hasItem('candle') ? '■' : '□'} נר לאור עבודה
            </Text>
            <Text style={styles.checkItem}>
              {hasItem('cipher_note') ? '■' : '□'} משהו שיגיד לאיזו שעה לכוון...
            </Text>
          </View>
          <GameButton label="לחזור למרתף" onPress={onBack} variant="ghost" />
        </>
      ) : fixed ? (
        <>
          <Text style={styles.successText}>
            תק. תק. תק. השעון חי! למעלה, בקומת הכניסה, נשמעה חריקה ארוכה של
            דלת שנפתחת לראשונה מזה שנים.
          </Text>
          <GameButton label="לחזור למפה" onPress={onBack} variant="purple" />
        </>
      ) : (
        <>
          <Text style={fonts.body}>
            המנגנון מחכה. סדר פעולות: להרכיב, להאיר, ולכוון את המחוגים לרגע
            הנכון.
          </Text>

          <View style={styles.stepsRow}>
            <Pressable
              style={[styles.stepBtn, gearPlaced && styles.stepDone]}
              onPress={() => {
                if (!gearPlaced) {
                  sound.unlock();
                  setFlag('gearPlaced');
                }
              }}>
              <Image source={IMG.itemGear} style={styles.stepImg} resizeMode="cover" />
              <Text style={styles.stepText}>
                {gearPlaced ? 'הגלגל בפנים' : 'הרכב את הגלגל'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.stepBtn, candleLit && styles.stepDone, !gearPlaced && styles.stepLocked]}
              onPress={() => {
                if (gearPlaced && !candleLit) {
                  sound.whisper();
                  setFlag('candleLit');
                }
              }}>
              <Image source={IMG.itemCandle} style={styles.stepImg} resizeMode="cover" />
              <Text style={styles.stepText}>
                {candleLit ? 'האור דולק' : 'הדלק את הנר'}
              </Text>
            </Pressable>
          </View>

          {candleLit && (
            <>
              <View style={styles.symbolPlate}>
                <Text style={styles.symbolText}>
                  על המנגנון חרוט: {CLOCK_SYMBOLS}
                </Text>
                <Text style={styles.symbolSub}>
                  (מזכיר משהו? אולי פתק שאספת... בדוק בתיק שלמעלה)
                </Text>
              </View>

              <View style={styles.clockFace}>
                <Text style={styles.clockDigits}>{fmt(hour, minute)}</Text>
              </View>

              <View style={styles.dialsRow}>
                <View style={styles.dial}>
                  <Text style={styles.dialLabel}>שעה</Text>
                  <View style={styles.dialBtns}>
                    <Pressable
                      style={styles.dialBtn}
                      onPress={() => {
                        sound.tick();
                        setHour(h => (h % 12) + 1);
                      }}>
                      <Text style={styles.dialBtnText}>+</Text>
                    </Pressable>
                    <Pressable
                      style={styles.dialBtn}
                      onPress={() => {
                        sound.tick();
                        setHour(h => ((h + 10) % 12) + 1);
                      }}>
                      <Text style={styles.dialBtnText}>−</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.dial}>
                  <Text style={styles.dialLabel}>דקות</Text>
                  <View style={styles.dialBtns}>
                    <Pressable
                      style={styles.dialBtn}
                      onPress={() => {
                        sound.tick();
                        setMinute(m => (m + 1) % 60);
                      }}>
                      <Text style={styles.dialBtnText}>+1</Text>
                    </Pressable>
                    <Pressable
                      style={styles.dialBtn}
                      onPress={() => {
                        sound.tick();
                        setMinute(m => (m + 5) % 60);
                      }}>
                      <Text style={styles.dialBtnText}>+5</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {hasFlag('sciHintClock') && minute !== CLOCK_TARGET.minute && (
                <GameButton
                  label="כיול מדעי של מחוג הדקות"
                  variant="ghost"
                  onPress={() => setMinute(CLOCK_TARGET.minute)}
                />
              )}

              <GameButton label="הפעל את השעון" onPress={tryStart} />
            </>
          )}

          <GameButton label="לחזור למרתף" onPress={onBack} variant="ghost" />

          <HintButton
            delaySeconds={50}
            hints={[
              'הסמלים על המנגנון מופיעים גם על פתק שמצאת. פתח את הפריט בתיק וקרא את השורה הקטנה.',
              '☾=1. אז ☾☾ זה... והדף השני של היומן מזכיר בדיוק את השעה הזאת.',
              'כוון את השעון ל-11:47 — הרגע שבו הכל נעצר.',
            ]}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 14 },
  closeup: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checklist: {
    backgroundColor: colors.bgPanel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  checkItem: { ...fonts.body, color: colors.textPrimary },
  stepsRow: { flexDirection: 'row-reverse', gap: 12, justifyContent: 'center' },
  stepBtn: {
    backgroundColor: colors.bgPanelLight,
    borderWidth: 2,
    borderColor: colors.accentPurple,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    minWidth: 130,
    gap: 4,
    ...shadow.button,
  },
  stepDone: { borderColor: colors.accentGreen },
  stepLocked: { opacity: 0.45 },
  stepImg: { width: 64, height: 48, borderRadius: 8 },
  stepText: { color: colors.textPrimary, fontWeight: '700', writingDirection: 'rtl' },
  symbolPlate: {
    backgroundColor: '#20261f',
    borderWidth: 2,
    borderColor: '#8b8a70',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  symbolText: { color: '#e9e4c6', fontSize: 17, fontWeight: '800', writingDirection: 'rtl' },
  symbolSub: { color: 'rgba(233,228,198,0.6)', fontSize: 11, writingDirection: 'rtl' },
  clockFace: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: '#8b8a70',
    backgroundColor: '#14130e',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.glowGold,
  },
  clockDigits: { color: colors.accentGold, fontSize: 34, fontWeight: '800' },
  dialsRow: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 24 },
  dial: { alignItems: 'center', gap: 6 },
  dialLabel: { color: colors.textSecondary, fontWeight: '700', writingDirection: 'rtl' },
  dialBtns: { flexDirection: 'row-reverse', gap: 8 },
  dialBtn: {
    width: 54,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.bgPanelLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.button,
  },
  dialBtnText: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  successText: { ...fonts.body, color: colors.accentGreen },
});
