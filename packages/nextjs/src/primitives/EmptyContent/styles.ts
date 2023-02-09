import { css } from '@emotion/react';
import { _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const emptyContent = _applyTheme((theme: SgTheme) =>
  css({
    fontStyle: 'italic',
    ...theme.elementOverrides?.emptyContentReason,
  })
);

export default {
  emptyContent,
};
