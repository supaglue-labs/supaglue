import { css } from '@emotion/react';
import { indigo, red, slate } from '@radix-ui/colors';

const disabledStyles = {
  backgroundColor: slate.slate8,
  color: slate.slate1,
  cursor: 'auto',
};

const button = css({
  alignItems: 'center',
  borderRadius: '0.5rem',
  color: 'white',
  display: 'flex',
  fontSize: '0.875rem',
  fontWeight: '500',
  lineHeight: '1.25rem',
  justifyContent: 'center',
  padding: '0.5rem 0.75rem',
  width: 'fit-content',
  backgroundColor: indigo.indigo9,
  ':hover': {
    backgroundColor: indigo.indigo10,
  },
  ':focus-visible': {
    boxShadow: indigo.indigo12,
  },
  ':disabled': disabledStyles,
  ':disabled:hover': disabledStyles,
});

const destructiveButton = css(button, {
  backgroundColor: red.red9,
  ':hover': {
    backgroundColor: red.red10,
  },
});

const styles = {
  button,
  destructiveButton,
};

export default styles;
