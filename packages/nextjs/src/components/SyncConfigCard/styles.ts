import { css } from '@emotion/react';
import cardStyles from '../../primitives/Card/styles';
import { ThemedStyles, _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const card = _applyTheme((theme: SgTheme) => [
  cardStyles.card,
  css({
    alignItems: 'start',
    width: '40rem',
    ...theme.elementOverrides?.card,
  }),
]);

const styles: ThemedStyles = {
  card,
};

export default styles;
