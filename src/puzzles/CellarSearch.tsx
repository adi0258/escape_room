import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  GestureResponderEvent,
  Pressable,
} from 'react-native';
import GameButton from '../components/GameButton';
import HintButton from '../components/HintButton';
import { colors, fonts } from '../theme/theme';
import { useGameStore } from '../store/useGameStore';
import { IMG, coverPoint } from '../data/images';
import { narrator2Line } from '../data/story';
import { sound } from '../fx/sound';

const REVEAL_RADIUS = 95;

interface HiddenObject {
  id: string;
  x: number;
  y: number;
  name: string;
  emoji: string;
  description: string;
}

// x/y are image-space % on school_cellar.png
const OBJECTS: HiddenObject[] = [
  {
    id: 'candle',
    x: 28,
    y: 26,
    name: 'נר שעווה עבה',
    emoji: '🕯️',
    description: 'נר לבן וכבד, מלא טביעות אצבע ישנות. מישהו השתמש בו הרבה, מזמן.',
  },
  {
    id: 'cipher_note',
    x: 37,
    y: 46,
    name: 'פתק מוצפן',
    emoji: '🧾',
    description:
      'בכתב יד רועד: "☾☾:Δ✶ — הרגע שבו הכל נעצר." ולמטה, בקטן: ☾=1, Δ=4, ✶=7',
  },
  {
    id: 'gear',
    x: 72,
    y: 50,
    name: 'גלגל שיניים',
    emoji: '⚙️',
    description: 'גלגל פליז כבד, 24 שיניים, מבריק כאילו חיכה שימצאו אותו.',
  },
];

interface Props {
  onDone: () => void;
  onBack: () => void;
}

/**
 * The dark cellar: pitch black without the flashlight. The beam is a real
 * clipped window into the lit photo. All three finds feed the clock puzzle.
 */
