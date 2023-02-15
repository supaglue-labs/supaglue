import { css } from '@emotion/react';
import { ThemedStyles, _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const card = _applyTheme((theme: SgTheme) =>
  css({
    borderRadius: '0.5rem',
    borderWidth: '1px',
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    backgroundColor: theme.colors.background,
    ...theme.elementOverrides?.card,
  })
);

const styles: ThemedStyles = {
  card,
};

export default styles;
