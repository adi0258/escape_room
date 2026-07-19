import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/useGameStore';
import { colors, fonts } from '../theme/theme';
import FlickerTitle from '../components/FlickerTitle';
import GameButton from '../components/GameButton';
import { ENDINGS } from '../data/story';
import { IMG } from '../data/images';
import { SkinId } from '../data/skins';
import { sound } from '../fx/sound';

const SKIN_GOODBYE: Record<SkinId, string> = {
  detective: 'הבלש סגר את המחברת: "תיק המרתף — פוענח."',
  scientist: 'המדענית רשמה מסקנה: "רוחות — עובדות מדעית. צריך רק להקשיב."',
  ninja: 'הנינג׳ה... רגע, איפה היא? היא כבר בבית. כמובן.',
};

export default function EndingScreen() {
  const { playerName, skinId, endingId, hintsUsedTotal, resetGame } = useGameStore();
  const ending = ENDINGS[endingId ?? 'farewell'];

  return (
    <SafeAreaView style={styles.safe}>
      <Image source={IMG.painting} style={styles.bg} resizeMode="cover" />
      <View style={styles.nightTint} />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={IMG.ghost} style={styles.ghostImg} resizeMode="cover" />
        <FlickerTitle size={26}>{ending.title}</FlickerTitle>

        <Text style={fonts.body}>{ending.text}</Text>

        <View style={styles.stampBox}>
          <Text style={styles.stampText}>{ending.stamp}</Text>
          <Text style={styles.statsText}>
            {playerName || 'הגיבור'} • רמזים מהרוח: {hintsUsedTotal}
          </Text>
          {skinId && <Text style={styles.skinLine}>{SKIN_GOODBYE[skinId]}</Text>}
        </View>

        <GameButton
          label="לשחק שוב מההתחלה"
          onPress={() => {
            sound.stopAmbient();
            resetGame();
          }}
          variant="purple"
        />
      </ScrollView>
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
    backgroundColor: 'rgba(6,6,16,0.82)',
  },
  content: { flexGrow: 1, padding: 26, gap: 16, justifyContent: 'center' },
  bigEmoji: { fontSize: 52, textAlign: 'center' },
  ghostImg: {
    alignSelf: 'center',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 3,
    borderColor: 'rgba(242,193,78,0.6)',
  },
  stampBox: {
    backgroundColor: 'rgba(27,27,46,0.9)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.accentGold,
    padding: 16,
    gap: 8,
  },
  stampText: { ...fonts.body, color: colors.accentGold, textAlign: 'center', fontWeight: '700' },
  statsText: { ...fonts.body, textAlign: 'center', fontSize: 14 },
  skinLine: { ...fonts.body, textAlign: 'center', fontSize: 14, color: colors.accentTeal },
});
