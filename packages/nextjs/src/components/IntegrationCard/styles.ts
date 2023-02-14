import { css } from '@emotion/react';
import { ThemedStyles, _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const cardIcon = _applyTheme((theme: SgTheme) =>
  css({
    ...theme.elementOverrides?.cardIcon,
  })
);

const cardName = _applyTheme((theme: SgTheme) =>
  css({
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    fontWeight: '600',
    textAlign: 'left',
    color: theme.colors.text,
    ...theme.elementOverrides?.cardName,
  })
);

const cardDescription = _applyTheme((theme: SgTheme) =>
  css({
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'left',
    fontWeight: '400',
    marginTop: '0.5rem',
    marginBottom: '1.5rem',
    color: theme.colors.textSecondary,
    ...theme.elementOverrides?.cardDescription,
  })
);

const buttonWrapper = _applyTheme((theme: SgTheme) =>
  css({
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5rem',
    ...theme.elementOverrides?.buttonWrapper,
  })
);

const styles: ThemedStyles = {
  buttonWrapper,
  cardIcon,
  cardName,
  cardDescription,
};

export default styles;
