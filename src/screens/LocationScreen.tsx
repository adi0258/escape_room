import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import StageLayout from '../components/StageLayout';
import RoomScene from '../components/RoomScene';
import GameButton from '../components/GameButton';
import { useGameStore } from '../store/useGameStore';
import { RoomConfig } from '../data/rooms';
import { ABILITIES, LOCATIONS, narrator2Line } from '../data/story';
import { IMG } from '../data/images';
import { colors, fonts } from '../theme/theme';
import { sound } from '../fx/sound';
import LockerPuzzle from '../puzzles/LockerPuzzle';
import BoardRiddles from '../puzzles/BoardRiddles';
import CellarSearch from '../puzzles/CellarSearch';
import ClockPuzzle from '../puzzles/ClockPuzzle';

type ViewMode = 'room' | 'locker' | 'board' | 'painting' | 'lostlist';

/**
 * The free-roam hub: renders whichever location the player walked to,
 * builds its hotspots from story data + current flags, exposes the
 * character's special ability, and opens the right puzzle on demand.
 */
export default function LocationScreen() {
  const store = useGameStore();
  const {
    location, playerName, skinId, narrate, hasFlag, setFlag,
    goTo, travelTo, addItem, hasItem,
  } = store;
  const [view, setView] = useState<ViewMode>('room');

  useEffect(() => setView('room'), [location]);

  const def = LOCATIONS[location];

  /* ---------- per-location hotspot building ---------- */
  const buildRoom = (): RoomConfig => {
    switch (location) {
      case 'lobby':
        return {
          sign: def.sign,
          bg: def.bg,
          hotspots: [
            { id: 'exit', x: 55, y: 58, label: hasFlag('clockFixed') ? 'הדלת — פתוחה!' : 'דלת היציאה', action: 'exitDoor' },
            { id: 'lantern', x: 22, y: 40, joke: 'הפנס העתיק מהבהב פעמיים. בשפת הפנסים זה "בהצלחה, תצטרך את זה".' },
            { id: 'sign', x: 55, y: 22, joke: 'השלט אומר "School". פעם הוא אמר "בית ספר". גם לשלטים יש גלגולים.' },
          ],
        };
      case 'hallway':
        return {
          sign: def.sign,
          bg: def.bg,
          hotspots: [
            hasFlag('lockerOpen')
              ? { id: 'locker', x: 33, y: 52, joke: 'הלוקר פתוח וריק. הוא נראה קצת גאה בעצמו.' }
              : { id: 'locker', x: 33, y: 52, label: 'לוקר 236 — נעול', action: 'locker' },
            { id: 'painting', x: 67, y: 37, label: 'תמונה עקומה', action: 'painting' },
            { id: 'window', x: 56, y: 40, joke: 'החלון נעול. בחוץ חושך מוחלט. הקריין ממליץ בחום להישאר בפנים.' },
            { id: 'lockersRow', x: 74, y: 50, joke: 'שורה של לוקרים נעולים. אחד מהם מגרגר בשנתו. עדיף לא להעיר.' },
          ],
        };
      case 'boardCorner':
        return {
          sign: def.sign,
          bg: def.bg,
          hotspots: [
            hasFlag('diary1')
              ? { id: 'board', x: 45, y: 42, joke: 'הלוח כבר גילה את הסוד שלו. עכשיו הוא סתם לוח, וקצת עצוב מזה.' }
              : { id: 'board', x: 45, y: 42, label: 'ארבעה פתקים ישנים', action: 'board' },
            { id: 'painting2', x: 65, y: 16, joke: 'עוד ציור של נוף רגוע. מוזר, אף אחד לא זוכר שתלו אותו שם.' },
            { id: 'lockers2', x: 72, y: 52, joke: 'הלוקרים לוחשים זה לזה משהו על "האזעקה של 1987". טוב שלא שואלים.' },
          ],
        };
      case 'office':
        return {
          sign: def.sign,
          bg: def.bg,
          hotspots: [
            { id: 'lostlist', x: 27, y: 42, label: 'רשימת אבידות ישנה', action: 'lostlist' },
            { id: 'chair', x: 36, y: 76, joke: 'הכיסא של אבנר עדיין מסתובב לאט. לבד. הקריין מעדיף לא להרחיב.' },
            { id: 'keys', x: 74, y: 50, joke: 'לוח מפתחות. כולם תלויים במקומם, חוץ מוו אחד ריק שמישהו סימן בעיגול.' },
            { id: 'mug', x: 47, y: 63, joke: 'ספל קפה מ-1987. הקפה עדיין בפנים. הוא כבר לא קפה. הוא ישות.' },
          ],
        };
      default:
        return { sign: def.sign, bg: def.bg, hotspots: [] };
    }
  };

  /* ---------- actions ---------- */
  const onAction = (id: string) => {
    if (id === 'locker') setView('locker');
    else if (id === 'board') setView('board');
    else if (id === 'lostlist') {
      sound.paper();
      setView('lostlist');
    }
    else if (id === 'painting') {
      sound.paper();
      if (!hasFlag('sawPainting')) {
        setFlag('sawPainting');
        narrate(narrator2Line('paintingClue', playerName));
      }
      setView('painting');
    } else if (id === 'exitDoor') {
      if (hasFlag('clockFixed')) {
        sound.creak();
        narrate(narrator2Line('endingPrompt', playerName));
        setView('room');
        setEndingChoice(true);
      } else {
        sound.error();
        narrate(narrator2Line('lobbyDoorLocked', playerName));
      }
    }
  };

  const [endingChoice, setEndingChoice] = useState(false);

  /* ---------- character ability ---------- */
  const ability = skinId ? ABILITIES[skinId]?.[location] : undefined;
  const abilityKey = `ability_${skinId}_${location}`;
  const abilityUsed = hasFlag(abilityKey);

  const useAbility = () => {
    if (!ability || abilityUsed) return;
    setFlag(abilityKey);
    narrate(ability.narration);
    sound.whisper();
    switch (ability.effect) {
      case 'detLockerHint':
        setFlag('detHintLocker');
        break;
      case 'detBoardHint':
        setFlag('detHintBoard');
        break;
      case 'sciClockHint':
        setFlag('sciHintClock');
        break;
      case 'ninVent':
        if (location === 'hallway') {
          sound.footsteps();
          setFlag('ninVent');
          setTimeout(() => travelTo('cellar'), 1200);
        } else if (location === 'cellar' && !hasItem('candle')) {
          addItem({
            id: 'candle',
            name: 'נר שעווה עבה',
            emoji: '🕯️',
            description: 'נר לבן וכבד שנשלף מהמדף הגבוה ביותר, בלי סולם ובלי רעש.',
          });
          sound.success();
        }
        break;
    }
  };

  /* ---------- special locations ---------- */
  if (location === 'stairs') return <StairsLocation />;
  if (location === 'cellar') {
    return (
      <StageLayout scroll={false}>
        <CellarSearch
          onDone={() => travelTo('clockRoom')}
          onBack={() => travelTo('stairs')}
        />
        <AbilityFab ability={ability} used={abilityUsed} onPress={useAbility} />
      </StageLayout>
    );
  }
  if (location === 'clockRoom') {
    return (
      <StageLayout>
        <ClockPuzzle onBack={() => (hasFlag('clockFixed') ? goTo('map') : travelTo('cellar'))} />
        <AbilityFab ability={ability} used={abilityUsed} onPress={useAbility} />
      </StageLayout>
    );
  }

  /* ---------- sub-views ---------- */
  if (view === 'locker') {
    return (
      <StageLayout>
        <LockerPuzzle onClose={() => setView('room')} />
      </StageLayout>
    );
  }
  if (view === 'board') {
    return (
      <StageLayout>
        <BoardRiddles onClose={() => setView('room')} />
      </StageLayout>
    );
  }
  if (view === 'lostlist') {
    return (
      <StageLayout>
        <Text style={fonts.heading}>רשימת אבידות — בכתב ידו של אבנר</Text>
        <View style={styles.etchedBox}>
          <Text style={styles.lostText}>
            דברים שאיבדתי במרתף (רשימה חלקית):{'\n\n'}
            — גלגל השיניים — נפל לי ליד הלוקרים הישנים, בצד שמאל{'\n'}
            — הנר הטוב — השארתי ליד הלוח, באמצע{'\n'}
            — הפתק החשוב — אולי על המדפים? בצד ימין?{'\n\n'}
            אם מישהו מוצא — שיביא לחדר... הוא כבר יידע לאן.
          </Text>
        </View>
        <Text style={fonts.body}>
          רשימה מצהיבה שתלויה מעל השולחן. מי שכתב אותה ידע שמישהו יקרא אותה
          יום אחד.
        </Text>
        <GameButton label="להחזיר למקום" onPress={() => setView('room')} variant="purple" />
      </StageLayout>
    );
  }
  if (view === 'painting') {
    return (
      <StageLayout>
        <Text style={fonts.heading}>מאחורי התמונה</Text>
        <Image source={IMG.painting} style={styles.paintingImg} resizeMode="cover" />
        <View style={styles.etchedBox}>
          <Text style={styles.etchedText}>"המספרים משקרים.{'\n'}תקרא אותם הפוך."</Text>
        </View>
        <Text style={fonts.body}>
          חרוט בצד האחורי של המסגרת, בכתב יד רועד. מישהו רצה שמישהו אחר ימצא
          את זה יום אחד.
        </Text>
        <GameButton label="לתלות בחזרה (עקום)" onPress={() => setView('room')} variant="purple" />
      </StageLayout>
    );
  }

  /* ---------- default: the room itself ---------- */
  return (
    <StageLayout scroll={false}>
      <RoomScene room={buildRoom()} onAction={onAction} />

      {endingChoice && (
        <View style={styles.endingOverlay}>
          <Text style={styles.endingTitle}>הדלת פתוחה. אבנר מחכה מאחוריך.</Text>
          <GameButton
            label="להישאר רגע ולהיפרד"
            onPress={() => store.setEnding('farewell')}
          />
          <GameButton
            label="לרוץ החוצה עכשיו"
            variant="purple"
            onPress={() => store.setEnding('escape')}
          />
        </View>
      )}

      <MapFab onPress={() => goTo('map')} />
      <AbilityFab ability={ability} used={abilityUsed} onPress={useAbility} />
    </StageLayout>
  );
}

