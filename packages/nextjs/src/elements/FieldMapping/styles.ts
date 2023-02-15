import { css } from '@emotion/react';
import { indigo, slate } from '@radix-ui/colors';
import { ThemedStyles, _applyTheme } from '../../style/internal';
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
    padding: '1rem 1rem 1rem 0rem',
    borderRadius: '0.5rem',
    width: '30rem',
    ...theme.elementOverrides?.form,
  })
);

const formHeaderRow = _applyTheme((theme: SgTheme) =>
  css({
    display: 'flex',
    flexDirection: 'row',
    gap: '0rem',
    ...theme.elementOverrides?.formHeaderRow,
  })
);

const formColumnHeader = _applyTheme((theme: SgTheme) =>
  css({
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
    '> span:first-of-type': {
      position: 'absolute',
      right: '55%',
    },
  })
);

const fieldName = _applyTheme((theme: SgTheme) =>
  css({
    fontSize: '1rem',
    color: theme.colors.text,
    ...theme.elementOverrides?.fieldName,
  })
);

const newCustomPropertyInput = _applyTheme((theme: SgTheme) =>
  css({
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
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.inputText,
    width: '40%',
    ...theme.elementOverrides?.newCustomPropertyInput,
  })
);

const customPropertySubmitInput = _applyTheme((theme: SgTheme) =>
  css({
    display: 'none',
    ...theme.elementOverrides?.customPropertySubmitInput,
  })
);

const addCustomPropertyButton = _applyTheme((theme: SgTheme) =>
  css({
    backgroundColor: 'white',
    border: `1px solid ${indigo.indigo11}`,
    borderRadius: '0.5rem',
    color: indigo.indigo11,
    fontWeight: '500',
    marginLeft: 'auto',
    marginTop: '0.75rem',
    padding: '0.375rem 0.75rem',
    width: 'fit-content',
    ':hover': {
      backgroundColor: indigo.indigo2,
    },
    ':disabled': {
      ...theme.common.disabled,
      border: 'none',
    },
    ...theme.elementOverrides?.addCustomPropertyButton,
  })
);

const styles: ThemedStyles = {
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
