import { css } from '@emotion/react';
import { indigo, slate } from '@radix-ui/colors';
import buttonStyles from '../Button/styles';

const selectTrigger = (theme: any) => [
  buttonStyles.button,
  css({
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.inputText,
    display: 'inline-flex',
    fontSize: '1rem',
    fontWeight: 400,
    gap: '1rem',
    height: '2.25rem',
    justifyContent: 'space-between',
    lineHeight: 1,
    padding: '0 1rem',
    width: '50%',
    ':hover': {
      backgroundColor: slate.slate1,
    },
    ':disabled': {
      backgroundColor: slate.slate3,
    },
    ':disabled svg': {
      opacity: 0,
    },
    ...theme.componentOverrides?.selectTrigger,
  }),
];

const selectContent = (theme: any) =>
  css({
    overflow: 'hidden',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: '0.375rem',
    boxShadow: '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
  });

const selectItem = css({
  fontSize: '1rem',
  lineHeight: 1,
  borderRadius: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  height: '1.5rem',
  padding: '0 2rem 0 2rem',
  position: 'relative',
  userSelect: 'none',
  '&[data-highlighted]': {
    backgroundColor: indigo.indigo5,
  },
  "&[data-state='checked']": {
    backgroundColor: indigo.indigo6,
  },
});

const selectViewport = css({
  padding: '0.375rem',
});

const selectLoading = css({
  fontStyle: 'italic',
  color: 'gray',
  fontSize: '14px',
});

export default {
  selectTrigger,
  selectContent,
  selectItem,
  selectViewport,
  selectLoading,
};
