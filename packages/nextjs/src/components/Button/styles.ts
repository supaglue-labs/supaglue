import { css } from '@emotion/react';

export default {
  button: (theme: any) =>
    css({
      alignItems: 'center',
      borderRadius: '0.5rem',
      color: theme.colors.textOnPrimaryBackground,
      display: 'flex',
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25rem',
      justifyContent: 'center',
      padding: '0.5rem 0.75rem',
      width: 'fit-content',
      backgroundColor: theme.colors.primary.base,
      ':hover': {
        backgroundColor: theme.colors.primary.dark,
      },
      ':focus-visible': {
        boxShadow: theme.colors.primary.darker,
      },
      ':disabled': {
        cursor: 'not-allowed',
        backgroundColor: theme.colors.disabled,
      },
    }),
};
