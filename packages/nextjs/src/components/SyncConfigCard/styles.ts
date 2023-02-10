import { css } from '@emotion/react';
import cardStyles from '../../primitives/Card/styles';
import { _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const card = _applyTheme((theme: SgTheme) => [
  cardStyles.card,
  css({
    alignItems: 'start',
    ...theme.elementOverrides?.card,
  }),
]);

const styles = {
  card,
};

export default styles;
