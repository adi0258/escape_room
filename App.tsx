/**
 * המרתף המקולל — free-roam escape room for kids, fully in Hebrew with RTL.
 * @format
 */
import React, { useEffect, useRef } from 'react';
import { Animated, I18nManager, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameStore } from './src/store/useGameStore';
import { colors } from './src/theme/theme';

import TitleScreen from './src/screens/TitleScreen';
import SetupScreen from './src/screens/SetupScreen';
import IntroScreen from './src/screens/IntroScreen';
import MapScreen from './src/screens/MapScreen';
import LocationScreen from './src/screens/LocationScreen';
import EndingScreen from './src/screens/EndingScreen';

// Force RTL layout for the whole app so flex-direction, text-align, etc. flow right-to-left.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  // Note: a full RTL flip on native requires an app reload/restart after the first launch.
}

function AppContent() {
  const screen = useGameStore(s => s.screen);
  const location = useGameStore(s => s.location);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [screen, location, fade]);

  // "walking into the room": fade in with a slight zoom-out settle
  const scale = fade.interpolate({ inputRange: [0, 1], outputRange: [1.05, 1] });

  let ScreenComponent: React.ReactNode;
  switch (screen) {
    case 'title':
      ScreenComponent = <TitleScreen />;
      break;
    case 'setup':
      ScreenComponent = <SetupScreen />;
      break;
    case 'intro':
      ScreenComponent = <IntroScreen />;
      break;
    case 'map':
      ScreenComponent = <MapScreen />;
      break;
    case 'location':
      ScreenComponent = <LocationScreen />;
      break;
    case 'ending':
      ScreenComponent = <EndingScreen />;
      break;
    default:
      ScreenComponent = <TitleScreen />;
  }

  return (
    <Animated.View style={[styles.flex, { opacity: fade, transform: [{ scale }] }]}>
      {ScreenComponent}
    </Animated.View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDarkest} />
      <View style={styles.flex}>
        <AppContent />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgDarkest },
});

export default App;
