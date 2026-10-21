// Synapse / Theme, read directly from the saved Figma variable collection.
export const palettes = {
  dark: {
    background: '#080d24',
    surface: '#111b36',
    border: '#293957',
    text: '#f4f7ff',
    muted: '#a7b5cd',
    accent: '#38def3',
    primary: '#38def3',
    onPrimary: '#06182d',
    error: '#ffb4b4',
  },
  light: {
    background: '#f3faf9',
    surface: '#ffffff',
    border: '#c6dbdf',
    text: '#102c3d',
    muted: '#516b79',
    accent: '#087f87',
    primary: '#2456db',
    onPrimary: '#ffffff',
    error: '#b42336',
  },
} as const;

export type ThemeName = keyof typeof palettes;
export type Colors = { [K in keyof typeof palettes.light]: string };

export const fonts = {
  heading: 'Manrope_700Bold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const layout = {
  gutter: 28,
  maxWidth: 446,
  targetWidth: 390,
  targetHeight: 844,
  inputHeight: 44,
  fieldGap: 8,
  inputRadius: 12,
  buttonHeight: 54,
  buttonRadius: 14,
  cardRadius: 18,
  headerLogo: 44,
  welcomeLogo: 290,
  touchTarget: 44,
} as const;
