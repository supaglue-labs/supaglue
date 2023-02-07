import { SgTheme } from '../types/theme';
import { StyleRule } from '../types/variant';

export const _applyTheme = (configFn: (theme: SgTheme) => StyleRule) => {
  return (theme: any) => configFn(theme);
};
