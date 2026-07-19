import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { IMG } from '../data/images';
import { sound } from '../fx/sound';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/useGameStore';
import { colors, fonts } from '../theme/theme';
import FlickerTitle from '../components/FlickerTitle';
import GameButton from '../components/GameButton';

export default function IntroScreen() {
  const { playerName, goTo } = useGameStore();

  // user already tapped "start" — browsers now allow audio
  useEffect(() => {
    sound.startAmbient();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Image source={IMG.entrance} style={styles.bg} resizeMode="cover" />
      <View style={styles.nightTint} />
      <View style={styles.content}>
        <FlickerTitle size={24}>הלילה שבו הכל השתנה</FlickerTitle>

        <Text style={fonts.body}>
          שלום {playerName || 'גיבור'}, נשארת אחרי החוגים כדי לחפש את הקלמר ששכחת
          במרתף בית הספר. אבל כשניסית לצאת - הדלת הראשית הייתה נעולה. השעון
          הישן במסדרון מתקתק... באמצע הלילה הוא יצלצל 12 פעמים, ואז יקרה
          "משהו".
        </Text>

        <Text style={fonts.body}>
          לפי השמועות, השרת הזקן של בית הספר, מר אבנר, נעל כאן משהו לפני
          שנעלם מסתורית. יש אומרים שהוא עדיין כאן, מסתובב במסדרונות ומחפש מי
          שיעזור לו לפתור את התעלומה שלו... ואולי גם ישחק אתו כמה משחקי מילים
          גרועים בדרך.
        </Text>

        <Text style={[fonts.body, styles.emphasis]}>
          בית הספר פתוח לחקירה - לך לאן שתרצה, אסוף רמזים, חבר אותם זה לזה,
          וגלה את הסוד של אבנר לפני חצות!
        </Text>

        <GameButton label="קדימה, בואו נתחיל לחקור" onPress={() => goTo('map')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDarkest, overflow: 'hidden' },
  bg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  nightTint: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(6,6,16,0.72)',
  },
  content: { flex: 1, padding: 26, gap: 16, justifyContent: 'center' },
  emphasis: { color: colors.accentGold, fontWeight: '700' },
});
