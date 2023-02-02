import { css } from '@emotion/react';

const card = css({
  borderRadius: '0.5rem',
  borderWidth: '1px',
  padding: '1rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
});

const name = css({
  fontSize: '1.125rem',
  lineHeight: '1.75rem',
  fontWeight: '600',
  textAlign: 'center',
});

const description = css({
  fontSize: '1rem',
  lineHeight: '1.25rem',
  textAlign: 'center',
});

export default {
  card,
  name,
  description,
};
