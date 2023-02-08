import { purple, slateDark } from '@radix-ui/colors';
import { SgTheme } from '../types/theme';
import { defaultTheme } from './default';

export const darkTheme: SgTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: slateDark.slate3,
    inputBackground: slateDark.slate7,
    text: slateDark.slate11,
    textSecondary: slateDark.slate10,
    inputText: slateDark.slate11,
    colorPalettes: {
      ...defaultTheme.colors.colorPalettes,
      primary: {
        base: purple.purple9,
        dark: purple.purple10,
        darker: purple.purple12,
        textOnBackground: 'white',
      },
    },
  },
  elementOverrides: {
    selectTrigger: {
      ':hover': {
        backgroundColor: slateDark.slate8,
      },
      ':disabled': {
        backgroundColor: slateDark.slate4,
      },
    },
    selectItem: {
      highlighted: {
        backgroundColor: purple.purple11,
      },
      selected: {
        backgroundColor: purple.purple11,
      },
    },
  },
};
