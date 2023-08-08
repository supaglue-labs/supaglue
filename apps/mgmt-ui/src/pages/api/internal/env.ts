import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST, IS_CLOUD } from '..';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    API_HOST: string;
    IS_CLOUD: boolean;
    CLERK_ACCOUNT_URL: string;
    CLERK_ORGANIZATION_URL: string;
  }>
) {
  const CLERK_ACCOUNT_URL =
    API_HOST === 'https://api.supaglue.io'
      ? 'https://accounts.supaglue.io/user'
      : 'https://witty-eft-29.accounts.dev/user';

  const CLERK_ORGANIZATION_URL =
    API_HOST === 'https://api.supaglue.io'
      ? 'https://accounts.supaglue.io/user'
      : 'https://witty-eft-29.accounts.dev/user';

  return res.status(200).json({
    API_HOST,
    IS_CLOUD,
    CLERK_ACCOUNT_URL,
    CLERK_ORGANIZATION_URL,
  });
}
