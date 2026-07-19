import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Vibration } from 'react-native';
import GameButton from '../components/GameButton';
import HintButton from '../components/HintButton';
import { colors, fonts, shadow } from '../theme/theme';
import { useGameStore } from '../store/useGameStore';
import { IMG } from '../data/images';
import {
  BOARD_NAME_ANSWER,
  BOARD_NAME_BANK,
  BOARD_RIDDLES,
  DIARY,
  narrator2Line,
} from '../data/story';
import { sound } from '../fx/sound';

interface Props {
  onClose: () => void;
}

/**
 * The notice-board: four old riddle notes. Solving all four is only half the
 * puzzle — the first letters of the answers spell the janitor's name, which
 * the player must then assemble to open the board's hidden compartment.
 */
export default function BoardRiddles({ onClose }: Props) {
  const { playerName, narrate, hasFlag, setFlag, addItem } = useGameStore();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [nameLetters, setNameLetters] = useState<string[]>([]);
  const [shakeWrong, setShakeWrong] = useState(false);
  const solved = hasFlag('diary1');
  const riddlesDone = answers.length >= BOARD_RIDDLES.length;

  // stable shuffle per riddle so the answer isn't always first
  const options = useMemo(() => {
    const r = BOARD_RIDDLES[Math.min(idx, BOARD_RIDDLES.length - 1)];
    return [...r.options].sort(
      (a, b) => ((a.charCodeAt(0) * 31 + idx) % 7) - ((b.charCodeAt(0) * 31 + idx) % 7),
    );
  }, [idx]);

  const pickOption = (opt: string) => {
    const r = BOARD_RIDDLES[idx];
    if (opt === r.answer) {
      sound.click();
      setAnswers(a => [...a, opt]);
      setIdx(i => i + 1);
    } else {
      sound.error();
      Vibration.vibrate(120);
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }
  };

  const pickLetter = (letter: string) => {
    if (nameLetters.length >= BOARD_NAME_ANSWER.length) return;
    sound.click();
    const next = [...nameLetters, letter];
    setNameLetters(next);
    if (next.length === BOARD_NAME_ANSWER.length) {
      if (next.join('') === BOARD_NAME_ANSWER) {
        sound.paper();
        sound.success();
        setFlag('diary1');
        addItem({
          id: 'diary1',
          name: DIARY.page1.title,
          emoji: '📜',
          description: DIARY.page1.text,
        });
        narrate(narrator2Line('boardSolved', playerName));
      } else {
        sound.error();
        Vibration.vibrate(150);
        setTimeout(() => setNameLetters([]), 500);
      }
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={fonts.heading}>לוח המודעות</Text>
      <Image source={IMG.riddleWall} style={styles.closeup} resizeMode="cover" />

      {solved ? (
        <>
          <Text style={styles.successText}>
            מאחורי הלוח מצאת דף יומן ישן — הוא בתיק שלך. עכשיו אתה יודע איך
            קוראים לשרת: אבנר.
          </Text>
          <GameButton label="חזרה לחדר" onPress={onClose} variant="purple" />
        </>
      ) : !riddlesDone ? (
        <>
          <Text style={fonts.body}>
            ארבעה פתקים ישנים נעוצים בלוח, על כל אחד חידה בכתב יד. פתק {idx + 1}{' '}
            מתוך {BOARD_RIDDLES.length}:
          </Text>
          <View style={[styles.noteCard, shakeWrong && styles.noteWrong]}>
            <Text style={styles.noteText}>{BOARD_RIDDLES[idx].text}</Text>
          </View>
          <View style={styles.optionsWrap}>
            {options.map(opt => (
              <Pressable key={opt} style={styles.optionBtn} onPress={() => pickOption(opt)}>
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
          {answers.length > 0 && (
            <Text style={styles.solvedSoFar}>
              נפתרו: {answers.join(' • ')}
            </Text>
          )}
        </>
      ) : (
        <>
          <Text style={fonts.body}>
            כל הפתקים נפתרו: {answers.join(', ')}. בתחתית הלוח מישהו כתב:
          </Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              "קח מכל תשובה את האות הראשונה — ותקבל את השם ששכחתם."
            </Text>
          </View>
          {hasFlag('detHintBoard') && (
            <Text style={styles.detHint}>
              מישהו סימן בעיפרון את האות הראשונה בכל תשובה...
            </Text>
          )}
          <View style={styles.nameRow}>
            {Array.from({ length: BOARD_NAME_ANSWER.length }).map((_, i) => (
              <View key={i} style={styles.nameSlot}>
                <Text style={styles.nameLetter}>{nameLetters[i] ?? ''}</Text>
              </View>
            ))}
          </View>
          <View style={styles.optionsWrap}>
            {BOARD_NAME_BANK.map((l, i) => (
              <Pressable key={i} style={styles.letterKey} onPress={() => pickLetter(l)}>
                <Text style={styles.optionText}>{l}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {!solved && (
        <>
          <GameButton label="לסגת בשקט" onPress={onClose} variant="ghost" />
          <HintButton
            delaySeconds={45}
            hints={[
              'כל חידה מתארת משהו פשוט מחיי היומיום. תקרא לאט, מילה במילה.',
              'אחרי שפותרים הכל — האות הראשונה של כל תשובה מצטרפת לשם של מישהו.',
              'א... ב... נ... ר. מי זה יכול להיות?',
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
    height: 130,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteCard: {
    backgroundColor: '#efe6c8',
    borderRadius: 6,
    padding: 16,
    transform: [{ rotate: '-1.2deg' }],
    ...shadow.button,
  },
  noteWrong: { backgroundColor: '#f0c9b8' },
  noteText: {
    color: '#3a3020',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '600',
  },
  optionsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  optionBtn: {
    backgroundColor: colors.bgPanelLight,
    borderWidth: 1,
    borderColor: colors.accentPurple,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 88,
    alignItems: 'center',
    ...shadow.button,
  },
  letterKey: {
    backgroundColor: colors.bgPanelLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.button,
  },
  optionText: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  solvedSoFar: { ...fonts.body, color: colors.accentGreen, fontSize: 13 },
  nameRow: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 10 },
  nameSlot: {
    width: 50,
    height: 58,
    borderRadius: 10,
    backgroundColor: colors.bgPanel,
    borderWidth: 2,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameLetter: { fontSize: 24, color: colors.textPrimary, fontWeight: '800' },
  detHint: { ...fonts.body, color: colors.accentTeal, fontSize: 13 },
  successText: { ...fonts.body, color: colors.accentGreen },
});
