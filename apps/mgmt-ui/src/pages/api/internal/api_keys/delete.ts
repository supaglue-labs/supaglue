import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

// Note: we currently don't define api key endpoints (it's the only one is used internally with not public api)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const result = await fetch(`${API_HOST}/internal/v1/api_keys/_revoke_api_key`, {
    method: 'POST',
    headers: getApplicationIdScopedHeaders(req),
  });

  if (!result.ok) {
    return res.status(500).json({ error: 'Failed to delete' });
  }

  const r = await result.json();

  return res.status(200).json(r);
}
