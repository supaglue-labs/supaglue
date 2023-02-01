import { css } from '@emotion/react';
import { COLORS } from '../../lib/styles';

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
    backgroundColor: COLORS.INDIGO_9,
    ':hover': {
      backgroundColor: COLORS.INDIGO_10,
    },
    ':focus-visible': {
      boxShadow: COLORS.INDIGO_12,
    },
    ':disabled': {
      backgroundColor: COLORS.SLATE_8,
    },
  }),
};
