import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ API_HOST: string }>) {
  return res.status(200).json({
    API_HOST,
  });
}
