import { Typography } from '@mui/material';
import Link from 'next/link';

export function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://supaglue.com/">
        Supergrain, Inc.
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}