/* ---------- the stairs: the Stanley Parable choice beat ---------- */
function StairsLocation() {
  const { playerName, narrate, hasFlag, setFlag, travelTo, goTo } = useGameStore();
  const first = !hasFlag('stairsChoiceDone');

  const descend = (defied: boolean) => {
    setFlag('stairsChoiceDone');
    sound.footsteps();
    narrate(narrator2Line(defied ? 'stairsDefied' : 'stairsObeyed', playerName));
    setTimeout(() => travelTo('cellar'), 900);
  };

  return (
    <StageLayout scroll={false}>
      <View style={styles.stairsWrap}>
        <Image source={IMG.stairs} style={styles.stairsBg} resizeMode="cover" />
        <View style={styles.stairsTint} />
        <View style={styles.stairsContent}>
          <View style={styles.signPlate}>
            <Text style={styles.signText}>
              {first
                ? 'הסיפור אומר: "הגיבור ירד במדרגות בזהירות."'
                : 'גרם המדרגות. עדיין חורק.'}
            </Text>
          </View>
          {first ? (
            <>
              <GameButton label="לרדת בזהירות, כמו שהסיפור אמר" onPress={() => descend(false)} />
              <GameButton label="לגלוש על המעקה!!" variant="purple" onPress={() => descend(true)} />
            </>
          ) : (
            <>
              <GameButton label="לרדת למרתף" onPress={() => travelTo('cellar')} />
              <GameButton label="לחזור למסדרון" variant="ghost" onPress={() => travelTo('hallway')} />
            </>
          )}
        </View>
      </View>
      <MapFab onPress={() => goTo('map')} />
    </StageLayout>
  );
}

