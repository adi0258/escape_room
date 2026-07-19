import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Narrator from '../components/Narrator';
import { useGameStore } from '../store/useGameStore';
import { IMG } from '../data/images';
import { sound } from '../fx/sound';

/**
 * The retro-CRT title screen. The menu labels are baked into the artwork, so
 * invisible hit-areas sit on top of them; only "New Game" actually works —
 * the rest get Stanley-Parable narrator responses.
 */
const IMAGE_ASPECT = 1176 / 856;

const MENU = [
  { id: 'new', x: 72, joke: null },
  {
    id: 'load',
    x: 57,
    joke: 'הקריין בדק. אין משחקים שמורים. יש רק "עכשיו". פילוסופי, נכון?',
  },
  {
    id: 'options',
    x: 42,
    joke: 'האפשרויות: להיכנס למרתף, או להיכנס למרתף. הקריין ממליץ על הראשונה.',
  },
  {
    id: 'exit',
    x: 28.5,
    joke: 'יציאה? עוד לא נכנסת! הקריין מציע בנימוס לנסות את הכפתור הימני.',
  },
];

export default function TitleScreen() {
  const goTo = useGameStore(s => s.goTo);
  const narrate = useGameStore(s => s.narrate);
  // fit the CRT artwork inside the window on any aspect ratio (widescreen included)
  const [frame, setFrame] = useState({ w: 0, h: 0 });

  const press = (item: (typeof MENU)[number]) => {
    sound.click();
    if (item.id === 'new') {
      sound.creak();
      goTo('setup');
    } else if (item.joke) {
      sound.whisper();
      narrate(item.joke);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View
        style={styles.center}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          const w = Math.min(width, height * IMAGE_ASPECT);
          setFrame({ w, h: w / IMAGE_ASPECT });
        }}>
        <View style={[styles.frame, frame.w > 0 && { width: frame.w, height: frame.h }]}>
          <Image source={IMG.title} style={styles.img} resizeMode="contain" />
          {MENU.map(item => (
            <Pressable
              key={item.id}
              onPress={() => press(item)}
              style={[styles.menuHit, { left: `${item.x - 9}%` }]}
            />
          ))}
        </View>
      </View>
      <Narrator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0806' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frame: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT,
  },
  img: { width: '100%', height: '100%' },
  menuHit: {
    position: 'absolute',
    top: '66%',
    height: '14%',
    width: '18%',
  },
});
