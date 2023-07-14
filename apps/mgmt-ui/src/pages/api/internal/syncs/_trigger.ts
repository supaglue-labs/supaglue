import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const result = await fetch(`${API_HOST}/internal/syncs/_trigger`, {
    method: 'POST',
    headers: {
      ...getApplicationIdScopedHeaders(req),
      'x-customer-id': req.headers['x-customer-id'] as string,
      'x-provider-name': req.headers['x-provider-name'] as string,
    },
    body: JSON.stringify(req.body),
  });

  const r = await result.json();
  if (!result.ok) {
    return res.status(result.status).json(r);
  }

  return res.status(200).json(r);
}
