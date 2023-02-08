export const PRIMARY = 'primary';
export const DANGER = 'danger';
const COLOR_VARIANTS = ['primary', 'danger'] as const;

export type ColorVariant = (typeof COLOR_VARIANTS)[number];

export type SgTheme = {
  colors: Colors;
  common: CommonStyles;
  // TODO: Type this properly
  elementOverrides?: Record<string, any>;
};

export type CommonStyles = {
  disabled: {
    backgroundColor: string;
    color: string;
    cursor: string;
  };
};

export type Colors = {
  background: string;
  inputBackground: string;
  text: string;
  textSecondary: string;
  inputText: string;
  disabled: string;
  colorPalettes: Record<ColorVariant, ColorPalette>;
};

export type ColorPalette = {
  lighter?: string;
  light?: string;
  base: string;
  dark?: string;
  darker?: string;

  // Text color if background is this color palette
  // Falls back to `Colors.text` if not given.
  textOnBackground?: string;
};
