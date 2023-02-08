import { SgTheme } from '../types/theme';
import { StyleRule } from '../types/variant';

// This wrapper method is necessary to bypass type errors when packaging
// Emotion theme.
export const _applyTheme = (configFn: (theme: SgTheme) => StyleRule) => {
  return (theme: any) => configFn(theme);
};
