import { slateDark } from '@radix-ui/colors';
import { SgTheme } from '../types/theme';
import { defaultTheme } from './default';

export const darkTheme: SgTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: slateDark.slate3,
    inputBackground: slateDark.slate7,
    text: slateDark.slate12,
    textSecondary: slateDark.slate11,
    inputText: slateDark.slate11,
  },
  componentOverrides: {
    selectTrigger: {
      ':hover': {
        backgroundColor: slateDark.slate1,
      },
      ':disabled': {
        backgroundColor: slateDark.slate3,
      },
    },
  },
};
