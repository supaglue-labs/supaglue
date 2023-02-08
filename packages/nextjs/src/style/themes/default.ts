import { blackA, indigo, red, slate } from '@radix-ui/colors';
import { SgTheme } from '../types/theme';

export const defaultTheme: SgTheme = {
  colors: {
    background: 'white',
    inputBackground: 'white',
    text: 'black',
    textSecondary: blackA.blackA11,
    inputText: 'black',
    disabled: slate.slate8,
    colorPalettes: {
      primary: {
        base: indigo.indigo9,
        dark: indigo.indigo10,
        darker: indigo.indigo12,
        textOnBackground: 'white',
      },
      danger: {
        base: red.red9,
        dark: red.red10,
        darker: red.red12,
        textOnBackground: 'white',
      },
    },
  },
  common: {
    disabled: {
      cursor: 'not-allowed',
      backgroundColor: slate.slate8,
      color: slate.slate1,
    },
  },
};
