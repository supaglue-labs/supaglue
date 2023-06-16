import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const result = await fetch(`${API_HOST}/internal/destinations/_test`, {
    method: 'POST',
    headers: getApplicationIdScopedHeaders(req),
    body: JSON.stringify(req.body),
  });

  if (!result.ok) {
    return res.status(result.status).json(await result.json());
  }

  const r = await result.json();

  return res.status(200).json(r);
}
