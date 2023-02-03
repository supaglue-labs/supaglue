import { css, Theme } from '@emotion/react';
import { gray } from '@radix-ui/colors';

const emptyContentReason = (theme: Theme) =>
  css({
    fontStyle: 'italic',
    paddingTop: '1rem',
    ...theme.elements?.emptyContentReason,
  });

const form = (theme: Theme) =>
  css({
    backgroundColor: theme.colors.background,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    width: '30rem',
    ...theme.elements?.form,
  });

const formHeaderRow = (theme: Theme) =>
  css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    ...theme.elements?.formHeaderRow,
  });

const formColumnHeader = (theme: Theme) =>
  css({
    textDecoration: 'underline',
    color: theme.colors.text,
    width: '50%',
    ...theme.elements?.formColumnHeader,
  });

const fieldWrapper = (theme: Theme) =>
  css({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    justifyContent: 'space-between',
    ...theme.elements?.fieldWrapper,
  });

const fieldName = (theme: Theme) =>
  css({
    fontSize: '1rem',
    color: theme.colors.text,
    ...theme.elements?.fieldName,
  });

const fieldDropdown = (theme: Theme) =>
  css({
    border: `1px solid ${gray.gray12}`,
    borderRadius: '0.5rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    width: '50%',
    ...theme.elements?.fieldDropdown,
  });

export default {
  emptyContentReason,
  form,
  formHeaderRow,
  formColumnHeader,
  fieldWrapper,
  fieldName,
  fieldDropdown,
};
