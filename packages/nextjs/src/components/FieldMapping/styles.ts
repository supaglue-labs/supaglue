import { css } from '@emotion/react';
import { gray } from '@radix-ui/colors';

const emptyContentReason = css({
  fontStyle: 'italic',
  paddingTop: '1rem',
});

const form = css({
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: '1rem',
  borderRadius: '0.5rem',
  width: '30rem',
});

const formHeaderRow = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '1rem',
});

const formColumnHeader = css({
  textDecoration: 'underline',
  width: '50%',
});

const fieldWrapper = css({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  gap: '1rem',
  justifyContent: 'space-between',
});

const fieldName = css({
  fontSize: '1rem',
});

const fieldDropdown = css({
  border: `1px solid ${gray.gray12}`,
  borderRadius: '0.5rem',
  cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  width: '50%',
});

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
