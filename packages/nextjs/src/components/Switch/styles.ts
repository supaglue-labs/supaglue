import { css } from '@emotion/react';
import { COLORS } from '../../lib/styles';

const switchWrapper = css({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  gap: '0.5rem',
});

const switchRoot = css({
  border: '2px transparent',
  borderRadius: '9999px',
  height: '1.5625rem',
  overflow: 'hidden',
  padding: 0,
  transition: 'background-color 100ms',
  whiteSpace: 'nowrap',
  width: '2.625rem',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&:focus-visible': {
    boxShadow: `0 0 0 2px ${COLORS.INDIGO_12}`,
  },
});

const switchRootOn = css([
  switchRoot,
  {
    backgroundColor: COLORS.SLATE_9,
  },
]);

const switchRootOff = css([
  switchRoot,
  {
    backgroundColor: COLORS.SLATE_7,
  },
]);

const switchThumb = css({
  backgroundColor: 'white',
  borderRadius: '9999px',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  display: 'block',
  flexShrink: 0,
  height: '1.3125rem',
  transform: 'translateX(0.125rem)',
  transition: 'transform 100ms',
  width: '1.3125rem',
  "&[data-state='checked']": {
    transform: 'translateX(1.1875rem)',
  },
});

export const styles = {
  switchWrapper,
  switchRootOn,
  switchRootOff,
  switchThumb,
};
