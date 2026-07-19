import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Vibration } from 'react-native';
import GameButton from '../components/GameButton';
import HintButton from '../components/HintButton';
import { colors, fonts, shadow } from '../theme/theme';
import { useGameStore } from '../store/useGameStore';
import { IMG } from '../data/images';
import { LOCKER_CODE, narrator2Line } from '../data/story';
import { sound } from '../fx/sound';

interface Props {
  onClose: () => void;
}

/**
 * Locker 236: a 4-digit padlock. The code (7891) is never shown anywhere —
 * the player must combine the diary's year (1987) with the painting's
 * "read the numbers backwards" to derive it. Collected clues appear as chips.
 */
export default function LockerPuzzle({ onClose }: Props) {
  const { playerName, narrate, hasFlag, setFlag, addItem } = useGameStore();
  const [entered, setEntered] = useState('');
  const [error, setError] = useState(false);
  const solved = hasFlag('lockerOpen');

  const clues: string[] = [];
  if (hasFlag('diary1')) clues.push('מהיומן: "השעון נעצר ב-1987"');
  if (hasFlag('sawPainting')) clues.push('מהתמונה: "תקרא אותם הפוך"');
  if (hasFlag('detHintLocker')) clues.push('ספרות שחוקות במנעול: 1, 7, 8, 9');

  const press = (digit: string) => {
    if (solved || entered.length >= 4) return;
    sound.click();
    const next = entered + digit;
    setEntered(next);
    setError(false);
    if (next.length === 4) {
      if (next === LOCKER_CODE) {
        sound.unlock();
        Vibration.vibrate([0, 60, 60, 60]);
        setFlag('lockerOpen');
        addItem({
          id: 'flashlight',
          name: 'פנס כיס',
          emoji: '🔦',
          description: 'פנס ישן של שרתים. הסוללות מחזיקות — בקושי. בלעדיו המרתף הוא סתם חושך.',
        });
        addItem({
          id: 'diary2',
          name: 'דף יומן — 2',
          emoji: '📖',
          description:
            '"כל לילה אני מנסה שוב לתקן. תמיד באותה שעה — 11:47, הרגע שבו הוא נעצר. חסרים לי רק גלגל שיניים אחד ונר טוב לראות איתו. הם איפשהו במרתף."',
        });
        narrate(narrator2Line('lockerOpened', playerName));
      } else {
        sound.error();
        Vibration.vibrate(150);
        setError(true);
        setTimeout(() => setEntered(''), 500);
      }
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={fonts.heading}>לוקר 236</Text>
      <Image source={IMG.locker} style={styles.closeup} resizeMode="cover" />

      {solved ? (
        <>
          <Text style={styles.successText}>
            הלוקר פתוח. בפנים מצאת פנס ודף יומן — הם כבר בתיק שלך.
          </Text>
          <GameButton label="חזרה לחדר" onPress={onClose} variant="purple" />
        </>
      ) : (
        <>
          <Text style={fonts.body}>
            מנעול קומבינציה בן 4 ספרות. אין קוד כתוב בשום מקום — אבל בית הספר
            מלא רמזים למי שמסתובב בו.
          </Text>

          {clues.length > 0 ? (
            <View style={styles.cluesBox}>
              {clues.map(c => (
                <Text key={c} style={styles.clueChip}>
                  {c}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.noClues}>
              עוד לא אספת רמזים על הקוד הזה... אולי כדאי לחקור קודם.
            </Text>
          )}

          <View style={styles.codeRow}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.codeBox, error && styles.codeBoxError]}>
                <Text style={styles.codeDigit}>{entered[i] ?? ''}</Text>
              </View>
            ))}
          </View>

          <View style={styles.numpad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'נקה'].map(k => (
              <Pressable
                key={k}
                style={styles.numKey}
                onPress={() => {
                  if (k === 'נקה') setEntered('');
                  else if (k === '⌫') setEntered(e => e.slice(0, -1));
                  else press(k);
                }}>
                <Text style={styles.numKeyText}>{k}</Text>
              </Pressable>
            ))}
          </View>

          <GameButton label="לסגת בשקט" onPress={onClose} variant="ghost" />

          <HintButton
            delaySeconds={40}
            hints={[
              'שני רמזים בונים את הקוד: אחד מסתתר מאחורי משהו תלוי, ואחד כתוב על לוח.',
              'היומן מדבר על שנה מסוימת. התמונה במסדרון אומרת מה לעשות עם המספרים.',
              'קח את 1987... ועכשיו קרא את הספרות מהסוף להתחלה.',
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
  cluesBox: { gap: 6 },
  clueChip: {
    backgroundColor: colors.bgPanel,
    borderColor: colors.accentGold,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.textPrimary,
    fontSize: 14,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  noClues: { ...fonts.body, color: colors.textMuted, fontStyle: 'italic' },
  codeRow: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 10 },
  codeBox: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.bgPanel,
    borderWidth: 2,
    borderColor: colors.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxError: { borderColor: colors.accentRed },
  codeDigit: { fontSize: 26, color: colors.textPrimary, fontWeight: '700' },
  numpad: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  numKey: {
    width: 62,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.bgPanelLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.button,
  },
  numKeyText: { fontSize: 18, color: colors.textPrimary, fontWeight: '700' },
  successText: { ...fonts.body, color: colors.accentGreen },
});
