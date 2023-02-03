import { css, Theme } from '@emotion/react';

const card = (theme: Theme) =>
  css({
    borderRadius: '0.5rem',
    borderWidth: '1px',
    padding: '1rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: theme.colors.background,
    ...theme.componentOverrides?.card,
  });

const cardName = (theme: Theme) =>
  css({
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text,
    ...theme.componentOverrides?.cardName,
  });

const cardDescription = (theme: Theme) =>
  css({
    fontSize: '1rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    fontWeight: '400',
    color: theme.colors.textSecondary,
    ...theme.componentOverrides?.cardDescription,
  });

export default {
  card,
  cardName,
  cardDescription,
};
