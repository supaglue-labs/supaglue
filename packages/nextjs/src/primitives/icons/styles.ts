import { css } from '@emotion/react';
import { slate } from '@radix-ui/colors';
import { ThemedStyles, _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const xIcon = _applyTheme((theme: SgTheme) =>
  css({
    color: slate.slate9,
    ...theme.elementOverrides?.xIcon,
  })
);

const styles: ThemedStyles = {
  xIcon,
};

export default styles;
