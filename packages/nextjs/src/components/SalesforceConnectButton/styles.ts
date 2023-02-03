import { css, Theme } from '@emotion/react';
import buttonStyles from '../Button/styles';

export default {
  salesforceButton: (theme: Theme) => [
    buttonStyles.button,
    css({
      width: '8rem',
      ...theme.elements?.salesforceButton,
    }),
  ],
};
