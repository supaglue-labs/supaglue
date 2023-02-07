import { css } from '@emotion/react';
import { gray } from '@radix-ui/colors';
import { _applyTheme } from '../../style/internal';
import { SgTheme } from '../../style/types/theme';

const emptyContentReason = _applyTheme((theme: SgTheme) =>
  css({
    fontStyle: 'italic',
    paddingTop: '1rem',
    ...theme.elementOverrides?.emptyContentReason,
  })
);

const form = _applyTheme((theme: SgTheme) =>
  css({
    backgroundColor: theme.colors.background,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    width: '30rem',
    ...theme.elementOverrides?.form,
  })
);

const formHeaderRow = _applyTheme((theme: SgTheme) =>
  css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    ...theme.elementOverrides?.formHeaderRow,
  })
);

const formColumnHeader = _applyTheme((theme: SgTheme) =>
  css({
    textDecoration: 'underline',
    color: theme.colors.text,
    width: '50%',
    ...theme.elementOverrides?.formColumnHeader,
  })
);

const fieldWrapper = _applyTheme((theme: SgTheme) =>
  css({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    justifyContent: 'space-between',
    ...theme.elementOverrides?.fieldWrapper,
  })
);

const fieldName = _applyTheme((theme: SgTheme) =>
  css({
    fontSize: '1rem',
    color: theme.colors.text,
    ...theme.elementOverrides?.fieldName,
  })
);

const fieldDropdown = _applyTheme((theme: SgTheme) =>
  css({
    border: `1px solid ${gray.gray12}`,
    borderRadius: '0.5rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    width: '50%',
    ...theme.elementOverrides?.fieldDropdown,
  })
);

const styles = {
  emptyContentReason,
  form,
  formHeaderRow,
  formColumnHeader,
  fieldWrapper,
  fieldName,
  fieldDropdown,
};

export default styles;
