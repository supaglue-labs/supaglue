import { NextApiRequest } from 'next';
import { getToken } from 'next-auth/jwt';

export const getCustomerIdFromRequest = async (req: NextApiRequest): Promise<string | undefined | null> => {
  const token = await getToken({ req });
  return token?.name;
};