/* ---------- floating buttons ---------- */
function MapFab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={styles.mapFab}
      onPress={() => {
        sound.click();
        onPress();
      }}>
      <Text style={styles.fabText}>מפה</Text>
    </Pressable>
  );
}

function AbilityFab({
  ability,
  used,
  onPress,
}: {
  ability?: { label: string };
  used: boolean;
  onPress: () => void;
}) {
  if (!ability || used) return null;
  return (
    <Pressable style={styles.abilityFab} onPress={onPress}>
      <Text style={styles.abilityText}>{ability.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  paintingImg: {
    width: '100%',
    height: 260,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  etchedBox: {
    backgroundColor: '#171410',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5d5340',
    padding: 16,
  },
  lostText: {
    color: '#cdbd97',
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  etchedText: {
    color: '#cdbd97',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  endingOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 90,
    backgroundColor: 'rgba(10,10,18,0.94)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.accentGold,
    padding: 18,
    gap: 12,
  },
  endingTitle: { ...fonts.heading, textAlign: 'center' },
  stairsWrap: { flex: 1, overflow: 'hidden' },
  stairsBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  stairsTint: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(8,8,20,0.5)',
  },
  stairsContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 22,
    gap: 12,
  },
  signPlate: {
    alignSelf: 'center',
    backgroundColor: 'rgba(24,28,22,0.92)',
    borderWidth: 2,
    borderColor: '#8b8a70',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
  },
  signText: {
    color: '#e9e4c6',
    fontSize: 14,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  mapFab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgPanelLight,
    borderWidth: 2,
    borderColor: colors.accentTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: colors.textPrimary, fontWeight: '800', fontSize: 14, writingDirection: 'rtl' },
  abilityFab: {
    position: 'absolute',
    right: 16,
    bottom: 92,
    backgroundColor: colors.bgPanelLight,
    borderWidth: 2,
    borderColor: colors.accentPurple,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  abilityText: { color: colors.textPrimary, fontWeight: '800', writingDirection: 'rtl' },
});
