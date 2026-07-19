// Lightweight web stand-in for react-native-safe-area-context.
// The real package leans on a native bridge that never resolves in a
// browser bundle, so the web build gets a plain pass-through instead.
import React from 'react';
import { View } from 'react-native';

const zeroInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export const SafeAreaProvider = ({ children, style }) => (
  <View style={[{ flex: 1 }, style]}>{children}</View>
);

export const SafeAreaView = ({ children, style, ...rest }) => (
  <View style={[{ flex: 1 }, style]} {...rest}>
    {children}
  </View>
);

export const useSafeAreaInsets = () => zeroInsets;
export const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 0, height: 0 });
