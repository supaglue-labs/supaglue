import { css, Theme } from '@emotion/react';
import { indigo, slate } from '@radix-ui/colors';

const switchWrapper = (theme: Theme) =>
  css({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5rem',
    ...theme.elements?.switchWrapper,
  });

const _switchRoot = (theme: Theme) =>
  css({
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
      boxShadow: `0 0 0 2px ${indigo.indigo12}`,
    },
  });

const switchRootOn = (theme: Theme) => [
  _switchRoot,
  css({
    backgroundColor: theme.colors.primary.base,
    ...theme.elements?.switchRootOn,
  }),
];

const switchRootOff = (theme: Theme) => [
  _switchRoot,
  css({
    backgroundColor: slate.slate7,
    ...theme.elements?.switchRootOff,
  }),
];

const switchThumb = (theme: Theme) =>
  css({
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
    ...theme.elements?.switchThumb,
  });

const switchDescription = css({
  color: slate.slate11,
  fontSize: '0.875rem',
  padding: '0.5rem 0',
});

export const styles = {
  switchWrapper,
  switchRootOn,
  switchRootOff,
  switchThumb,
  switchDescription,
};
