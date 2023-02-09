import { _createVariants } from '../../style/internal/createVariants';
import { DANGER, PRIMARY, SgTheme } from '../../style/types/theme';

export type ButtonVariantParams = {
  colorScheme: typeof PRIMARY | typeof DANGER;
};

export const defaultVariants: ButtonVariantParams = {
  colorScheme: PRIMARY,
};

const applyThemeAndVariants = _createVariants((theme: SgTheme) => {
  return {
    base: {
      alignItems: 'center',
      borderRadius: '0.5rem',
      display: 'flex',
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25rem',
      justifyContent: 'center',
      padding: '0.5rem 0.75rem',
      width: 'fit-content',
      ':disabled': theme.common.disabled,
      ':disabled:hover': theme.common.disabled,
    },
    variants: {
      colorScheme: {
        primary: {
          color: theme.colors.colorPalettes.primary.textOnBackground,
          backgroundColor: theme.colors.colorPalettes.primary.base,
          ':hover': {
            backgroundColor: theme.colors.colorPalettes.primary.dark,
          },
          ':focus-visible': {
            boxShadow: theme.colors.colorPalettes.primary.darker,
          },
        },
        danger: {
          color: theme.colors.colorPalettes.danger.textOnBackground,
          backgroundColor: theme.colors.colorPalettes.danger.base,
          ':hover': {
            backgroundColor: theme.colors.colorPalettes.danger.dark,
          },
          ':focus-visible': {
            boxShadow: theme.colors.colorPalettes.danger.darker,
          },
        },
      },
    },
    defaultVariants,
    elementOverrides: theme.elementOverrides?.button,
  };
});

export default {
  button: applyThemeAndVariants,
};
