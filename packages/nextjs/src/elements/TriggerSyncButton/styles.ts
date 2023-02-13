import { css } from '@emotion/react';
import { slate } from '@radix-ui/colors';
import { ThemedStyles, _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const toast = _applyTheme((theme: SgTheme) =>
  css({
    position: 'absolute',
    zIndex: 10,
    color: 'white',
    backgroundColor: slate.slate11,
    padding: '0.25rem 0.5rem',
    display: 'block',
    left: '9rem',
    top: 0,
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    width: '100%',
    ...theme.elementOverrides?.toast,
  })
);

const styles: ThemedStyles = {
  toast,
};

export default styles;
