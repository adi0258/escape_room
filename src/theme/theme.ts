import { Platform } from 'react-native';

/**
 * Central theme for "המרתף המקולל" — dark, moody, kid-friendly palette + shared shadow/typography tokens.
 */
export const serif = Platform.select({
  web: 'Georgia, "Times New Roman", serif',
  ios: 'Georgia',
  default: 'serif',
});

export const colors = {
  bgDarkest: '#0a0a12',
  bgDark: '#12121f',
  bgPanel: '#1b1b2e',
  bgPanelLight: '#252540',
  accentPurple: '#7c5cff',
  accentPurpleDark: '#4b34a8',
  accentGold: '#f2c14e',
  accentGoldDark: '#c99a2e',
  accentGreen: '#4ecb71',
  accentRed: '#ff5c5c',
  accentTeal: '#3ddad0',
  textPrimary: '#f4f1ff',
  textSecondary: '#b7b3d4',
  textMuted: '#7a7699',
  glowPurple: 'rgba(124,92,255,0.55)',
  glowGold: 'rgba(242,193,78,0.55)',
  overlayDark: 'rgba(4,4,10,0.86)',
  border: 'rgba(124,92,255,0.35)',
};

export const shadow = {
  panel: {
    shadowColor: colors.accentPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  glowGold: {
    shadowColor: colors.accentGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const fonts = {
  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: colors.accentGold,
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
    lineHeight: 24,
  },
  button: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.bgDarkest,
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
  },
};
