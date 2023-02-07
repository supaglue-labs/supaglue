import { css } from '@emotion/react';
import { _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

// TODO: Move most of these over to Card primitive
const card = _applyTheme((theme: SgTheme) =>
  css({
    borderRadius: '0.5rem',
    borderWidth: '1px',
    padding: '1rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: theme.colors.background,
    ...theme.elementOverrides?.card,
  })
);

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
  card,
  cardName,
  cardDescription,
};

export default styles;
