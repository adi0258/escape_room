import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import InventoryBar from './InventoryBar';
import Narrator from './Narrator';
import { colors } from '../theme/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
}

/** Shared frame for every gameplay screen: dark background + persistent inventory bar. */
export default function StageLayout({ children, scroll = true }: Props) {
  return (
    <View style={styles.screen}>
      <InventoryBar />
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.flexContent}>{children}</View>
      )}
      <Narrator />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDarkest },
  scrollContent: { flexGrow: 1, padding: 20, gap: 16 },
  flexContent: { flex: 1 },
});
