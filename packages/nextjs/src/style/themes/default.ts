import { blackA, indigo, slate } from '@radix-ui/colors';
import { SgTheme } from '../../types/theme';

export const defaultTheme: SgTheme = {
  colors: {
    background: 'white',
    inputBackground: 'white',
    text: 'black',
    textSecondary: blackA.blackA11,
    inputText: 'black',
    disabled: slate.slate8,
    textOnPrimaryBackground: 'white',
    primary: {
      base: indigo.indigo9,
      dark: indigo.indigo10,
      darker: indigo.indigo12,
    },
  },
};
