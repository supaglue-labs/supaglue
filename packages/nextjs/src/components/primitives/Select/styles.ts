import { css } from '@emotion/react';
import { indigo, slate } from '@radix-ui/colors';
import { _applyTheme } from '../../../style/internal';
import { SgTheme } from '../../../style/types/theme';

const selectTrigger = _applyTheme((theme: SgTheme) =>
  css({
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.inputText,
    display: 'inline-flex',
    fontSize: '1rem',
    fontWeight: 400,
    gap: '1rem',
    height: '2.25rem',
    justifyContent: 'space-between',
    lineHeight: 1,
    width: '50%',
    border: `1px solid ${slate.slate9}`,
    borderRadius: '0.5rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    ':hover': {
      backgroundColor: slate.slate1,
    },
    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: slate.slate3,
    },
    ':disabled svg': {
      cursor: 'not-allowed',
      opacity: 0,
    },
    ...theme.elementOverrides?.selectTrigger,
  })
);

const selectContent = _applyTheme((theme: SgTheme) =>
  css({
    overflow: 'hidden',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: '0.375rem',
    boxShadow: '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
    ...theme.elementOverrides?.selectContent,
  })
);

const selectItem = _applyTheme((theme: SgTheme) =>
  css({
    fontSize: '1rem',
    lineHeight: 1,
    borderRadius: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    height: '1.5rem',
    padding: '0 2rem 0 2rem',
    position: 'relative',
    userSelect: 'none',
    color: theme.colors.text,
    '&[data-highlighted]': {
      backgroundColor: indigo.indigo5,
      ...theme.elementOverrides?.selectItem?.highlighted,
    },
    "&[data-state='checked']": {
      backgroundColor: indigo.indigo6,
      ...theme.elementOverrides?.selectItem?.selected,
    },
    ...theme.elementOverrides?.selectItem,
  })
);

const selectViewport = _applyTheme((theme: SgTheme) =>
  css({
    padding: '0.375rem',
    ...theme.elementOverrides?.selectViewport,
  })
);

const selectLoading = _applyTheme((theme: SgTheme) =>
  css({
    fontStyle: 'italic',
    color: 'gray',
    fontSize: '14px',
    ...theme.elementOverrides?.selectLoading,
  })
);

const styles = {
  selectTrigger,
  selectContent,
  selectItem,
  selectViewport,
  selectLoading,
};

export default styles;
