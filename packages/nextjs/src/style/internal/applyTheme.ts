import { SgTheme } from '../types/theme';
import { StyleRule } from '../types/variant';

export type ThemedStyleRule = (theme: any) => StyleRule;
export type ThemedStyles = Record<string, ThemedStyleRule>;

// This wrapper method is necessary to bypass type errors when packaging
// Emotion theme.
export const _applyTheme = (configFn: (theme: SgTheme) => StyleRule): ThemedStyleRule => {
  return (theme: any) => configFn(theme);
};
