export const colors = {
  background: '#0F1220',
  surface: '#1B1F33',
  surfaceAlt: '#242A45',
  primary: '#6C63FF',
  primaryMuted: '#4A4590',
  success: '#3DDC97',
  danger: '#FF6B6B',
  text: '#F4F5FA',
  textMuted: '#9AA0BE',
  border: '#2E3455',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: {fontSize: 28, fontWeight: '700' as const, color: colors.text},
  heading: {fontSize: 20, fontWeight: '600' as const, color: colors.text},
  body: {fontSize: 16, fontWeight: '400' as const, color: colors.text},
  caption: {fontSize: 13, fontWeight: '400' as const, color: colors.textMuted},
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
};
