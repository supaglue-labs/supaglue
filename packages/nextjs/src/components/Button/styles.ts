import { css } from '@emotion/react';
import { indigo, slate } from '@radix-ui/colors';

export default {
  button: css({
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
    ':disabled': {
      backgroundColor: slate.slate8,
    },
  }),
};
