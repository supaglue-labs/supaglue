import { css } from '@emotion/react';
import { COLORS } from '../../lib/styles';
import buttonStyles from '../Button/styles';

const selectTrigger = css(buttonStyles.button, {
  backgroundColor: 'white',
  color: COLORS.SLATE_12,
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
    backgroundColor: COLORS.SLATE_1,
  },
  ':disabled': {
    backgroundColor: COLORS.SLATE_3,
  },
  ':disabled svg': {
    opacity: 0,
  },
});

const selectContent = css({
  overflow: 'hidden',
  backgroundColor: 'white',
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
    backgroundColor: COLORS.INDIGO_5,
  },
  "&[data-state='checked']": {
    backgroundColor: COLORS.INDIGO_6,
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
