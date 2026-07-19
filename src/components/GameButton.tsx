import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, shadow } from '../theme/theme';
import { sound } from '../fx/sound';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'gold' | 'purple' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

/** Large, thumb-friendly CTA button sized for 9-10 year old touch targets. */
export default function GameButton({
  label,
  onPress,
  variant = 'gold',
  disabled,
  style,
}: Props) {
  const bg =
    variant === 'gold'
      ? colors.accentGold
      : variant === 'purple'
      ? colors.accentPurple
      : 'transparent';

  return (
    <Pressable
      onPress={() => {
        sound.click();
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        variant === 'ghost' && styles.ghostBorder,
        shadow.button,
        style,
      ]}>
      <Text
        style={[
          fonts.button,
          variant === 'ghost' && { color: colors.textPrimary },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBorder: {
    borderWidth: 2,
    borderColor: colors.border,
  },
});
