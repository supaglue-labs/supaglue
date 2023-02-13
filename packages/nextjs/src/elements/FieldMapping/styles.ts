import { css } from '@emotion/react';
import { indigo, slate } from '@radix-ui/colors';
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
    position: 'relative',
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

const newCustomPropertyInput = css({
  border: `1px solid ${slate.slate9}`,
  borderRadius: '0.5rem',
  height: '2.25rem',
  lineHeight: 1,
  padding: '0.25rem 0.5rem',
  ':focus': {
    boxShadow: 'none',
  },
  ':focus-visible': {
    boxShadow: `0 0 0 2px ${indigo.indigo12}`,
  },
});

const customPropertySubmitInput = css({
  display: 'none',
});

const addCustomPropertyButton = css({
  backgroundColor: 'white',
  border: 'none',
  color: slate.slate11,
  marginTop: '1rem',
  textAlign: 'start',
});

const styles = {
  addCustomPropertyButton,
  customPropertySubmitInput,
  emptyContentReason,
  form,
  formHeaderRow,
  formColumnHeader,
  fieldWrapper,
  fieldName,
  newCustomPropertyInput,
};

export default styles;
