import { css } from '@emotion/react';

const card = (theme: any) =>
  css({
    borderRadius: '0.5rem',
    borderWidth: '1px',
    padding: '1rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: theme.colors.background,
  });

const name = (theme: any) =>
  css({
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text,
  });

const description = (theme: any) =>
  css({
    fontSize: '1rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    fontWeight: '400',
    color: theme.colors.textSecondary,
  });

export default {
  card,
  name,
  description,
};
