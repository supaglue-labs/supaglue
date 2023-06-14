import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST, IS_CLOUD } from '..';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ API_HOST: string; IS_CLOUD: boolean }>
) {
  return res.status(200).json({
    API_HOST,
    IS_CLOUD,
  });
}