export default function CellarSearch({ onDone, onBack }: Props) {
  const { playerName, narrate, hasItem, addItem, setFlag, hasFlag } = useGameStore();
  const [torch, setTorch] = useState<{ x: number; y: number } | null>(null);
  const [layout, setLayout] = useState({ width: 1, height: 1 });
  const roomRef = useRef<View>(null);
  const origin = useRef({ x: 0, y: 0 });
  const hasFlashlight = hasItem('flashlight');
  const foundAll = OBJECTS.every(o => hasItem(o.id));

  const onTouch = (e: GestureResponderEvent) => {
    const ne: any = e.nativeEvent;
    const pageX = ne.pageX ?? ne.touches?.[0]?.pageX;
    const pageY = ne.pageY ?? ne.touches?.[0]?.pageY;
    if (typeof pageX !== 'number') return;
    // re-measure on every touch: onLayout-time measurement proved unreliable
    // when the screen mounts mid-transition
    roomRef.current?.measureInWindow((x: number, y: number) => {
      origin.current = { x, y };
      setTorch({ x: pageX - x, y: pageY - y });
    });
    setTorch({ x: pageX - origin.current.x, y: pageY - origin.current.y });
  };

  const objPoint = (obj: HiddenObject) =>
    coverPoint('cellar', obj.x, obj.y, layout.width, layout.height);

  const isLit = (obj: HiddenObject) => {
    if (!torch || layout.width <= 1) return false;
    const p = objPoint(obj);
    return Math.hypot(torch.x - p.x, torch.y - p.y) <= REVEAL_RADIUS;
  };

  const collect = (obj: HiddenObject) => {
    if (hasItem(obj.id) || !isLit(obj)) return;
    sound.success();
    addItem({ id: obj.id, name: obj.name, emoji: obj.emoji, description: obj.description });
    const remaining = OBJECTS.filter(o => o.id !== obj.id && !hasItem(o.id));
    if (remaining.length === 0) {
      sound.unlock();
      setFlag('cellarSearchDone');
      setFlag('clockRoomUnlocked');
      narrate(narrator2Line('cellarAllFound', playerName));
    }
  };

  if (!hasFlashlight) {
    return (
      <View style={styles.darkWrap}>
        <Text style={styles.darkText}>
          חושך. חושך מוחלט. אתה שומע את עצמך נושם, ומשהו מטפטף רחוק.
        </Text>
        <Text style={styles.darkSub}>
          בלי מקור אור אין מה לחפש כאן. אולי מוסתר פנס איפשהו בבית הספר?
        </Text>
        <GameButton label="לחזור לאור" onPress={onBack} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={fonts.heading}>המרתף</Text>
      <Text style={styles.instructions}>
        הפנס מאיר עיגול קטן. גרור את האצבע וחפש שלושה חפצים שאבנר איבד.
      </Text>

      <Pressable
        ref={roomRef}
        style={styles.darkRoom}
        onLayout={e => {
          setLayout(e.nativeEvent.layout);
          roomRef.current?.measureInWindow((x, y) => {
            origin.current = { x, y };
          });
        }}
        onPressIn={onTouch}
        onTouchMove={onTouch}>
        <Image source={IMG.cellar} style={styles.bgDim} resizeMode="cover" />
        <View style={styles.blackout} />

        {torch && layout.width > 1 && (
          <View
            pointerEvents="none"
            style={[
              styles.torchCircle,
              { left: torch.x - REVEAL_RADIUS, top: torch.y - REVEAL_RADIUS },
            ]}>
            <Image
              source={IMG.cellar}
              resizeMode="cover"
              style={{
                position: 'absolute',
                left: -(torch.x - REVEAL_RADIUS),
                top: -(torch.y - REVEAL_RADIUS),
                width: layout.width,
                height: layout.height,
              }}
            />
            <View style={styles.torchWarmth} />
          </View>
        )}

        {OBJECTS.map(obj => {
          const collected = hasItem(obj.id);
          const visible = collected || isLit(obj);
          const p = objPoint(obj);
          return (
            <Pressable
              key={obj.id}
              onPress={() => collect(obj)}
              style={[styles.objectSpot, { left: p.x - 28, top: p.y - 32 }]}>
              {visible && (
                <View style={[styles.ring, collected && styles.ringFound]}>
                  <Text style={styles.ringMark}>{collected ? '✓' : '?'}</Text>
                </View>
              )}
              {visible && <Text style={styles.objectName}>{obj.name}</Text>}
            </Pressable>
          );
        })}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.progressText}>
          נאספו {OBJECTS.filter(o => hasItem(o.id)).length} מתוך {OBJECTS.length}
        </Text>
        <View style={styles.navRow}>
          {(foundAll || hasFlag('clockRoomUnlocked')) && (
            <GameButton label="אל הדלת הנסתרת" onPress={onDone} />
          )}
          <GameButton label="חזרה למדרגות" onPress={onBack} variant="ghost" />
        </View>
      </View>

      <HintButton
        delaySeconds={40}
        hints={[
          'גרור את האצבע לאט לאורך הקירות. שלושה דברים מחכים בחושך.',
          'אחד ליד הלוקרים משמאל, אחד באמצע ליד הלוח, אחד על המדפים מימין.',
          'כשמופיעה טבעת עם סימן שאלה — לחץ עליה!',
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  instructions: { ...fonts.body, paddingHorizontal: 20, paddingBottom: 8 },
  darkWrap: { flex: 1, justifyContent: 'center', padding: 30, gap: 16 },
  darkText: { ...fonts.heading, textAlign: 'center' },
  darkSub: { ...fonts.body, textAlign: 'center' },
  darkRoom: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#020204',
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  bgDim: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  blackout: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(2,2,5,0.93)',
  },
  torchCircle: {
    position: 'absolute',
    width: REVEAL_RADIUS * 2,
    height: REVEAL_RADIUS * 2,
    borderRadius: REVEAL_RADIUS,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(242,193,78,0.35)',
  },
  torchWarmth: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(242,193,78,0.08)',
  },
  objectSpot: {
    position: 'absolute',
    width: 56,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#f2c14e',
    backgroundColor: 'rgba(242,193,78,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringFound: {
    borderColor: colors.accentGreen,
    backgroundColor: 'rgba(78,203,113,0.25)',
  },
  ringMark: { color: '#fff', fontWeight: '900', fontSize: 16 },
  objectName: {
    color: '#f5efd2',
    fontSize: 10,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  footer: { padding: 14, gap: 10, alignItems: 'center' },
  navRow: { flexDirection: 'row-reverse', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  progressText: { ...fonts.body, textAlign: 'center' },
});
