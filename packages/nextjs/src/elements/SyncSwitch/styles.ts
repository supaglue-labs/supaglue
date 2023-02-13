import { css } from '@emotion/react';
import { ThemedStyles, _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const switchlabel = _applyTheme((theme: SgTheme) =>
  css({
    color: theme.colors.text,
    ...theme.elementOverrides?.switchWrapper,
  })
);

const switchWrapper = _applyTheme((theme: SgTheme) =>
  css({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5rem',
    ...theme.elementOverrides?.switchWrapper,
  })
);

const switchDescription = _applyTheme((theme: SgTheme) =>
  css({
    color: theme.colors.textSecondary,
    fontSize: '0.875rem',
    padding: '0.5rem 0',
  })
);

const styles: ThemedStyles = {
  switchlabel,
  switchWrapper,
  switchDescription,
};

export default styles;
