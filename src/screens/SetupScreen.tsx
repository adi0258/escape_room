import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SKINS, SkinId } from '../data/skins';
import { useGameStore } from '../store/useGameStore';
import { serif } from '../theme/theme';
import { IMG } from '../data/images';
import GameButton from '../components/GameButton';
import { sound } from '../fx/sound';

/**
 * Character selection styled as filling in an old school registration form:
 * aged paper, ink lines, serif type, and "student card" archetypes with
 * ink monograms — no emojis, matching the vintage CRT title screen.
 */
export default function SetupScreen() {
  const [name, setName] = useState('');
  const [skinId, setSkinId] = useState<SkinId | null>(null);
  const setPlayer = useGameStore(s => s.setPlayer);
  const goTo = useGameStore(s => s.goTo);

  const canStart = name.trim().length > 0 && !!skinId;

  const onStart = () => {
    if (!canStart) return;
    sound.paper();
    setPlayer(name.trim(), skinId as SkinId);
    goTo('intro');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Image source={IMG.entrance} style={styles.bg} resizeMode="cover" />
      <View style={styles.nightTint} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.form}>
            <Text style={styles.formHeader}>בית הספר ע״ש התקווה</Text>
            <Text style={styles.formSub}>טופס רישום תלמיד/ה — משמרת לילה</Text>
            <View style={styles.rule} />

            <Text style={styles.fieldLabel}>שם מלא (בעט כחול או שחור בלבד)</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="____________________"
              placeholderTextColor="rgba(60,48,32,0.45)"
              style={styles.input}
              maxLength={16}
              textAlign="right"
            />

            <Text style={styles.fieldLabel}>סוג התלמיד/ה (סמנו אחד)</Text>
            <View style={styles.cards}>
              {SKINS.map(skin => {
                const active = skin.id === skinId;
                return (
                  <Pressable
                    key={skin.id}
                    onPress={() => {
                      sound.click();
                      setSkinId(skin.id);
                    }}
                    style={[styles.card, active && styles.cardActive]}>
                    <View style={[styles.monogram, active && styles.monogramActive]}>
                      <Text style={styles.monogramText}>{skin.initial}</Text>
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardName}>{skin.name}</Text>
                      <Text style={styles.cardTagline}>{skin.tagline}</Text>
                    </View>
                    <View style={[styles.checkbox, active && styles.checkboxOn]}>
                      {active && <Text style={styles.checkboxMark}>✕</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.smallPrint}>
              בחתימתך את/ה מאשר/ת שנשארת בבית הספר אחרי שעות הפעילות, ושכל
              מפגש עם רוחות הוא באחריותך בלבד.
            </Text>
          </View>

          <GameButton
            label="לחתום ולהיכנס"
            onPress={onStart}
            disabled={!canStart}
            style={styles.startBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const paperInk = '#3a2f1e';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0806', overflow: 'hidden' },
  flex: { flex: 1 },
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
    backgroundColor: 'rgba(6,6,14,0.68)',
  },
  content: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 40,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  form: {
    backgroundColor: '#e9ddba',
    borderRadius: 4,
    padding: 20,
    borderWidth: 1,
    borderColor: '#b6a475',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    transform: [{ rotate: '-0.6deg' }],
  },
  formHeader: {
    fontFamily: serif,
    fontSize: 22,
    fontWeight: '700',
    color: paperInk,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  formSub: {
    fontFamily: serif,
    fontSize: 13,
    color: 'rgba(58,47,30,0.75)',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  rule: {
    borderBottomWidth: 2,
    borderColor: paperInk,
    marginVertical: 12,
  },
  fieldLabel: {
    fontFamily: serif,
    fontSize: 14,
    fontWeight: '700',
    color: paperInk,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    fontFamily: serif,
    fontSize: 18,
    color: '#1d2b52',
    borderBottomWidth: 1,
    borderColor: 'rgba(58,47,30,0.6)',
    paddingVertical: 6,
    marginBottom: 8,
  },
  cards: { gap: 10 },
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(58,47,30,0.5)',
    borderRadius: 3,
    padding: 12,
    backgroundColor: 'rgba(255,250,235,0.5)',
  },
  cardActive: {
    borderColor: paperInk,
    borderWidth: 2,
    backgroundColor: 'rgba(255,250,235,0.9)',
  },
  monogram: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'rgba(58,47,30,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramActive: { borderColor: paperInk, backgroundColor: 'rgba(58,47,30,0.08)' },
  monogramText: {
    fontFamily: serif,
    fontSize: 24,
    fontWeight: '800',
    color: paperInk,
  },
  cardBody: { flex: 1 },
  cardName: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: '700',
    color: paperInk,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardTagline: {
    fontFamily: serif,
    fontSize: 12.5,
    color: 'rgba(58,47,30,0.8)',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: 'rgba(58,47,30,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { borderColor: paperInk },
  checkboxMark: { color: '#1d2b52', fontWeight: '900', fontSize: 15 },
  smallPrint: {
    fontFamily: serif,
    fontSize: 10.5,
    color: 'rgba(58,47,30,0.65)',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 14,
    lineHeight: 15,
  },
  startBtn: { marginTop: 18 },
});
