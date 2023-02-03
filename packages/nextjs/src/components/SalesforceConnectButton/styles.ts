import { css } from '@emotion/react';
import buttonStyles from '../Button/styles';

export default {
  button: (theme: any) => [
    buttonStyles.button,
    css({
      width: '8rem',
    }),
  ],
};
