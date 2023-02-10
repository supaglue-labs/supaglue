import { css } from '@emotion/react';
import { _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const cardName = _applyTheme((theme: SgTheme) =>
  css({
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text,
    ...theme.elementOverrides?.cardName,
  })
);

const cardDescription = _applyTheme((theme: SgTheme) =>
  css({
    fontSize: '1rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    fontWeight: '400',
    color: theme.colors.textSecondary,
    ...theme.elementOverrides?.cardDescription,
  })
);

const buttonWrapper = _applyTheme((theme: SgTheme) =>
  css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    ...theme.elementOverrides?.buttonWrapper,
  })
);

const styles = {
  buttonWrapper,
  cardName,
  cardDescription,
};

export default styles;
