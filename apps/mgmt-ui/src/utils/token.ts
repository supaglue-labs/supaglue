import { IS_CLOUD } from '@/pages/api';
import { getAuth } from '@clerk/nextjs/server';
import type { GetServerSidePropsContext, NextApiRequest } from 'next';

export const getToken = async (req: NextApiRequest | GetServerSidePropsContext['req']): Promise<string | undefined> => {
  if (!IS_CLOUD) {
    return;
  }
  const { getToken } = getAuth(req);
  const token = await getToken();
  if (!token) {
    throw new Error(`Could not get token from request`);
  }
  return token;
};
